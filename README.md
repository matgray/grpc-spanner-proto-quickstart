# mgray.dev starterkit for a gRPC server with spanner + proto integration

This project contains a gRPC server that interacts with a Google Cloud Spanner database.
It demonstrates how to manage customer data, including adding new customers and handling user logins.

The project emphasizes what I feel are some best practices for database schema management by generating Java constants
from SQL DDL.

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

2.  **Build the Project (and Generate Schema Files)**

    The Maven build process will automatically:
    *   Start a Spanner emulator instance using Docker Compose.
    *   Create a dedicated Spanner instance and database for schema generation.
    *   Populate the database with the DDLs from `db_schema/*_ddl.sql`.
    *   Extract table and column names from the running Spanner emulator to generate 
    *   `*Schema.java` (containing Java constants for column names).
    *   Compile the entire project.
    *   Stop and remove the Spanner emulator instance.

    Run the following command to build the project:

    ```bash
    mvn clean install
    ```
## Running the Server

To run the gRPC server:

```bash
java -cp target/mgray-dev-starterkit-1.0-SNAPSHOT.jar dev.mgray.server.Server [port]
```

The server will start on port 8080 by default.

## Interacting with the Server using `grpcurl`

`grpcurl` is a command-line tool for interacting with gRPC servers.

### Add a New Customer

This command adds a new customer to the system.

```bash
grpcurl -plaintext -d '{
  "customer_info": {
    "display_name": "Test User",
    "user_name": "testuser",
    "password": "password"
  }
}' localhost:8080 dev.mgray.CustomerService.CustomerService/AddCustomer
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
}' localhost:8080 dev.mgray.CustomerService.CustomerService/Login
```

**Using a session ID:**

```bash
grpcurl -plaintext -d '{
  "session": {
    "session_id": "your_session_id_here"
  }
}' localhost:8080 dev.mgray.CustomerService.CustomerService/Login
```

## Debugging

To run the server in debug mode, you can enable the remote debugger agent on port 5005.
This will allow you to attach a remote debugger to the running server.

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