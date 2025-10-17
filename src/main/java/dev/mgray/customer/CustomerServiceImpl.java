package dev.mgray.customer;

import static com.google.cloud.ByteArray.copyFrom;
import static dev.mgray.CustomerService.CustomerServiceOuterClass.*;
import static dev.mgray.customer.SessionIdGenerator.generateRandomSessionId;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.ErrorCode;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerException;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;
import dev.mgray.CustomerService.CustomerServiceGrpc;
import dev.mgray.schema.customer.CustomerInfo;
import dev.mgray.schema.customer.Session;
import io.grpc.stub.StreamObserver;

public class CustomerServiceImpl extends CustomerServiceGrpc.CustomerServiceImplBase {
    private static final String INSERT_CUSTOMER_SQL =
            "INSERT INTO Customer (UserName, Info) VALUES (@user_name, @info) THEN RETURN CustomerId";
    private static final String INSERT_SESSION_SQL =
            "INSERT INTO Customer (Session) VALUES (@session) WHERE CustomerId=@customerId";

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
            insertCustomerAndReturnId(customerInfo);
            resp = login(
                    LoginRequest.newBuilder()
                            .setUsernamePassword(UserNamePasswordBundle.newBuilder()
                                    .setUserName(request.getCustomerInfo().getUserName())
                                    .setPassword(request.getCustomerInfo().getPassword()))
                            .build());
        } catch (SpannerException se) {
            if (se.getErrorCode() == ErrorCode.ALREADY_EXISTS) {
                resp = LoginResponse.newBuilder().setErrorCode(LoginErrorCode.USER_NAME_ALREADY_IN_USE).build();
            } else {
                resp = LoginResponse.newBuilder().setErrorCode(LoginErrorCode.UNKNOWN).build();
            }
        }
        responseObserver.onNext(resp);
        responseObserver.onCompleted();
    }

    @Override
    public void login(LoginRequest request, StreamObserver<LoginResponse> responseObserver) {
        if (request.hasUsernamePassword()) {
            Statement stmt = Statement.newBuilder("SELECT CustomerId, Info FROM Customer WHERE UserName = @userName")
                    .bind("userName").to(request.getUsernamePassword().getUserName())
                    .build();
            try (ResultSet rs = dbClient.singleUse().executeQuery(stmt)) {
                if (rs.next()) {
                    long customerId = rs.getLong("CustomerId");
                    responseObserver.onNext(LoginResponse.newBuilder().setCustomerId(customerId).setSession(newSession(customerId)).build());
                }
            }
        }
        responseObserver.onCompleted();
    }

    private LoginResponse login(LoginRequest request) {
        if (request.hasUsernamePassword()) {
            Statement stmt = Statement.newBuilder("SELECT CustomerId, Info FROM Customer WHERE UserName = @userName")
                    .bind("userName").to(request.getUsernamePassword().getUserName())
                    .build();
            try (ResultSet rs = dbClient.singleUse().executeQuery(stmt)) {
                if (rs.next()) {
                    long customerId = rs.getLong("CustomerId");
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
    private long insertCustomerAndReturnId(CustomerInfo customerInfo) throws SpannerException {
            return dbClient.readWriteTransaction().run(transaction -> {
                Statement statement = Statement.newBuilder(INSERT_CUSTOMER_SQL)
                        .bind("user_name").to(customerInfo.getUserName())
                        .bind("info").to(copyFrom(customerInfo.toByteArray()))
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
