#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Configure gcloud for emulator
gcloud config set auth/disable_credentials true
gcloud config set project test-project
gcloud config set api_endpoint_overrides/spanner http://spanner-emulator:9020/

# Run the populate_db.sh script
/bin/bash populate_db.sh
