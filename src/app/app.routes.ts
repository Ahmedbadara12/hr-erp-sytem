import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'employee',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-list/employee-list.component'
          ).then((m) => m.EmployeeListComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-form/employee-form.component'
          ).then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-form/employee-form.component'
          ).then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'profile/:id',
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-profile/employee-profile.component'
          ).then((m) => m.EmployeeProfileComponent),
      },
    ],
  },
  {
    path: 'leave',
    canActivate: [authGuard('Employee')],
    loadComponent: () =>
      import(
        './features/leave-management/components/leave-list/leave-list.component'
      ).then((m) => m.LeaveListComponent),
  },
  {
    path: 'payroll',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/payroll/components/payroll-list/payroll-list.component'
          ).then((m) => m.PayrollListComponent),
      },
      {
        path: 'payslip/:id',
        loadComponent: () =>
          import(
            './features/payroll/components/payslip/payslip.component'
          ).then((m) => m.PayslipComponent),
      },
    ],
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/task-management/components/task-list.component').then(
        (m) => m.TaskListComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/auth/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
    canActivate: [authGuard(['Admin', 'HR', 'Employee'])],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  { path: '', redirectTo: 'employee', pathMatch: 'full' },
  { path: '**', redirectTo: 'employee' },
];
