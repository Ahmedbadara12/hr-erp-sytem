import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { AppStateService } from './shared/services/app-state.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'hr-erp';
  isLoggedIn$ = this.auth.isLoggedIn();
  role$ = this.auth.getRole();
  userId = this.auth.getUserId();
  username$ = this.auth.getUsername$();
  
  // Theme state from AppStateService
  get isDarkMode() {
    return this.appState.isDarkMode();
  }
  get themeMode() {
    return this.appState.themeMode();
  }

  globalLoading$ = this.appState.isLoading$;

  constructor(
    public auth: AuthService, 
    private router: Router, 
    private appState: AppStateService
  ) {
    // Listen for router events to show/hide global loading overlay
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.appState.setLoading(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.appState.setLoading(false), 200); // slight delay for smoothness
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const currentMode = this.themeMode;
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    this.appState.setThemeMode(newMode);
  }
}
