import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AppStateService } from './shared/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationComponent],
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

  constructor(
    public auth: AuthService, 
    private router: Router, 
    private appState: AppStateService
  ) {}

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
