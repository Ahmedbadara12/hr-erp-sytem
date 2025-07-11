# HR ERP System

A web-based Human Resources ERP system built with Angular. This application manages employees, leave requests, and payroll with role-based access control for Admin, HR, and Employee users.

## 🚀 Features

- **Employee Management**
  - Add, edit, view, and delete employee records
  - Fields: name, email, position, department, phone, address, date of birth, hire date
- **Leave Management**
  - Employees can apply for leave
  - HR can approve or reject leave requests
- **Payroll Management**
  - Admin users can view payroll data and payslips
- **Role-Based Access**
  - 🔐 **Admin:** Access to Payroll only
  - 👩‍💼 **HR:** Manage Employees and Leave
  - 👨‍💻 **Employee:** Manage own data, apply for leave
- **Responsive UI**
  - Built using Bootstrap 5 for a clean and modern UX

## 👥 User Roles Overview

| Role     | Access                              |
| -------- | ----------------------------------- |
| Admin    | Payroll module only                 |
| HR       | Full Employee and Leave mgmt        |
| Employee | View/edit own data, apply for leave |

> **Note:** Authentication is mocked for demo purposes – roles are selected manually at login.

## 🧰 Tech Stack

- **Frontend:** Angular 16+
- **UI Framework:** Bootstrap 5
- **Language:** TypeScript
- **Testing:** Jasmine + Karma (unit), Protractor/Cypress (e2e)

## 📸 Screenshots

| HR Dashboard                             | Leave Application                         |
| ---------------------------------------- | ----------------------------------------- |
| ![HR View](screenshots/hr-dashboard.png) | ![Leave Form](screenshots/leave-form.png) |

## 🌐 Live Demo

[View Demo](https://your-app-url.com)

## 📝 Project Scope

- **Frontend-only:** This project is a frontend Angular SPA. All data is currently managed in-memory (mock data/services). No backend/API integration is included by default.
- **Backend/API:** To connect to a real backend, update the services in `src/app/features/*/services/` to use your API endpoints.

## 🏗️ Project Structure

```text
src/
├── app/
│   ├── core/            # Auth, guards, interceptors
│   ├── features/
│   │   ├── employee-management/
│   │   ├── leave-management/
│   │   └── payroll/
│   ├── shared/          # Reusable components and models
│   └── app.routes.ts
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Installation

```bash
git clone <your-repo-url>
cd hr-erp
npm install
```

### Running the Development Server

```bash
ng serve
```

Visit [http://localhost:4200](http://localhost:4200) in your browser.

### Build for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## 💡 Usage

- **Login:** On the login screen, users select a predefined role (Admin, HR, Employee) from a dropdown (for demo purposes). This simulates authentication.
- **Navigation:**
  - Admin: Sees only Payroll in the menu.
  - HR: Sees Employees and Leave.
  - Employee: Sees Employees and Leave.
- **Employee Management:** Add, edit, and view employee details (HR and Employee roles).
- **Leave Management:** Apply for and approve leave (HR and Employee roles).
- **Payroll:** View payroll and payslips (Admin role).

## 🛠️ Customization

- **Add More Fields:** Update `IEmployee` in `src/app/shared/models/employee.model.ts` and the employee form/profile components.
- **Add More Roles:** Update `UserRole` in `src/app/core/services/auth.service.ts` and adjust guards/routes as needed.
- **UI Customization:** Modify Bootstrap classes in component templates and `src/styles.scss`.

## 🔒 Security/Access Note

This demo uses mocked authentication for simplicity. For production, integrate real authentication (e.g., JWT, OAuth) and secure all API endpoints and routes accordingly.

## 🤝 Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a pull request

## 🧪 Testing

- Run unit tests:
  ```bash
  ng test
  ```
- Run end-to-end tests:
  ```bash
  ng e2e
  ```

## License

MIT (or your chosen license)
