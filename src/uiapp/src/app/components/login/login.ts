import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GrpcService } from '../../services/grpc.service';
import { CustomerInfo } from '../../grpc/customer_pb';
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

  constructor(private fb: FormBuilder, private grpcService: GrpcService) {
    this.loginForm = this.fb.group({
      displayName: [''],
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  toggleSignUp() {
    this.isSignUp = !this.isSignUp;
    if (this.isSignUp) {
      this.loginForm.get('displayName')?.setValidators(Validators.required);
    } else {
      this.loginForm.get('displayName')?.clearValidators();
    }
    this.loginForm.get('displayName')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { displayName, userName, password } = this.loginForm.value;

    if (this.isSignUp) {
      const customerInfo = new CustomerInfo();
      customerInfo.setDisplayName(displayName);
      customerInfo.setUserName(userName);
      this.grpcService.addCustomer(customerInfo, password).subscribe({
        next: (response) => {
          console.log('Sign up successful', response.toObject());
        },
        error: (error) => {
          console.error('Sign up failed', error);
        }
      });
    } else {
      this.grpcService.login(userName, password).subscribe({
        next: (response) => {
          console.log('Login successful', response.toObject());
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }
}