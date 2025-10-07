// src/types/tasks.ts
export type TaskStatus = 'Todo' | 'InProgress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  projectId: string;           // UUID string
  title: string;
  description?: string;
  assigneeId?: string;         // UUID string (was 'assignee')
  status: TaskStatus;          // Updated values
  priority: TaskPriority;
  dueDate?: string;            // ISO string
  createdAt?: string;
  updatedAt?: string;
  // Virtual fields (computed from relations)
  projectName?: string;        // From Project
  assigneeName?: string;       // From User
}

export interface TaskPayload {
  projectId: string;           // Required UUID
  title: string;
  description?: string;
  assigneeId?: string | null; // ✅ Allow null
  status: TaskStatus;          // Required
  priority: TaskPriority;      // Required
  dueDate?: string | null;     // ISO date string or null
}