export interface User {
  id: string;
  username: string;
  email: string;
}

export interface TaskCheckbox {
  id: string;
  text: string;
  checked: boolean;
}

export interface Task {
  id: string;
  name: string;
  comment: string;
  checkboxes: TaskCheckbox[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  userId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface CreateTaskData {
  name: string;
  comment?: string;
  checkboxes?: TaskCheckbox[];
}

export interface UpdateTaskData {
  name?: string;
  comment?: string;
  checkboxes?: TaskCheckbox[];
  completed?: boolean;
}
