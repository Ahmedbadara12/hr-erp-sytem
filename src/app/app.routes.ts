import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'employee',
    children: [
      {
        path: '',
        canActivate: [authGuard('HR')],
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-list/employee-list.component'
          ).then((m) => m.EmployeeListComponent),
      },
      {
        path: 'create',
        canActivate: [authGuard('HR')],
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-form/employee-form.component'
          ).then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'edit/:id',
        canActivate: [authGuard('HR')],
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-form/employee-form.component'
          ).then((m) => m.EmployeeFormComponent),
      },
      {
        path: 'profile/:id',
        canActivate: [authGuard(['Employee', 'HR', 'ProjectManager'])],
        loadComponent: () =>
          import(
            './features/employee-management/components/employee-profile/employee-profile.component'
          ).then((m) => m.EmployeeProfileComponent),
      },
    ],
  },
  {
    path: 'leave',
    canActivate: [authGuard(['Employee', 'HR'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/leave-management/components/leave-list/leave-list.component'
          ).then((m) => m.LeaveListComponent),
      },
      {
        path: 'apply',
        canActivate: [authGuard('Employee')],
        loadComponent: () =>
          import(
            './features/leave-management/components/leave-apply/leave-apply.component'
          ).then((m) => m.LeaveApplyComponent),
      },
    ],
  },
  {
    path: 'leave-approve',
    canActivate: [authGuard('HR')],
    loadComponent: () =>
      import(
        './features/leave-management/components/leave-approve/leave-approve.component'
      ).then((m) => m.LeaveApproveComponent),
  },
  {
    path: 'payroll',
    canActivate: [authGuard('Admin')],
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
    canActivate: [authGuard(['Admin', 'HR', 'Employee', 'ProjectManager'])],
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
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard()],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
