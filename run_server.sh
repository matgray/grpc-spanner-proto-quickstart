#!/bin/bash
sleep 10
./docker_run_db_populator.sh

JAVA_CMD="java"
if [ "$ENABLE_DEBUG" = "true" ]; then
  SUSPEND_FLAG=${DEBUG_SUSPEND:-n} # Default to 'n' if not set
  JAVA_CMD="$JAVA_CMD -agentlib:jdwp=transport=dt_socket,server=y,suspend=$SUSPEND_FLAG,address=*:5005"
fi

$JAVA_CMD -jar mgray-dev-starterkit-1.0-SNAPSHOT.jar
