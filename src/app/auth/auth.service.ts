import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  register(fullName: string, email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/register`, {
        fullName,
        email,
        password,
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
}
