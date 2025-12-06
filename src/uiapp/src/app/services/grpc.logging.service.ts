import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DebugRequest } from './debug.request';

@Injectable({
  providedIn: 'root'
})
export class GrpcLoggingService {
  private requestsSubject = new BehaviorSubject<DebugRequest[]>([]);
  requests$: Observable<DebugRequest[]> = this.requestsSubject.asObservable();

  constructor() { }

  addRequest(rpc: string, request: any, response: any) {
    const newRequest: DebugRequest = {
      rpc,
      request: request.toObject(),
      response: response.toObject(),
      timestamp: new Date()
    };
    const currentRequests = this.requestsSubject.getValue();
    this.requestsSubject.next([...currentRequests, newRequest]);
  }
}
