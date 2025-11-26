import { Injectable } from '@angular/core';
import { CustomerServiceClient } from '../grpc/customer-service.pbsc';
import { AddCustomerRequest, LoginRequest, LoginResponse, UserNamePasswordBundle } from '../grpc/customer-service.pb';
import { CustomerInfo } from '../grpc/customer.pb';
import { Observable } from 'rxjs';
import { GrpcStatusEvent } from '@ngx-grpc/common';

@Injectable({
  providedIn: 'root'
})
export class GrpcService {

  constructor(private client: CustomerServiceClient) { }

  addCustomer(customerInfo: CustomerInfo, password: string): Observable<LoginResponse> {
    const request = new AddCustomerRequest();
    request.customerInfo = customerInfo;
    request.password = password;

    return this.client.addCustomer(request);
  }

  login(userName: string, password: string): Observable<LoginResponse> {
    const request = new LoginRequest();
    const bundle = new UserNamePasswordBundle();
    bundle.userName = userName;
    bundle.password = password;
    request.usernamePassword = bundle;

    return this.client.login(request);
  }
}
