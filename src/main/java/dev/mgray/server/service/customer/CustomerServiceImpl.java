package dev.mgray.server.service.customer;

import static com.google.protobuf.util.Timestamps.fromMillis;
import static dev.mgray.server.service.customer.CustomerServiceGrpc.*;
import static dev.mgray.server.service.customer.SessionIdGenerator.generateRandomSessionId;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ErrorCode;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerException;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import com.google.protobuf.InvalidProtocolBufferException;
import dev.mgray.db.schema.customer.CustomerSchema;
import dev.mgray.schema.customer.CustomerInfo;
import dev.mgray.schema.customer.Security;
import dev.mgray.schema.customer.Session;
import dev.mgray.server.service.customer.CustomerServiceOuterClass.*;
import dev.mgray.server.service.customer.CustomerServiceOuterClass.SessionValidationResponse;
import dev.mgray.server.service.customer.CustomerServiceOuterClass.ValidationStatus;
import io.grpc.stub.StreamObserver;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

public class CustomerServiceImpl extends CustomerServiceImplBase {
    private static final String INSERT_CUSTOMER_SQL =
            String.format("INSERT INTO Customer (%s, %s, %s) VALUES (@user_name, @info, @security) THEN RETURN %s", CustomerSchema.USER_NAME, CustomerSchema.INFO, CustomerSchema.SECURITY, CustomerSchema.CUSTOMER_ID);
    private static final String UPDATE_SESSION_SQL =
            String.format("UPDATE Customer SET %s = @session WHERE %s = @customerId", CustomerSchema.SESSION, CustomerSchema.CUSTOMER_ID);

    // The hashing algorithm to use. PBKDF2 with HMAC-SHA256 is a widely used and recommended standard for password hashing.
    private static final String HASH_ALGORITHM = "PBKDF2WithHmacSHA256";
    // The number of iterations for the hashing function. 65536 is a good starting point.
    // The number of iterations should be as high as possible without causing a noticeable delay for the user.
    private static final int HASH_ITERATIONS = 65536;
    // The desired length of the generated hash. 256 bits is a good length for SHA-256.
    private static final int HASH_KEY_LENGTH = 256;

    private final DatabaseClient dbClient;

    public CustomerServiceImpl() {
        String spannerHost = System.getenv("SPANNER_EMULATOR_HOST");
        if (spannerHost == null) {
            spannerHost = "localhost:9010";
        }

        SpannerOptions options = SpannerOptions.newBuilder()
                .setEmulatorHost(spannerHost)
                .setProjectId("test-project")
                .build();
        Spanner spanner = options.getService();

        String projectId = "test-project";
        String instanceId = "test-instance";
        String databaseId = "test-db";
        DatabaseId db = DatabaseId.of(projectId, instanceId, databaseId);
        this.dbClient = spanner.getDatabaseClient(db);
    }

    @Override
    public void addCustomer(AddCustomerRequest request, StreamObserver<LoginResponse> responseObserver) {
        final CustomerInfo customerInfo = request.getCustomerInfo();
        LoginResponse resp;
        try {
            insertCustomerAndReturnId(customerInfo, request.getPassword());
            resp = login(
                    LoginRequest.newBuilder()
                            .setUsernamePassword(UserNamePasswordBundle.newBuilder()
                                    .setUserName(request.getCustomerInfo().getUserName())
                                    .setPassword(request.getPassword()))
                            .build());
        } catch (SpannerException se) {
            if (se.getErrorCode() == ErrorCode.ALREADY_EXISTS) {
                resp = LoginResponse.newBuilder().setErrorCode(LoginErrorCode.USER_NAME_ALREADY_IN_USE).build();
            } else {
                resp = LoginResponse.newBuilder().setErrorCode(LoginErrorCode.UNKNOWN).build();
                se.printStackTrace();
            }
        } catch (Exception e) {
            resp = LoginResponse.newBuilder().setErrorCode(LoginErrorCode.UNKNOWN).build();
            e.printStackTrace();
        }
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void login(LoginRequest request, StreamObserver<LoginResponse> responseObserver) {
        if (request.hasUsernamePassword()) {
            try {
                LoginResponse resp = login(request);
                responseObserver.onNext(resp);
            } catch (Exception e) {
                e.printStackTrace();
                responseObserver.onNext(LoginResponse.newBuilder().setErrorCode(LoginErrorCode.UNKNOWN).build());
            }
        }
        responseObserver.onCompleted();
    }

    @Override
    public void validateSession(Session request, StreamObserver<SessionValidationResponse> responseObserver) {
        SessionValidationResponse.Builder responseBuilder = SessionValidationResponse.newBuilder();
        try {
            Statement stmt = Statement.newBuilder(String.format("SELECT %s FROM Customer WHERE %s.session_id = @sessionId", CustomerSchema.CUSTOMER_ID, CustomerSchema.SESSION))
                    .bind("sessionId").to(request.getSessionId())
                    .build();

            try (ResultSet rs = dbClient.singleUse().executeQuery(stmt)) {
                if (rs.next()) {
                    // A customer with this session ID was found
                    responseBuilder.setStatus(ValidationStatus.VALID);
                } else {
                    // No customer with this session ID was found
                    responseBuilder.setStatus(ValidationStatus.INVALID);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseBuilder.setStatus(ValidationStatus.VALIDATION_UNKNOWN);
        } finally {
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        }
    }

    private LoginResponse login(LoginRequest request) throws InvalidProtocolBufferException {
        if (request.hasUsernamePassword()) {
            Statement stmt = Statement.newBuilder(String.format("SELECT %s, %s, %s FROM Customer WHERE %s = @userName", CustomerSchema.CUSTOMER_ID, CustomerSchema.INFO, CustomerSchema.SECURITY, CustomerSchema.USER_NAME))
                    .bind("userName").to(request.getUsernamePassword().getUserName())
                    .build();
            try (ResultSet rs = dbClient.singleUse().executeQuery(stmt)) {
                if (rs.next()) {
                    Security security = rs.getProtoMessage(CustomerSchema.SECURITY, Security.getDefaultInstance());
                    String hashedPassword = hashPassword(request.getUsernamePassword().getPassword(), security.getSalt());
                    if (!MessageDigest.isEqual(hashedPassword.getBytes(), security.getPassword().getBytes())) {
                        return LoginResponse.newBuilder()
                                .setErrorCode(LoginErrorCode.INVALID_CREDENTIALS)
                                .build();
                    }
                    long customerId = rs.getLong(CustomerSchema.CUSTOMER_ID);
                    Session session = newSession(customerId);
                    return LoginResponse.newBuilder()
                            .setCustomerId(customerId)
                            .setSession(session)
                            .build();
                }
            }
              return LoginResponse.newBuilder()
                .setErrorCode(LoginErrorCode.CUSTOMER_DOES_NOT_EXIST)
                .build();
        }
        return LoginResponse.newBuilder()
                .setErrorCode(LoginErrorCode.CUSTOMER_DOES_NOT_EXIST)
                .build();
    }

    // Extracted method for better readability and reuse
    private long insertCustomerAndReturnId(CustomerInfo customerInfo, String password) throws SpannerException {
        String salt = generateSalt();
        Security.Builder s = Security.newBuilder();
        s.setSalt(salt);
        s.setPassword(hashPassword(password, salt));

        CustomerInfo customerInfoWithTimestamp = customerInfo.toBuilder()
                .setCreateTime(fromMillis(System.currentTimeMillis()))
                .build();

            return dbClient.readWriteTransaction().run(transaction -> {
                Statement statement = Statement.newBuilder(INSERT_CUSTOMER_SQL)
                        .bind("user_name").to(customerInfoWithTimestamp.getUserName())
                        .bind("info").to(customerInfoWithTimestamp)
                        .bind("security").to(s.build())
                        .build();
                try (ResultSet resultSet = transaction.executeQuery(statement)) {
                    if (resultSet.next()) {
                        return resultSet.getLong(0);
                    } else {
                        throw new RuntimeException("Failed to retrieve generated CustomerId");
                    }
                }
            });
    }

    private static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16]; // 16 bytes for a good salt
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private static String hashPassword(String password, String salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), HASH_ITERATIONS, HASH_KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(HASH_ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            e.printStackTrace();
            return null;
        }
    }

    private Session newSession(long customerId) {
        Session s = Session.newBuilder().setSessionId(generateRandomSessionId(32)).build();
        dbClient.readWriteTransaction().run(tx -> {
            Statement statement = Statement.newBuilder(UPDATE_SESSION_SQL)
                    .bind("customerId").to(customerId)
                    .bind("session").to(s)
                    .build();
            tx.executeUpdate(statement);
            return null;
        });
        return s;
    }
}
