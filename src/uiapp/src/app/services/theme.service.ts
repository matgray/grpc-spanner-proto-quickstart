import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.isDarkTheme.next(true);
    }
  }

  toggleTheme() {
    this.isDarkTheme.next(!this.isDarkTheme.value);
    if (this.isDarkTheme.value) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }
}
