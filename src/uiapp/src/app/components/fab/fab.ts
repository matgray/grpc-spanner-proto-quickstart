import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './fab.html',
  styleUrls: ['./fab.scss']
})
export class FabComponent {
  @Output() fabClick = new EventEmitter<void>();

  onClick() {
    this.fabClick.emit();
  }
}