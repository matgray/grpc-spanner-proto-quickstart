#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Set environment variable for Spanner emulator host
export SPANNER_EMULATOR_HOST=localhost:9010

# Set project and instance IDs
PROJECT_ID="test-project"
INSTANCE_ID="test-instance"
DATABASE_ID="test-db" # Corrected database name

# 1. Generate the Protobuf Descriptor Set
echo "Generating Protobuf descriptor set..."
protoc --include_imports --descriptor_set_out=target/customer_descriptors.pb src/main/proto/customer.proto

# 2. Delete existing database (if it exists)
echo "Deleting existing database (if it exists)..."
set +e # Disable exit on error for this command
gcloud spanner databases delete ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID} --quiet
set -e # Re-enable exit on error

# 3. Delete existing instance (if it exists)
echo "Deleting existing instance (if it exists)..."
set +e # Disable exit on error for this command
gcloud spanner instances delete ${INSTANCE_ID} --project=${PROJECT_ID} --quiet
set -e # Re-enable exit on error

# 4. Create Spanner instance
echo "Creating Spanner instance..."
gcloud spanner instances create ${INSTANCE_ID} --config=emulator-config --description="Test Instance" --nodes=1 --project=${PROJECT_ID}

# 5. Create Spanner database and update DDL
echo "Creating Spanner database ${DATABASE_ID} and updating DDL..."
gcloud spanner databases create ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID}
gcloud spanner databases ddl update ${DATABASE_ID} --instance=${INSTANCE_ID} --ddl-file=db_schema/customer_ddl.sql --project=${PROJECT_ID} --proto-descriptors-file=target/customer_descriptors.pb
