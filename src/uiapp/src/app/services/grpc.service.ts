import { Injectable } from '@angular/core';
import { CustomerServiceClient } from '../grpc/customer-service.pbsc';
import { AddCustomerRequest, LoginRequest, LoginResponse, UserNamePasswordBundle } from '../grpc/customer-service.pb';
import { CustomerInfo } from '../grpc/customer.pb';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GrpcLoggingService } from './grpc.logging.service';
import { Session } from '../grpc/customer.pb'; // Import Session
import { SessionValidationResponse, ValidationStatus } from '../grpc/customer-service.pb'; // Import new types

@Injectable({
  providedIn: 'root'
})
export class GrpcService {

  private readonly serviceName = 'CustomerService';

  constructor(
    private client: CustomerServiceClient,
    private loggingService: GrpcLoggingService
  ) { }

  addCustomer(customerInfo: CustomerInfo, password: string): Observable<LoginResponse> {
    const request = new AddCustomerRequest();
    request.customerInfo = customerInfo;
    request.password = password;

    return this.client.addCustomer(request).pipe(
      tap(response => this.loggingService.addRequest(`${this.serviceName}/AddCustomer`, request, response))
    );
  }

  login(userName: string, password: string): Observable<LoginResponse> {
    const request = new LoginRequest();
    const bundle = new UserNamePasswordBundle();
    bundle.userName = userName;
    bundle.password = password;
    request.usernamePassword = bundle;

    return this.client.login(request).pipe(
      tap(response => this.loggingService.addRequest(`${this.serviceName}/Login`, request, response))
    );
  }

  validateSession(sessionId: string): Observable<SessionValidationResponse> {
    const session = new Session();
    session.sessionId = sessionId;
    return this.client.validateSession(session).pipe(
        tap(response => this.loggingService.addRequest(`${this.serviceName}/ValidateSession`, session, response))
    );
  }
}
