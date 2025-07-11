import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from '../services/auth.service';
import { map } from 'rxjs/operators';

export function authGuard(requiredRoles?: UserRole | UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isLoggedIn().pipe(
      map((isLoggedIn) => {
        if (!isLoggedIn) {
          router.navigate(['/login']);
          return false;
        }
        if (requiredRoles) {
          let allowed = false;
          auth.getRole().subscribe((role) => {
            if (Array.isArray(requiredRoles)) {
              allowed = requiredRoles.includes(role as UserRole);
            } else {
              allowed = role === requiredRoles;
            }
          });
          if (!allowed) {
            router.navigate(['/not-authorized']);
            return false;
          }
        }
        return true;
      })
    );
  };
}
