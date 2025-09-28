CREATE PROTO BUNDLE (
  dev.mgray.CustomerInfo.CustomerInfo
);

CREATE SEQUENCE CustomerIdSequence OPTIONS (sequence_kind='bit_reversed_positive');

CREATE TABLE Customer (
  CustomerId INT64 NOT NULL DEFAULT (GET_NEXT_SEQUENCE_VALUE(SEQUENCE CustomerIdSequence)),
  Info dev.mgray.CustomerInfo.CustomerInfo
) PRIMARY KEY (CustomerId);