import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export type UserRole = 'Admin' | 'Employee' | 'HR' | 'ProjectManager';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasSession());
  private role$ = new BehaviorSubject<UserRole | null>(this.getStoredRole());

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  login(role: UserRole) {
    if (this.isBrowser()) {
      localStorage.setItem('role', role);
      localStorage.setItem('loggedIn', 'true');
      // Assign a mock userId for demo: 1 for Employee, 2 for HR, 3 for Admin, 4 for ProjectManager
      let userId = '1';
      if (role === 'HR') userId = '2';
      if (role === 'Admin') userId = '3';
      if (role === 'ProjectManager') userId = '4';
      localStorage.setItem('userId', userId);
    }
    this.loggedIn$.next(true);
    this.role$.next(role);
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('role');
      localStorage.removeItem('loggedIn');
    }
    this.loggedIn$.next(false);
    this.role$.next(null);
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

  private hasSession(): boolean {
    return this.isBrowser() && localStorage.getItem('loggedIn') === 'true';
  }

  private getStoredRole(): UserRole | null {
    return this.isBrowser()
      ? (localStorage.getItem('role') as UserRole) || null
      : null;
  }
}
