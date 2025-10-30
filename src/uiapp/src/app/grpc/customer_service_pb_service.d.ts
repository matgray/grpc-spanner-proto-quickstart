// package: dev.mgray.server.service.customer
// file: customer_service.proto

import * as customer_service_pb from "./customer_service_pb";
import {grpc} from "@improbable-eng/grpc-web";

type CustomerServiceAddCustomer = {
  readonly methodName: string;
  readonly service: typeof CustomerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof customer_service_pb.AddCustomerRequest;
  readonly responseType: typeof customer_service_pb.LoginResponse;
};

type CustomerServiceLogin = {
  readonly methodName: string;
  readonly service: typeof CustomerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof customer_service_pb.LoginRequest;
  readonly responseType: typeof customer_service_pb.LoginResponse;
};

export class CustomerService {
  static readonly serviceName: string;
  static readonly AddCustomer: CustomerServiceAddCustomer;
  static readonly Login: CustomerServiceLogin;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class CustomerServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  addCustomer(
    requestMessage: customer_service_pb.AddCustomerRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: customer_service_pb.LoginResponse|null) => void
  ): UnaryResponse;
  addCustomer(
    requestMessage: customer_service_pb.AddCustomerRequest,
    callback: (error: ServiceError|null, responseMessage: customer_service_pb.LoginResponse|null) => void
  ): UnaryResponse;
  login(
    requestMessage: customer_service_pb.LoginRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: customer_service_pb.LoginResponse|null) => void
  ): UnaryResponse;
  login(
    requestMessage: customer_service_pb.LoginRequest,
    callback: (error: ServiceError|null, responseMessage: customer_service_pb.LoginResponse|null) => void
  ): UnaryResponse;
}

