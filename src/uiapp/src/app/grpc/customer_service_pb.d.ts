// package: dev.mgray.server.service.customer
// file: customer_service.proto

import * as jspb from "google-protobuf";
import * as customer_pb from "./customer_pb";

export class AddCustomerRequest extends jspb.Message {
  hasCustomerInfo(): boolean;
  clearCustomerInfo(): void;
  getCustomerInfo(): customer_pb.CustomerInfo | undefined;
  setCustomerInfo(value?: customer_pb.CustomerInfo): void;

  getPassword(): string;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddCustomerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddCustomerRequest): AddCustomerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddCustomerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddCustomerRequest;
  static deserializeBinaryFromReader(message: AddCustomerRequest, reader: jspb.BinaryReader): AddCustomerRequest;
}

export namespace AddCustomerRequest {
  export type AsObject = {
    customerInfo?: customer_pb.CustomerInfo.AsObject,
    password: string,
  }
}

export class LoginRequest extends jspb.Message {
  hasUsernamePassword(): boolean;
  clearUsernamePassword(): void;
  getUsernamePassword(): UserNamePasswordBundle | undefined;
  setUsernamePassword(value?: UserNamePasswordBundle): void;

  hasSession(): boolean;
  clearSession(): void;
  getSession(): customer_pb.Session | undefined;
  setSession(value?: customer_pb.Session): void;

  getMethodCase(): LoginRequest.MethodCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginRequest;
  static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
  export type AsObject = {
    usernamePassword?: UserNamePasswordBundle.AsObject,
    session?: customer_pb.Session.AsObject,
  }

  export enum MethodCase {
    METHOD_NOT_SET = 0,
    USERNAME_PASSWORD = 1,
    SESSION = 2,
  }
}

export class UserNamePasswordBundle extends jspb.Message {
  getUserName(): string;
  setUserName(value: string): void;

  getPassword(): string;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserNamePasswordBundle.AsObject;
  static toObject(includeInstance: boolean, msg: UserNamePasswordBundle): UserNamePasswordBundle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserNamePasswordBundle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserNamePasswordBundle;
  static deserializeBinaryFromReader(message: UserNamePasswordBundle, reader: jspb.BinaryReader): UserNamePasswordBundle;
}

export namespace UserNamePasswordBundle {
  export type AsObject = {
    userName: string,
    password: string,
  }
}

export class LoginResponse extends jspb.Message {
  getCustomerId(): number;
  setCustomerId(value: number): void;

  hasSession(): boolean;
  clearSession(): void;
  getSession(): customer_pb.Session | undefined;
  setSession(value?: customer_pb.Session): void;

  getErrorCode(): LoginErrorCodeMap[keyof LoginErrorCodeMap];
  setErrorCode(value: LoginErrorCodeMap[keyof LoginErrorCodeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LoginResponse): LoginResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LoginResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginResponse;
  static deserializeBinaryFromReader(message: LoginResponse, reader: jspb.BinaryReader): LoginResponse;
}

export namespace LoginResponse {
  export type AsObject = {
    customerId: number,
    session?: customer_pb.Session.AsObject,
    errorCode: LoginErrorCodeMap[keyof LoginErrorCodeMap],
  }
}

export interface LoginErrorCodeMap {
  UNKNOWN: 0;
  USER_NAME_ALREADY_IN_USE: 1;
  INVALID_CREDENTIALS: 2;
}

export const LoginErrorCode: LoginErrorCodeMap;

