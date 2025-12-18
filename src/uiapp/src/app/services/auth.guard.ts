import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { GrpcService } from './grpc.service'; // Import GrpcService
import { LoginResponse, SessionValidationResponse, ValidationStatus } from '../grpc/customer-service.pb'; // Import new types
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const grpcService = inject(GrpcService); // Inject GrpcService

  const loginResponseStr = localStorage.getItem('login_response');

  if (loginResponseStr) {
    const loginResponse = JSON.parse(loginResponseStr) as LoginResponse;
    const sessionId = loginResponse.session?.sessionId;

    if (sessionId) {
      return grpcService.validateSession(sessionId).pipe(
        map((response: SessionValidationResponse) => {
          if (response.status === ValidationStatus.VALID) {
            return true;
          } else {
            return router.createUrlTree(['/login']);
          }
        }),
        catchError(() => {
          return of(router.createUrlTree(['/login']));
        })
      );
    }
  }

  return of(router.createUrlTree(['/login']));
};
