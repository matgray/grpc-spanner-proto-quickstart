package dev.mgray.server.service.customer;

import static com.google.cloud.ByteArray.copyFrom;
import static dev.mgray.server.service.customer.CustomerServiceGrpc.*;
import static dev.mgray.server.service.customer.SessionIdGenerator.generateRandomSessionId;

import com.google.cloud.spanner.*;
import com.google.protobuf.InvalidProtocolBufferException;
import dev.mgray.db.schema.customer.CustomerSchema;
import dev.mgray.schema.customer.CustomerInfo;
import dev.mgray.schema.customer.Security;
import dev.mgray.schema.customer.Session;
import dev.mgray.server.service.customer.CustomerServiceOuterClass.*;
import io.grpc.stub.StreamObserver;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class CustomerServiceImpl extends CustomerServiceImplBase {
    private static final String INSERT_CUSTOMER_SQL =
            String.format("INSERT INTO Customer (%s, %s, %s) VALUES (@user_name, @info, @security) THEN RETURN %s", CustomerSchema.USER_NAME, CustomerSchema.INFO, CustomerSchema.SECURITY, CustomerSchema.CUSTOMER_ID);
    private static final String INSERT_SESSION_SQL =
            String.format("INSERT INTO Customer (%s) VALUES (@session) WHERE %s=@customerId", CustomerSchema.SESSION, CustomerSchema.CUSTOMER_ID);

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

    private LoginResponse login(LoginRequest request) throws InvalidProtocolBufferException {
        if (request.hasUsernamePassword()) {
            Statement stmt = Statement.newBuilder(String.format("SELECT %s, %s, %s FROM Customer WHERE %s = @userName", CustomerSchema.CUSTOMER_ID, CustomerSchema.INFO, CustomerSchema.SECURITY, CustomerSchema.USER_NAME))
                    .bind("userName").to(request.getUsernamePassword().getUserName())
                    .build();
            try (ResultSet rs = dbClient.singleUse().executeQuery(stmt)) {
                if (rs.next()) {
                    Security security = rs.getProtoMessage(CustomerSchema.SECURITY, Security.getDefaultInstance());
                    if (!security.getPassword().equals(hashPassword(request.getUsernamePassword().getPassword(), security.getSalt()))) {
                        return LoginResponse.newBuilder()
                                .setErrorCode(LoginErrorCode.INVALID_CREDENTIALS)
                                .build();
                    }
                    long customerId = rs.getLong(CustomerSchema.CUSTOMER_ID);
                    return LoginResponse.newBuilder()
                            .setCustomerId(customerId)
                            .setSession(newSession(customerId))
                            .build();
                }
            }
        }
        return null;
    }

    // Extracted method for better readability and reuse
    private long insertCustomerAndReturnId(CustomerInfo customerInfo, String password) throws SpannerException {
        String salt = generateSalt();
        Security.Builder s = Security.newBuilder();
        s.setSalt(salt);
        s.setPassword(hashPassword(password, salt));

            return dbClient.readWriteTransaction().run(transaction -> {
                Statement statement = Statement.newBuilder(INSERT_CUSTOMER_SQL)
                        .bind("user_name").to(customerInfo.getUserName())
                        .bind("info").to(customerInfo)
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
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes()); // Add salt to the hash
            byte[] hashedPasswordBytes = md.digest(password.getBytes());

            // Convert byte array to a hexadecimal string
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedPasswordBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    private Session newSession(long customerId) {
        Session s = Session.newBuilder().setSessionId(generateRandomSessionId(32)).build();
        dbClient.readWriteTransaction().run(tx -> {
            Statement statement = Statement.newBuilder(INSERT_SESSION_SQL)
                    .bind("customerId").to(customerId).build();
            tx.executeQuery(statement);
            return null;
        });
        return s;
    }
}
