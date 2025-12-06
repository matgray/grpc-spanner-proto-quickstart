import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FabComponent } from './components/fab/fab';
import { GrpcDebugComponent } from './components/grpc-debug/grpc-debug';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FabComponent, GrpcDebugComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');
  showDebug = false;

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }
}
