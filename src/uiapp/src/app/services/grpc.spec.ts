import { TestBed } from '@angular/core/testing';

import { Grpc } from './grpc';

describe('Grpc', () => {
  let service: Grpc;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Grpc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
