# Simple gRPC Server

This project contains a simple gRPC server that adds a customer to a Spanner database.

## Prerequisites

*   Java 11 or higher
*   Maven
*   Google Cloud SDK

## Setup

1.  **Set up Spanner Emulator**

    Follow the instructions [here](https://cloud.google.com/spanner/docs/emulator) to set up the Spanner emulator.

    ```bash
    docker run -p 9010:9010 -p 9020:9020 gcr.io/cloud-spanner-emulator/emulator
    ```

2.  **Populate the Spanner database**

    ```bash
    ./db/populate_db.sh
    ```

## Build and Run

1.  **Build the project**

    ```bash
    mvn clean install
    ```

2.  **Run the server**

    ```bash
    java -cp target/vibe-grpc-1.0-SNAPSHOT.jar dev.mgray.server.Server [port]
    ```

    The server will start on port 8080 by default. You can specify a different port by passing it as a command-line argument.

## Debugging

To run the server in debug mode, you can enable the remote debugger agent on port 5005. This will allow you to attach a remote debugger to the running server.

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar target/vibe-grpc-1.0-SNAPSHOT.jar
```

## Usage

You can use a gRPC client like `grpcurl` to interact with the server.

```bash
grpcurl -plaintext -d '{"customer_info": {"display_name": "Test User", "user_name": "testuser", "password": "password"}}' localhost:8080 dev .mgray.CustomerService.CustomerService/AddCustomer    

grpcurl -plaintext -d '{"username_password":{"user_name":"testuser", "password":"password"}}' localhost:8080 dev.mgray.CustomerService.CustomerService/Login
```

### Querying Customer Data

To view the customer data stored in Spanner, you can use the `gcloud spanner` CLI. The `Info` column, which stores the `CustomerInfo` proto, can be decoded into a human-readable JSON format using the `PROTO_TO_JSON` function.

```bash
export SPANNER_EMULATOR_HOST=localhost:9010 && gcloud spanner databases execute-sql test-db --instance=test-instance --project=test-project --sql="SELECT CustomerId, Info FROM Customer"
```

*Note: The `PROTO_TO_JSON` function might not be fully supported or behave as expected in all versions of the Spanner emulator. If you encounter issues, you can still query the raw `Info` column (which will be Base64 encoded) using `SELECT CustomerId, Info FROM Customer` and decode it in your application or manually.*

## Docker Compose

```bash
docker-compose up --build
```
