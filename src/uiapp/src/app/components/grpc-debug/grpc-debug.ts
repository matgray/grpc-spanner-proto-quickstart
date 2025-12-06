import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { GrpcLoggingService } from '../../services/grpc.logging.service';
import { DebugRequest } from '../../services/debug.request';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grpc-debug',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './grpc-debug.html',
  styleUrls: ['./grpc-debug.scss'],
  host: {'class': 'grpc-debug-panel'}
})
export class GrpcDebugComponent implements OnInit, AfterViewInit {
  requests$: Observable<DebugRequest[]>;
  requests: DebugRequest[] = [];
  selectedRequest: DebugRequest | null = null;

  panelWidths: number[] = [20, 40, 40];
  resizing = false;
  resizingIndex = -1;
  startX = 0;
  startWidths: number[] = [];

  @ViewChild('container') container!: ElementRef;

  constructor(private loggingService: GrpcLoggingService) {
    this.requests$ = this.loggingService.requests$;
  }

  ngOnInit() {
    this.requests$.subscribe(requests => {
      this.requests = requests;
    });
  }

  ngAfterViewInit() {
    this.setPanelWidths();
  }

  setPanelWidths() {
    const containerWidth = this.container.nativeElement.offsetWidth;
    this.panelWidths = [
      containerWidth * 0.2,
      containerWidth * 0.4,
      containerWidth * 0.4,
    ];
  }

  selectRequest(request: DebugRequest) {
    this.selectedRequest = request;
  }

  onMouseDown(index: number, event: MouseEvent) {
    this.resizing = true;
    this.resizingIndex = index;
    this.startX = event.clientX;
    this.startWidths = [...this.panelWidths];
    document.body.classList.add('resizing');
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.resizing) {
      return;
    }

    const dx = event.clientX - this.startX;
    const newWidth1 = this.startWidths[this.resizingIndex] + dx;
    const newWidth2 = this.startWidths[this.resizingIndex + 1] - dx;

    if (newWidth1 > 50 && newWidth2 > 50) {
      this.panelWidths[this.resizingIndex] = newWidth1;
      this.panelWidths[this.resizingIndex + 1] = newWidth2;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.resizing) {
      this.resizing = false;
      this.resizingIndex = -1;
      document.body.classList.remove('resizing');
    }
  }
}