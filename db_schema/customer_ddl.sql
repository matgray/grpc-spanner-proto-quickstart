CREATE PROTO BUNDLE (
  dev.mgray.db.schema.customer.CustomerInfo,
  dev.mgray.db.schema.customer.Session,
);

CREATE SEQUENCE CustomerIdSequence OPTIONS (sequence_kind='bit_reversed_positive');

CREATE TABLE Customer (
  CustomerId INT64 NOT NULL DEFAULT (GET_NEXT_SEQUENCE_VALUE(SEQUENCE CustomerIdSequence)),
  UserName STRING(MAX) NOT NULL,
  Info dev.mgray.db.schema.customer.CustomerInfo,
  Session dev.mgray.db.schema.customer.Session,
) PRIMARY KEY (CustomerId);

CREATE UNIQUE INDEX CustomerByUserName ON Customer(UserName);
