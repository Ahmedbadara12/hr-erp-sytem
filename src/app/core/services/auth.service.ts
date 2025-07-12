import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export type UserRole = 'Admin' | 'Employee' | 'HR' | 'ProjectManager';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasSession());
  private role$ = new BehaviorSubject<UserRole | null>(this.getStoredRole());
  private username$ = new BehaviorSubject<string>(this.getStoredUsername());

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  login(role: UserRole, username: string = 'demo-user') {
    console.log('AuthService.login called with:', { role, username });
    
    if (this.isBrowser()) {
      localStorage.setItem('role', role);
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
      // Assign a mock userId for demo: 1 for Employee, 2 for HR, 3 for Admin, 4 for ProjectManager
      let userId = '1';
      if (role === 'HR') userId = '2';
      if (role === 'Admin') userId = '3';
      if (role === 'ProjectManager') userId = '4';
      localStorage.setItem('userId', userId);
    }
    this.loggedIn$.next(true);
    this.role$.next(role);
    this.username$.next(username);
    
    console.log('AuthService: Updated username observable to:', username);
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('role');
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
    }
    this.loggedIn$.next(false);
    this.role$.next(null);
    this.username$.next('demo-user');
  }

  getRole(): Observable<UserRole | null> {
    return this.role$.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserId(): number | null {
    if (this.isBrowser()) {
      const id = localStorage.getItem('userId');
      return id ? +id : null;
    }
    return null;
  }

  getUsername(): string {
    if (this.isBrowser()) {
      return localStorage.getItem('username') || 'demo-user';
    }
    return 'demo-user';
  }

  getUsername$(): Observable<string> {
    return this.username$.asObservable();
  }

  private hasSession(): boolean {
    return this.isBrowser() && localStorage.getItem('loggedIn') === 'true';
  }

  private getStoredRole(): UserRole | null {
    return this.isBrowser()
      ? (localStorage.getItem('role') as UserRole) || null
      : null;
  }

  private getStoredUsername(): string {
    return this.isBrowser() ? localStorage.getItem('username') || 'demo-user' : 'demo-user';
  }
}
