import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GrpcService } from '../../services/grpc.service';
import { CustomerInfo } from '../../grpc/customer.pb';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isSignUp: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private grpcService: GrpcService, private router: Router) {
    this.loginForm = this.fb.group({
      displayName: [''],
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  toggleSignUp() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = null;
    if (this.isSignUp) {
      this.loginForm.get('displayName')?.setValidators(Validators.required);
    } else {
      this.loginForm.get('displayName')?.clearValidators();
    }
    this.loginForm.get('displayName')?.updateValueAndValidity();
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.loginForm.invalid) {
      return;
    }

    const { displayName, userName, password } = this.loginForm.value;

    if (this.isSignUp) {
      const customerInfo = new CustomerInfo();
      customerInfo.displayName = displayName;
      customerInfo.userName = userName;
      this.grpcService.addCustomer(customerInfo, password).subscribe({
        next: (response) => {
          console.log('Sign up successful', response);
          localStorage.setItem('login_response', JSON.stringify(response));
          this.router.navigate(['/overview']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      this.grpcService.login(userName, password).subscribe({
        next: (response) => {
          if (response.session?.sessionId != null) {
            console.log('Login failed', response);
            this.errorMessage = response.errorCode.toString();
            return;
          }
          console.log('Login successful', response);
          localStorage.setItem('login_response', JSON.stringify(response));
          this.router.navigate(['/overview']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }
}
