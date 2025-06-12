export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  author: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  labels: string[];
  assignee: string | null;
  assignees: string[]; // Multiple assignees support
  columnId: string;
  createdAt: number;
  comments: Comment[];
  history: HistoryEntry[];
  hasNewComments?: boolean; // For notification indicator
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
  users: { [key: string]: User };
}

export type Priority = 'high' | 'medium' | 'low';

export interface CustomLabel {
  id: string;
  name: string;
  color: string;
}