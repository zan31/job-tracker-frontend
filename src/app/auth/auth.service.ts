import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

export interface JwtPayload {
  sub: number;
  email: string;
  company?: number;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  register(
    fullName: string,
    email: string,
    passwordHash: string,
    companyId: number
  ) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/register`, {
        fullName,
        email,
        passwordHash,
        companyId,
      })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  isRecruiter(): boolean {
    const payload = this.getDecodedToken();
    return !!payload?.company;
  }

  redirectToDashboard() {
    const isRecruiter = this.isRecruiter();
    const target = isRecruiter ? '/recruiter-dashboard' : '/user-dashboard';
    this.router.navigate([target]);
  }
}
