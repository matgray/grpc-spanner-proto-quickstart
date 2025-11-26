import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GRPC_INTERCEPTORS, GRPC_CLIENT_FACTORY, GrpcHandler } from '@ngx-grpc/core';
import { GRPC_CUSTOMER_SERVICE_CLIENT_SETTINGS } from './grpc/customer-service.pbconf.js';
import { AuthInterceptor } from './services/auth.interceptor';
import { provideHttpClient } from '@angular/common/http';
import { GrpcWebClientFactory } from '@ngx-grpc/grpc-web-client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: GRPC_CLIENT_FACTORY, useClass: GrpcWebClientFactory },
    { provide: GRPC_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: GRPC_CUSTOMER_SERVICE_CLIENT_SETTINGS, useValue: { host: 'http://localhost:8080' } },
    GrpcHandler
  ]
};
