export type Role = 'manager' | 'executor';

export interface Profile {
  id: string;
  email: string;
  role: Role;
}

export interface ProjectObject {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

export type TaskStatus = 'new' | 'in_progress' | 'review' | 'rework' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  object_id: string;
  assignee_id: string;
  status: TaskStatus;
  author_id: string;
  rework_comment: string | null;
  created_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  changed_by: string;
  from_status: string;
  to_status: string;
  comment: string | null;
  created_at: string;
}

// Словари для UI
export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  review: 'На проверке',
  rework: 'На доработке',
  done: 'Принята',
};

export const ROLE_LABELS: Record<Role, string> = {
  manager: 'Постановщик',
  executor: 'Исполнитель',
};