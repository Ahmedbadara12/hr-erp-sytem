export interface IEmployee {
  id: number;
  name: string;
  email: string;
  position?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string; // ISO format
  hireDate?: string; // ISO format
  salary?: number;
  emergencyContact?: string;
}
