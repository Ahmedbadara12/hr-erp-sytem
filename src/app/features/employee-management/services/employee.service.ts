import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IEmployee } from '../../../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private mockEmployees: IEmployee[] = [
    {
      id: 1,
      name: 'Alice Smith',
      email: 'alice@example.com',
      position: 'Developer',
      department: 'IT',
      phone: '123-456-7890',
      address: '123 Main St',
      dateOfBirth: '1990-01-01',
      hireDate: '2020-06-15',
    },
    {
      id: 2,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      position: 'Manager',
      department: 'HR',
      phone: '987-654-3210',
      address: '456 Elm St',
      dateOfBirth: '1985-05-20',
      hireDate: '2018-03-10',
    },
    {
      id: 3,
      name: 'Carol Lee',
      email: 'carol.lee@example.com',
      position: 'QA Engineer',
      department: 'IT',
      phone: '555-123-4567',
      address: '789 Oak Ave',
      dateOfBirth: '1992-09-15',
      hireDate: '2021-01-20',
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@example.com',
      position: 'HR Specialist',
      department: 'HR',
      phone: '555-987-6543',
      address: '321 Pine Rd',
      dateOfBirth: '1988-04-10',
      hireDate: '2019-11-05',
    },
    {
      id: 5,
      name: 'Eva Green',
      email: 'eva.green@example.com',
      position: 'Accountant',
      department: 'Finance',
      phone: '555-222-3333',
      address: '654 Maple St',
      dateOfBirth: '1995-12-22',
      hireDate: '2022-03-18',
    }
  ];

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<IEmployee[]> {
    // Replace with HttpClient call when backend is ready
    return of(this.mockEmployees);
  }

  getEmployeeById(id: number): Observable<IEmployee | undefined> {
    return of(this.mockEmployees.find((emp) => emp.id === id));
  }

  addEmployee(employee: IEmployee): Observable<IEmployee> {
    // Assign a new ID (mock logic)
    const newId =
      this.mockEmployees.length > 0
        ? Math.max(...this.mockEmployees.map((e) => e.id)) + 1
        : 1;
    const newEmployee = { ...employee, id: newId };
    this.mockEmployees.push(newEmployee);
    return of(newEmployee);
  }

  updateEmployee(
    id: number,
    employee: IEmployee
  ): Observable<IEmployee | undefined> {
    const index = this.mockEmployees.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      this.mockEmployees[index] = { ...employee, id };
      return of(this.mockEmployees[index]);
    }
    return of(undefined);
  }

  deleteEmployee(id: number): Observable<boolean> {
    const index = this.mockEmployees.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      this.mockEmployees.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Add create, update, delete methods as needed
}
