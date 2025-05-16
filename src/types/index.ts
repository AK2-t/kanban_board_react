export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  labels: string[];
  assignee: string | null;
  columnId: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columns: { [key: string]: Column };
  columnOrder: string[];
}

export interface AppData {
  tasks: { [key: string]: Task };
  boards: { [key: string]: Board };
  boardOrder: string[];
}

export type Priority = 'high' | 'medium' | 'low';

export interface CustomLabel {
  id: string;
  name: string;
  color: string;
}