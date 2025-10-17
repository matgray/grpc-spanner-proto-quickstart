#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Set project and instance IDs
PROJECT_ID="test-project"
INSTANCE_ID="test-instance"
DATABASE_ID="test-db" # Corrected database name

echo "Creating Spanner instance..."
gcloud spanner instances create ${INSTANCE_ID} --config=emulator-config --description="Test Instance" --nodes=1 --project=${PROJECT_ID}

# 5. Create Spanner database and update DDL
echo "Creating Spanner database ${DATABASE_ID} and updating DDL..."
gcloud spanner databases create ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID}
gcloud spanner databases ddl update ${DATABASE_ID} --instance=${INSTANCE_ID} --ddl-file=db_schema/customer_ddl.sql --project=${PROJECT_ID} --proto-descriptors-file=target/generated-resources/protobuf/descriptor_set.protobin

touch /tmp/db_populated
