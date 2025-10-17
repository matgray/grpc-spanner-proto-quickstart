CREATE PROTO BUNDLE (
  dev.mgray.schema.Customer.CustomerInfo,
  dev.mgray.schema.Customer.Session,
);

CREATE SEQUENCE CustomerIdSequence OPTIONS (sequence_kind='bit_reversed_positive');

CREATE TABLE Customer (
  CustomerId INT64 NOT NULL DEFAULT (GET_NEXT_SEQUENCE_VALUE(SEQUENCE CustomerIdSequence)),
  UserName STRING(MAX) NOT NULL,
  Info dev.mgray.schema.Customer.CustomerInfo,
  Session dev.mgray.schema.Customer.Session,
) PRIMARY KEY (CustomerId);

CREATE UNIQUE INDEX CustomerByUserName ON Customer(UserName);
