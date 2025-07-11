import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';

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
  username = this.auth.getUsername();

  constructor(public auth: AuthService, private router: Router) {
    this.auth.getUsername$().subscribe(name => this.username = name);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
