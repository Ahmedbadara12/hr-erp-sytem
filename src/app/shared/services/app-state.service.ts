import { Injectable, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

// State interfaces
export interface AppState {
  user: UserState;
  ui: UIState;
  notifications: NotificationState;
  theme: ThemeState;
}

export interface UserState {
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  profile: UserProfile | null;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UIState {
  loading: boolean;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  currentPage: string;
  breadcrumbs: Breadcrumb[];
  modals: ModalState[];
}

export interface Breadcrumb {
  label: string;
  url?: string;
  active?: boolean;
}

export interface ModalState {
  id: string;
  isOpen: boolean;
  data?: any;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  // Private signals for state
  private readonly _userState = signal<UserState>({
    isAuthenticated: false,
    userId: null,
    username: null,
    role: null,
    profile: null,
  });

  private readonly _uiState = signal<UIState>({
    loading: false,
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    currentPage: '',
    breadcrumbs: [],
    modals: [],
  });

  private readonly _notificationState = signal<NotificationState>({
    notifications: [],
    unreadCount: 0,
  });

  private readonly _themeState = signal<ThemeState>({
    mode: 'system',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
  });

  // Public computed signals
  public readonly userState = this._userState.asReadonly();
  public readonly uiState = this._uiState.asReadonly();
  public readonly notificationState = this._notificationState.asReadonly();
  public readonly themeState = this._themeState.asReadonly();

  // Computed selectors
  public readonly isAuthenticated = computed(
    () => this._userState().isAuthenticated
  );
  public readonly currentUser = computed(() => this._userState());
  public readonly currentRole = computed(() => this._userState().role);
  public readonly isLoading = computed(() => this._uiState().loading);
  public readonly sidebarCollapsed = computed(
    () => this._uiState().sidebarCollapsed
  );
  public readonly mobileMenuOpen = computed(
    () => this._uiState().mobileMenuOpen
  );
  public readonly currentPage = computed(() => this._uiState().currentPage);
  public readonly breadcrumbs = computed(() => this._uiState().breadcrumbs);
  public readonly notifications = computed(
    () => this._notificationState().notifications
  );
  public readonly unreadNotifications = computed(
    () => this._notificationState().unreadCount
  );
  public readonly themeMode = computed(() => this._themeState().mode);
  public readonly isDarkMode = computed(() => {
    const mode = this._themeState().mode;
    if (typeof window !== 'undefined' && mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === 'dark';
  });

  constructor(private authService: AuthService) {
    this.initializeState();
    this.setupEffects();
  }

  private initializeState(): void {
    // Initialize theme from localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('hr-erp-theme');
      if (savedTheme) {
        try {
          const theme = JSON.parse(savedTheme);
          this._themeState.set({ ...this._themeState(), ...theme });
        } catch (error) {
          console.warn('Failed to parse saved theme:', error);
        }
      } else {
        // Default to light mode on first visit
        this._themeState.update((state) => ({
          ...state,
          mode: 'light',
        }));
      }
    }

    // Initialize user state from auth service
    this.authService.getRole().subscribe((role) => {
      this._userState.update((state) => ({
        ...state,
        role,
        isAuthenticated: !!role,
      }));
    });

    this.authService.getUsername$().subscribe((username: string) => {
      this._userState.update((state) => ({
        ...state,
        username,
      }));
    });
  }

  private setupEffects(): void {
    // Effect to save theme changes to localStorage and apply theme
    effect(() => {
      const theme = this._themeState();
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        localStorage.setItem('hr-erp-theme', JSON.stringify(theme));
      }
      // Apply theme to document (including .dark class)
      if (typeof document !== 'undefined') {
        this.applyTheme(theme);
      }
    });

    // Effect to update document for reduced motion
    effect(() => {
      const reducedMotion = this._themeState().reducedMotion;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle(
          'reduced-motion',
          reducedMotion
        );
      }
    });

    // Effect to update document for high contrast
    effect(() => {
      const highContrast = this._themeState().highContrast;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle(
          'high-contrast',
          highContrast
        );
      }
    });
  }

  // User state actions
  setUserProfile(profile: UserProfile): void {
    this._userState.update((state) => ({
      ...state,
      profile,
    }));
  }

  updateUserRole(role: UserRole): void {
    this._userState.update((state) => ({
      ...state,
      role,
    }));
  }

  clearUserState(): void {
    this._userState.set({
      isAuthenticated: false,
      userId: null,
      username: null,
      role: null,
      profile: null,
    });
  }

  // UI state actions
  setLoading(loading: boolean): void {
    this._uiState.update((state) => ({
      ...state,
      loading,
    }));
  }

  toggleSidebar(): void {
    this._uiState.update((state) => ({
      ...state,
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._uiState.update((state) => ({
      ...state,
      sidebarCollapsed: collapsed,
    }));
  }

  toggleMobileMenu(): void {
    this._uiState.update((state) => ({
      ...state,
      mobileMenuOpen: !state.mobileMenuOpen,
    }));
  }

  setMobileMenuOpen(open: boolean): void {
    this._uiState.update((state) => ({
      ...state,
      mobileMenuOpen: open,
    }));
  }

  setCurrentPage(page: string): void {
    this._uiState.update((state) => ({
      ...state,
      currentPage: page,
    }));
  }

  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this._uiState.update((state) => ({
      ...state,
      breadcrumbs,
    }));
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this._uiState.update((state) => ({
      ...state,
      breadcrumbs: [...state.breadcrumbs, breadcrumb],
    }));
  }

  clearBreadcrumbs(): void {
    this._uiState.update((state) => ({
      ...state,
      breadcrumbs: [],
    }));
  }

  // Modal actions
  openModal(modalId: string, data?: any): void {
    this._uiState.update((state) => ({
      ...state,
      modals: [
        ...state.modals.filter((m) => m.id !== modalId),
        {
          id: modalId,
          isOpen: true,
          data,
        },
      ],
    }));
  }

  closeModal(modalId: string): void {
    this._uiState.update((state) => ({
      ...state,
      modals: state.modals.map((m) =>
        m.id === modalId ? { ...m, isOpen: false } : m
      ),
    }));
  }

  closeAllModals(): void {
    this._uiState.update((state) => ({
      ...state,
      modals: state.modals.map((m) => ({ ...m, isOpen: false })),
    }));
  }

  // Notification actions
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    this._notificationState.update((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  }

  markNotificationAsRead(notificationId: string): void {
    this._notificationState.update((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  }

  markAllNotificationsAsRead(): void {
    this._notificationState.update((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  }

  removeNotification(notificationId: string): void {
    this._notificationState.update((state) => {
      const notification = state.notifications.find(
        (n) => n.id === notificationId
      );
      return {
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId
        ),
        unreadCount: notification?.read
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      };
    });
  }

  clearNotifications(): void {
    this._notificationState.set({
      notifications: [],
      unreadCount: 0,
    });
  }

  // Theme actions
  setThemeMode(mode: 'light' | 'dark' | 'system'): void {
    this._themeState.update((state) => ({
      ...state,
      mode,
    }));
  }

  setPrimaryColor(color: string): void {
    this._themeState.update((state) => ({
      ...state,
      primaryColor: color,
    }));
  }

  setAccentColor(color: string): void {
    this._themeState.update((state) => ({
      ...state,
      accentColor: color,
    }));
  }

  setFontSize(size: 'small' | 'medium' | 'large'): void {
    this._themeState.update((state) => ({
      ...state,
      fontSize: size,
    }));
  }

  setReducedMotion(reduced: boolean): void {
    this._themeState.update((state) => ({
      ...state,
      reducedMotion: reduced,
    }));
  }

  setHighContrast(highContrast: boolean): void {
    this._themeState.update((state) => ({
      ...state,
      highContrast,
    }));
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private applyTheme(theme: ThemeState): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);

    // Apply font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[theme.fontSize]);

    // Apply dark mode class
    const isDark = theme.mode === 'dark';
    root.classList.toggle('dark', isDark);
  }

  // Public getters for reactive components
  get isAuthenticated$(): Observable<boolean> {
    return new BehaviorSubject(this.isAuthenticated());
  }

  get currentUser$(): Observable<UserState> {
    return new BehaviorSubject(this.currentUser());
  }

  get isLoading$(): Observable<boolean> {
    return new BehaviorSubject(this.isLoading());
  }

  get themeMode$(): Observable<'light' | 'dark' | 'system'> {
    return new BehaviorSubject(this.themeMode());
  }

  get isDarkMode$(): Observable<boolean> {
    return new BehaviorSubject(this.isDarkMode());
  }
}
