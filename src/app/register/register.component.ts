import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  password = '';
  isRecruiter = false;
  createCompany = false;

  companyId: number | null = null;
  companies: any[] = [];

  // New company form fields
  newCompanyName = '';
  newCompanyWebsite = '';
  newCompanyDescription = '';

  error: string | null = null;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/companies').subscribe({
      next: (data) => (this.companies = data),
      error: () => console.error('Failed to load companies'),
    });
  }

  createCompanyAndRegister() {
    const companyPayload = {
      name: this.newCompanyName,
      website: this.newCompanyWebsite,
      description: this.newCompanyDescription,
    };

    this.http
      .post<any>('http://localhost:3000/companies', companyPayload)
      .subscribe({
        next: (company) => {
          this.companyId = company.id;
          this.onRegister(); // continue with registration
        },
        error: (err) => {
          this.error = err.error?.message || 'Company creation failed';
        },
      });
  }

  onRegister() {
    this.error = null;

    const payload: any = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
    };

    if (this.isRecruiter && this.companyId) {
      payload.companyId = this.companyId;
    }

    this.auth
      .register(
        payload.fullName,
        payload.email,
        payload.password,
        payload.companyId
      )
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.error = err.error?.message || 'Registration failed.';
        },
      });
  }
}
