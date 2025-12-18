import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { GrpcLoggingService } from '../../services/grpc.logging.service';
import { DebugRequest } from '../../services/debug.request';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grpc-debug',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './grpc-debug.html',
  styleUrls: ['./grpc-debug.scss'],
  host: {'class': 'grpc-debug-panel'}
})
export class GrpcDebugComponent implements OnInit {
  requests$: Observable<DebugRequest[]>;
  selectedRequest: DebugRequest | null = null;
  displayedColumns: string[] = ['rpc']; // Initial display only RPC
  selectedColumn: string | null = null;

  constructor(private loggingService: GrpcLoggingService) {
    this.requests$ = this.loggingService.requests$;
  }

  ngOnInit() {
  }

  selectRow(row: DebugRequest, column: string) {
    if (this.selectedRequest === row && this.selectedColumn === column) {
      this.selectedRequest = null;
      this.selectedColumn = null;
      this.displayedColumns = ['rpc'];
    } else {
      this.selectedRequest = row;
      this.selectedColumn = column;
      this.displayedColumns = ['rpc', 'request', 'response'];
    }
  }

  isSelected(row: DebugRequest, column: string): boolean {
    return this.selectedRequest === row && this.selectedColumn === column;
  }
}