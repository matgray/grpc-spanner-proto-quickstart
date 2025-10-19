#!/bin/bash
set -e

INSTANCE_ID="generation-instance"
DATABASE_ID="generation-db"

# Start Spanner emulator
docker-compose up -d spanner-emulator

# Wait for emulator to be ready
sleep 10

# Populate database
./populate_db.sh $INSTANCE_ID $DATABASE_ID

# Run schema extractor
./venv/bin/python schema_extractor.py $INSTANCE_ID $DATABASE_ID

# Stop and remove emulator
docker-compose down