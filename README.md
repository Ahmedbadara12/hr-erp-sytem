# HR ERP System - Enhanced Version

A comprehensive Human Resources Enterprise Resource Planning (HR ERP) system built with Angular 17 and .NET 8, featuring modern UI/UX, accessibility, performance optimizations, and comprehensive state management.

## 🚀 Features

### Core HR Modules

- **Employee Management**: Complete employee lifecycle management
- **Leave Management**: Leave requests, approvals, and tracking
- **Payroll Management**: Salary processing and payslip generation
- **Task Management**: Project and task assignment system
- **Learning Management**: Training and development tracking
- **User Authentication**: Role-based access control

### Enhanced UI/UX

- **Modern Design**: Clean, professional interface with Odoo-inspired design
- **Responsive Layout**: Mobile-first design with tablet and desktop optimization
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Loading States**: Skeleton screens and progress indicators
- **Animations**: Smooth transitions with reduced motion support

### Advanced Features

- **Real-time Notifications**: Toast notifications with multiple types and auto-dismiss
- **Dashboard Analytics**: Key metrics and performance indicators
- **State Management**: Angular signals-based global state management
- **Form Validation**: Comprehensive client-side validation with accessibility
- **Mobile Optimization**: Touch-friendly interface with gesture support

## 🛠 Technology Stack

### Frontend

- **Angular 17**: Latest version with standalone components
- **TypeScript**: Strongly typed development
- **Bootstrap 5**: Responsive CSS framework
- **Font Awesome**: Icon library
- **Angular Signals**: Modern state management
- **RxJS**: Reactive programming

### Backend

- **.NET 8**: Latest .NET framework
- **Entity Framework Core**: ORM for database operations
- **SQL Server**: Database management system
- **ASP.NET Core Web API**: RESTful API services

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 480px - Optimized for touch interaction
- **Tablet**: 480px - 768px - Balanced layout
- **Desktop**: > 768px - Full feature set

### Mobile Features

- Touch-optimized buttons (44px minimum)
- Swipe gestures for navigation
- Collapsible sidebar
- Mobile-first navigation
- Optimized form inputs

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: High contrast ratios for all text
- **Focus Indicators**: Clear focus states for all interactive elements
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast Mode**: Enhanced visibility options

### Accessibility Improvements

- Skip navigation links
- Screen reader only text
- Proper heading hierarchy
- Alt text for images
- Form labels and descriptions
- Error message associations

## 🎨 Theming System

### Theme Features

- **CSS Variables**: Dynamic theming with CSS custom properties
- **Dark Mode**: Automatic system preference detection
- **Color Schemes**: Customizable primary and accent colors
- **Font Sizing**: Adjustable text sizes (small, medium, large)
- **High Contrast**: Enhanced visibility mode
- **Reduced Motion**: Respects user preferences

### Theme Customization

```scss
:root {
  --primary: #7c3aed;
  --primary-light: #a78bfa;
  --primary-dark: #5b21b6;
  --background: #f7f6fb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
}
```

## 🔔 Notification System

### Features

- **Multiple Types**: Success, error, warning, info
- **Auto-dismiss**: Configurable duration
- **Manual Control**: Close buttons and actions
- **Progress Indicators**: Visual countdown
- **Stacking**: Multiple notifications support
- **Accessibility**: Screen reader announcements

### Usage

```typescript
// Basic notification
this.notificationService.showSuccess("Operation completed successfully");

// With details and custom duration
this.notificationService.showError("Failed to save", "Network timeout", 10000);

// Info and warning notifications
this.notificationService.showInfo("New update available");
this.notificationService.showWarning("Please review your data");
```

## 📊 Dashboard Analytics

### Key Metrics

- **Employee Count**: Total active employees
- **Leave Requests**: Pending and approved leaves
- **Task Completion**: Project progress tracking
- **Payroll Summary**: Monthly payroll statistics

### Analytics Features

- **Real-time Updates**: Live data refresh
- **Interactive Charts**: Visual data representation
- **Trend Analysis**: Historical data comparison
- **Export Capabilities**: Data export functionality

## 🔄 State Management

### Angular Signals Implementation

```typescript
// State interfaces
export interface AppState {
  user: UserState;
  ui: UIState;
  notifications: NotificationState;
  theme: ThemeState;
}

// Signal-based state
private readonly _userState = signal<UserState>({
  isAuthenticated: false,
  userId: null,
  username: null,
  role: null,
  profile: null
});

// Computed selectors
public readonly isAuthenticated = computed(() => this._userState().isAuthenticated);
public readonly currentUser = computed(() => this._userState());
```

### State Features

- **Reactive Updates**: Automatic UI updates on state changes
- **Type Safety**: Full TypeScript support
- **Performance**: Efficient change detection
- **Debugging**: DevTools integration
- **Persistence**: Local storage integration

## 🧪 Testing

### Unit Tests

- **Service Testing**: Comprehensive service coverage
- **Component Testing**: Isolated component testing
- **State Testing**: Signal-based state testing
- **Accessibility Testing**: Screen reader compatibility

### Test Coverage

- Notification service: 100% coverage
- Form validation: Comprehensive testing
- State management: Full coverage
- Accessibility: Automated testing

## 🚀 Performance Optimizations

### Frontend Optimizations

- **Lazy Loading**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Bundle Optimization**: Minimized bundle sizes
- **Caching**: Service worker implementation
- **Image Optimization**: WebP format support

### Backend Optimizations

- **Async Operations**: Non-blocking I/O
- **Database Indexing**: Optimized queries
- **Caching**: Redis integration
- **Compression**: Gzip compression
- **CDN**: Static asset delivery

## 📱 Mobile Optimization

### Touch Interface

- **Touch Targets**: 44px minimum button sizes
- **Gesture Support**: Swipe and tap gestures
- **Viewport Optimization**: Proper mobile viewport
- **Touch Feedback**: Visual touch feedback

### Mobile Features

- **Offline Support**: Service worker caching
- **Push Notifications**: Real-time updates
- **Progressive Web App**: Installable app experience
- **Mobile Navigation**: Touch-optimized navigation

## 🔒 Security Features

### Authentication

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Session Management**: Secure session handling
- **CSRF Protection**: Cross-site request forgery protection

### Data Protection

- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **HTTPS Enforcement**: Secure communication

## 🛠 Development Setup

### Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK
- SQL Server or SQLite
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/hr-erp.git
cd hr-erp
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Install backend dependencies**

```bash
cd hr-erp-api
dotnet restore
```

4. **Configure database**

```bash
dotnet ef database update
```

5. **Start development servers**

```bash
# Frontend (Angular)
npm start

# Backend (.NET)
dotnet run
```

### Environment Configuration

```json
{
  "apiUrl": "https://localhost:7001",
  "environment": "development",
  "enableAnalytics": false,
  "enableNotifications": true
}
```

## 📦 Build and Deployment

### Production Build

```bash
# Frontend build
npm run build:prod

# Backend build
dotnet publish -c Release
```

### Docker Deployment

```dockerfile
# Frontend Dockerfile
FROM nginx:alpine
COPY dist/hr-erp /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY bin/Release/net8.0/publish/ App/
WORKDIR /App
ENTRYPOINT ["dotnet", "hr-erp-api.dll"]
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
dotnet test

# E2E tests
npm run e2e
```

### Test Coverage

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical user flows
- **Accessibility Tests**: Automated a11y testing

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### Employee Endpoints

```
GET /api/employees
POST /api/employees
PUT /api/employees/{id}
DELETE /api/employees/{id}
```

### Leave Management

```
GET /api/leaves
POST /api/leaves
PUT /api/leaves/{id}/approve
PUT /api/leaves/{id}/reject
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow Angular style guide
2. **Testing**: Write tests for new features
3. **Accessibility**: Ensure a11y compliance
4. **Documentation**: Update relevant docs
5. **Performance**: Consider performance impact

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Comprehensive guides and tutorials
- **Issues**: GitHub issues for bug reports
- **Discussions**: Community discussions
- **Email**: support@hr-erp.com

### Community

- **Discord**: Join our community server
- **Blog**: Technical articles and updates
- **Newsletter**: Monthly updates and tips

## 🔄 Changelog

### Version 2.0.0 (Latest)

- ✨ Enhanced notification system
- 🎨 Improved theming with dark mode
- ♿ Comprehensive accessibility improvements
- 📱 Mobile-first responsive design
- 🔄 Angular signals state management
- 🧪 Comprehensive testing suite
- ⚡ Performance optimizations
- 🔒 Enhanced security features

### Version 1.0.0

- 🚀 Initial release
- 👥 Basic employee management
- 📅 Leave management system
- 💰 Payroll processing
- 🔐 Authentication system

## 🏆 Acknowledgments

- **Angular Team**: For the excellent framework
- **Bootstrap Team**: For the responsive CSS framework
- **Font Awesome**: For the icon library
- **Community Contributors**: For feedback and improvements

---

**Built with ❤️ by the HR ERP Team**
