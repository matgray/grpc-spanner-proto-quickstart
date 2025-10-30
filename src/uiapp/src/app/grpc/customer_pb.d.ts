// package: dev.mgray.db.schema.customer
// file: customer.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class CustomerInfo extends jspb.Message {
  getDisplayName(): string;
  setDisplayName(value: string): void;

  getUserName(): string;
  setUserName(value: string): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CustomerInfo.AsObject;
  static toObject(includeInstance: boolean, msg: CustomerInfo): CustomerInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CustomerInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CustomerInfo;
  static deserializeBinaryFromReader(message: CustomerInfo, reader: jspb.BinaryReader): CustomerInfo;
}

export namespace CustomerInfo {
  export type AsObject = {
    displayName: string,
    userName: string,
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class Session extends jspb.Message {
  getSessionId(): string;
  setSessionId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Session.AsObject;
  static toObject(includeInstance: boolean, msg: Session): Session.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Session, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Session;
  static deserializeBinaryFromReader(message: Session, reader: jspb.BinaryReader): Session;
}

export namespace Session {
  export type AsObject = {
    sessionId: string,
  }
}

export class Security extends jspb.Message {
  getPassword(): string;
  setPassword(value: string): void;

  getSalt(): string;
  setSalt(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Security.AsObject;
  static toObject(includeInstance: boolean, msg: Security): Security.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Security, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Security;
  static deserializeBinaryFromReader(message: Security, reader: jspb.BinaryReader): Security;
}

export namespace Security {
  export type AsObject = {
    password: string,
    salt: string,
  }
}

