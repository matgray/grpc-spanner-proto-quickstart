#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Set project and instance IDs
PROJECT_ID="test-project"
INSTANCE_ID=${1:-"test-instance"}
DATABASE_ID=${2:-"test-db"}

# Delete database if it exists
if gcloud spanner databases describe ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID} >/dev/null 2>&1; then
  echo "Deleting existing Spanner database ${DATABASE_ID}..."
  gcloud spanner databases delete ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID} --quiet
fi

# Delete instance if it exists
if gcloud spanner instances describe ${INSTANCE_ID} --project=${PROJECT_ID} >/dev/null 2>&1; then
  echo "Deleting existing Spanner instance ${INSTANCE_ID}..."
  gcloud spanner instances delete ${INSTANCE_ID} --project=${PROJECT_ID} --quiet
fi

echo "Creating Spanner instance..."
gcloud spanner instances create ${INSTANCE_ID} --config=emulator-config --description="Test Instance" --nodes=1 --project=${PROJECT_ID}

echo "Creating Spanner database ${DATABASE_ID} and updating DDL..."
gcloud spanner databases create ${DATABASE_ID} --instance=${INSTANCE_ID} --project=${PROJECT_ID}
gcloud spanner databases ddl update ${DATABASE_ID} --instance=${INSTANCE_ID} --ddl-file=db_schema/customer_ddl.sql --project=${PROJECT_ID} --proto-descriptors-file=target/generated-resources/protobuf/descriptor_set.protobin
