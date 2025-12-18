FROM maven:3.9-eclipse-temurin-11 as builder
WORKDIR /app
COPY . .
RUN mvn clean install

FROM google/cloud-sdk:latest
WORKDIR /app
COPY --from=builder /app/target/mgray-dev-starterkit-1.0-SNAPSHOT.jar .
COPY db_schema db_schema
COPY --from=builder /app/target/generated-resources/protobuf/descriptor_set.protobin target/generated-resources/protobuf/descriptor_set.protobin
COPY populate_db.sh .
COPY docker_run_db_populator.sh .
COPY run_server.sh .
RUN chmod +x populate_db.sh docker_run_db_populator.sh run_server.sh
CMD ["./run_server.sh"]