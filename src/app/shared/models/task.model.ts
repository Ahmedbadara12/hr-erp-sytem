export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  dueDate: string; // ISO date string
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  comments: string[];
} 