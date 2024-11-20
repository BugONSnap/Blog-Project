import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenKey: string = 'token';
  isLoggedIn: boolean = false;

  constructor() {
    this.checkAuthorization();
  }

  isAuthorized(): boolean {
    return this.isLoggedIn;
  }

  login(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
    this.isLoggedIn = true;
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.isLoggedIn = false;
  }

  checkAuthorization(): void {
    const token = sessionStorage.getItem(this.tokenKey);
    this.isLoggedIn = !!token;
  }

  tokenDecoder(token: string): any {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }
}
