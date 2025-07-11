export interface IPayroll {
  id: number;
  employeeId: number;
  month: string; // e.g. '2024-06'
  grossSalary: number;
  netSalary: number;
}

export interface IPayslip {
  id: number;
  payrollId: number;
  employeeId: number;
  month: string;
  grossSalary: number;
  netSalary: number;
  deductions: { label: string; amount: number }[];
  allowances: { label: string; amount: number }[];
}
