import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IPayroll, IPayslip } from '../../../shared/models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private mockPayrolls: IPayroll[] = [
    {
      id: 1,
      employeeId: 1,
      month: '2024-06',
      grossSalary: 5000,
      netSalary: 4200,
    },
    {
      id: 2,
      employeeId: 2,
      month: '2024-06',
      grossSalary: 6000,
      netSalary: 5100,
    },
  ];

  private mockPayslips: IPayslip[] = [
    {
      id: 1,
      payrollId: 1,
      employeeId: 1,
      month: '2024-06',
      grossSalary: 5000,
      netSalary: 4200,
      deductions: [
        { label: 'Tax', amount: 500 },
        { label: 'Insurance', amount: 300 },
      ],
      allowances: [
        { label: 'Bonus', amount: 0 },
        { label: 'Transport', amount: 0 },
      ],
    },
    {
      id: 2,
      payrollId: 2,
      employeeId: 2,
      month: '2024-06',
      grossSalary: 6000,
      netSalary: 5100,
      deductions: [
        { label: 'Tax', amount: 600 },
        { label: 'Insurance', amount: 300 },
      ],
      allowances: [
        { label: 'Bonus', amount: 200 },
        { label: 'Transport', amount: 0 },
      ],
    },
  ];

  getPayrolls(): Observable<IPayroll[]> {
    return of(this.mockPayrolls);
  }

  setPayrolls(payrolls: IPayroll[]) {
    this.mockPayrolls = payrolls;
  }

  getPayslipByPayrollId(payrollId: number): Observable<IPayslip | undefined> {
    return of(this.mockPayslips.find((p) => p.payrollId === payrollId));
  }
}
