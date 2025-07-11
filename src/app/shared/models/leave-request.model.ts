export interface ILeaveRequest {
  id: number;
  employeeId: number;
  type: 'Annual' | 'Sick' | 'Unpaid';
  from: string; // ISO date string
  to: string; // ISO date string
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}
