import { Injectable } from '@angular/core';
import { CustomerServiceClient, ServiceError } from '../grpc/customer_service_pb_service';
import { AddCustomerRequest, LoginRequest, LoginResponse, UserNamePasswordBundle } from '../grpc/customer_service_pb';
import { CustomerInfo } from '../grpc/customer_pb';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrpcService {

  private client: CustomerServiceClient;

  constructor() {
    this.client = new CustomerServiceClient('http://localhost:8080');
  }

  addCustomer(customerInfo: CustomerInfo, password: string): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      const request = new AddCustomerRequest();
      request.setCustomerInfo(customerInfo);
      request.setPassword(password);

      this.client.addCustomer(request, (error: ServiceError | null, responseMessage: LoginResponse | null) => {
        if (error) {
          observer.error(error);
        } else if (responseMessage) {
          observer.next(responseMessage);
          observer.complete();
        } else {
          observer.error(new Error('No response message'));
        }
      });
    });
  }

  login(userName: string, password: string): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      const request = new LoginRequest();
      const bundle = new UserNamePasswordBundle();
      bundle.setUserName(userName);
      bundle.setPassword(password);
      request.setUsernamePassword(bundle);

      this.client.login(request, (error: ServiceError | null, responseMessage: LoginResponse | null) => {
        if (error) {
          observer.error(error);
        } else if (responseMessage) {
          observer.next(responseMessage);
          observer.complete();
        } else {
          observer.error(new Error('No response message'));
        }
      });
    });
  }
}