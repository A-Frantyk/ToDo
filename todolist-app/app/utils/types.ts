export interface Comment {
  id: string;
  title: string;
  user: string;
  userId?: string;
}

export interface Todo {
  _id: string;
  title: string;
  comments: Comment[];
  userId?: string;
  username?: string;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}
