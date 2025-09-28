package dev.mgray.customer;

import com.google.cloud.ByteArray;
import com.google.cloud.spanner.*;
import com.google.common.collect.ImmutableList;
import dev.mgray.customer.AddCustomerRequest;
import dev.mgray.customer.AddCustomerResponse;
import dev.mgray.customer.CustomerInfo;
import dev.mgray.customer.CustomerServiceGrpc;
import io.grpc.stub.StreamObserver;
import java.util.Collections;

public class CustomerServiceImpl extends CustomerServiceGrpc.CustomerServiceImplBase {

  private final DatabaseClient dbClient;

  public CustomerServiceImpl() {
    SpannerOptions options = SpannerOptions.newBuilder()
        .setEmulatorHost("localhost:9010")
        .build();
    Spanner spanner = options.getService();

    String projectId = "test-project";
    String instanceId = "test-instance";
    String databaseId = "test-db";
    DatabaseId db = DatabaseId.of(projectId, instanceId, databaseId);
    this.dbClient = spanner.getDatabaseClient(db);
  }

  @Override
  public void addCustomer(AddCustomerRequest request, StreamObserver<AddCustomerResponse> responseObserver) {
    final CustomerInfo customerInfo = request.getCustomerInfo();
    long customerId = dbClient.readWriteTransaction().run(transaction -> {
      String sql = "INSERT INTO Customer (Info) VALUES (@info) THEN RETURN CustomerId";
      com.google.cloud.spanner.Statement statement = com.google.cloud.spanner.Statement.newBuilder(sql)
          .bind("info").to(com.google.cloud.ByteArray.copyFrom(customerInfo.toByteArray()))
          .build();
      try (com.google.cloud.spanner.ResultSet resultSet = transaction.executeQuery(statement)) {
        if (resultSet.next()) {
          return resultSet.getLong(0);
        } else {
          throw new RuntimeException("Failed to retrieve generated CustomerId");
        }
      }
    });

    AddCustomerResponse response = AddCustomerResponse.newBuilder().setCustomerId(customerId).build();
    responseObserver.onNext(response);
    responseObserver.onCompleted();
  }
}
