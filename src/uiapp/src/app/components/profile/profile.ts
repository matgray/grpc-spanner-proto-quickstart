import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  isDarkTheme: boolean = false;
  selectedColor: string;
  colors = [
    { name: 'Deep Purple & Amber', value: 'deep-purple-amber-theme' },
    { name: 'Indigo & Pink', value: 'indigo-pink-theme' },
    { name: 'Pink & Blue Grey', value: 'pink-blue-grey-theme' },
    { name: 'Purple & Green', value: 'purple-green-theme' }
  ];

  constructor(private fb: FormBuilder, public themeService: ThemeService, private renderer: Renderer2) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    this.selectedColor = localStorage.getItem('color-scheme') || 'deep-purple-amber-theme';
  }

  ngOnInit() {
    this.themeService.isDarkTheme$.subscribe(isDarkTheme => {
      this.isDarkTheme = isDarkTheme;
    });
    this.changeColorScheme();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  changeColorScheme() {
    localStorage.setItem('color-scheme', this.selectedColor);
    for (const color of this.colors) {
      this.renderer.removeClass(document.body, color.value);
    }
    this.renderer.addClass(document.body, this.selectedColor);
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    // Mock password change
    console.log('Password changed successfully');
  }
}