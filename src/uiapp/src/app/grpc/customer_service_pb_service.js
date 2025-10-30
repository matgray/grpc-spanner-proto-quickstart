// package: dev.mgray.server.service.customer
// file: customer_service.proto

var customer_service_pb = require("./customer_service_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var CustomerService = (function () {
  function CustomerService() {}
  CustomerService.serviceName = "dev.mgray.server.service.customer.CustomerService";
  return CustomerService;
}());

CustomerService.AddCustomer = {
  methodName: "AddCustomer",
  service: CustomerService,
  requestStream: false,
  responseStream: false,
  requestType: customer_service_pb.AddCustomerRequest,
  responseType: customer_service_pb.LoginResponse
};

CustomerService.Login = {
  methodName: "Login",
  service: CustomerService,
  requestStream: false,
  responseStream: false,
  requestType: customer_service_pb.LoginRequest,
  responseType: customer_service_pb.LoginResponse
};

exports.CustomerService = CustomerService;

function CustomerServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

CustomerServiceClient.prototype.addCustomer = function addCustomer(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(CustomerService.AddCustomer, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

CustomerServiceClient.prototype.login = function login(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(CustomerService.Login, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.CustomerServiceClient = CustomerServiceClient;

