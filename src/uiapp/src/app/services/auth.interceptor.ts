import { Injectable } from '@angular/core';
import { GrpcInterceptor } from '@ngx-grpc/core';
import { GrpcHandler } from '@ngx-grpc/core';
import { Observable } from 'rxjs';
import { GrpcMetadata, GrpcRequest } from '@ngx-grpc/common';

@Injectable()
export class AuthInterceptor implements GrpcInterceptor {
  intercept(request: GrpcRequest<any, any>, next: GrpcHandler): Observable<any> {
    const loginResponseStr = localStorage.getItem('login_response');
    if (loginResponseStr) {
      const loginResponse = JSON.parse(loginResponseStr);
      const sessionId = loginResponse.session?.sessionId;
      if (sessionId) {
        const metadata = request.requestMetadata || new GrpcMetadata();
        metadata.set('session_id', sessionId);
        request.requestMetadata = metadata;
      }
    }
    return next.handle(request);
  }
}
