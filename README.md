# mgray.dev starterkit for a gRPC server with spanner + proto integration

This project contains a gRPC server that interacts with a Google Cloud Spanner database. It demonstrates how to manage customer data, including adding new customers and handling user logins. The project emphasizes best practices for database schema management by generating Java constants from SQL DDL and externalizing SQL queries into separate files.

## Prerequisites

*   Java 11 or higher
*   Maven
*   Google Cloud SDK (for `gcloud` commands)
*   Docker and Docker Compose (for Spanner emulator)
*   Python 3.x and `pip` (for schema generation scripts)

## Setup

1.  **Install Python Dependencies**

    Ensure you have a Python virtual environment set up and the necessary packages installed:

    ```bash
    python3 -m venv venv
    ./venv/bin/pip install sql-metadata jinja2 google-cloud-spanner
    ```

2.  **Generate Schema Files (Local Development)**

    Before building the project or running `docker-compose up --build`, you need to generate the schema files locally. This process involves starting a Spanner emulator, populating it with your DDL, and then extracting the schema information to generate Java classes.

    Run the following command to generate the schema files:

    ```bash
    ./run_generator.sh
    ```

    This script will:
    *   Start a Spanner emulator instance using Docker Compose.
    *   Create a dedicated Spanner instance and database for schema generation.
    *   Populate the database with the DDL from `db_schema/customer_ddl.sql`.
    *   Extract table and column names from the running Spanner emulator to generate `CustomerSchema.java` (containing Java constants for column names).
    *   Extract SQL statements from `src/main/resources/sql/*.sql` files to generate `SqlProvider.java` (containing methods to retrieve formatted SQL queries).
    *   Stop and remove the Spanner emulator instance.

3.  **Build the Project**

    After generating the schema files, compile the project using Maven:

    ```bash
    mvn clean install
    ```

    You can skip the schema generation process during a full Maven build by setting the `skipSchemaGeneration` Maven property to `true`:

    ```bash
    mvn clean install -DskipSchemaGeneration=true
    ```

    This is useful for faster builds when the schema has not changed.

## Only Generate gRPC Code

If you only want to generate the gRPC-related Java code from the `.proto` files (e.g., `CustomerServiceGrpc.java` and the message classes), you can run the `protobuf-maven-plugin` goals directly:

```bash
mvn protobuf:compile protobuf:compile-custom
```

This will generate the Java source files in `target/generated-sources/protobuf/java` and `target/generated-sources/protobuf/grpc-java`.

## Running the Server

To run the gRPC server:

```bash
java -cp target/mgray-dev-starterkit-1.0-SNAPSHOT.jar dev.mgray.server.Server [port]
```

The server will start on port 8080 by default. You can specify a different port by passing it as a command-line argument.

## Interacting with the Server using `grpcurl`

`grpcurl` is a command-line tool for interacting with gRPC servers. Ensure your gRPC server is running before executing these commands.

### Add a New Customer

This command adds a new customer to the system.

```bash
grpcurl -plaintext -d '{
  "customer_info": {
    "display_name": "Test User",
    "user_name": "testuser"
  },
  "password": "password"
}' localhost:8080 dev.mgray.server.service.customer.CustomerService/AddCustomer
```

### Log In a User

You can log in using either a username and password or a session ID.

**Using username and password:**

```bash
grpcurl -plaintext -d '{
  "username_password": {
    "user_name": "testuser",
    "password": "password"
  }
}' localhost:8080 dev.mgray.server.service.customer.CustomerService/Login
```

**Using a session ID:**

```bash
grpcurl -plaintext -d '{
  "session": {
    "session_id": "your_session_id_here"
  }
}' localhost:8080 dev.mgray.server.service.customer.CustomerService/Login
```

## Debugging

To run the server in debug mode, you can enable the remote debugger agent on port 5005. This will allow you to attach a remote debugger to the running server.

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar target/mgray-dev-starterkit-1.0-SNAPSHOT.jar
```

## Querying Customer Data in Spanner Emulator

To view the customer data stored in the Spanner emulator, you can use the `gcloud spanner` CLI.

```bash
export SPANNER_EMULATOR_HOST=localhost:9010 && gcloud spanner databases execute-sql test-db --instance=test-instance --project=test-project --sql="SELECT CustomerId, UserName, Info, Session FROM Customer"
```

## Docker Compose

To build and run the entire application (gRPC server and Spanner emulator) using Docker Compose:

```bash
docker-compose up --build
```