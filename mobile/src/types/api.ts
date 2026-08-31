export interface User {
  id: string;
  name: string;
  email: string;
  currency?: string;
  timezone?: string;
  reminderHour?: number;
  reminderMinute?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}