import { Request } from 'express';
import { Socket } from 'socket.io';

// User types
export interface User {
  id: number;
  username: string;
  password?: string;
  created_at?: string;
}

export interface UserPayload {
  id: number;
  username: string;
}

// Todo types
export interface Todo {
  _id: string;
  title: string;
  userId: number;
  username: string;
  created_at?: string;
  comments: Comment[];
}

export interface TodoCreateData {
  title: string;
}

// Comment types
export interface Comment {
  id: string;
  title: string;
  user: string;
  userId: number;
  created_at?: string;
}

export interface CommentCreateData {
  todo_id: string;
  comment: string;
}

// Database row types
export interface TodoRow {
  id: string;
  title: string;
  userId: number;
  username: string;
  created_at: string;
}

export interface CommentRow {
  id: string;
  title: string;
  todoId: string;
  userId: number;
  username: string;
  created_at: string;
}

// Express request with user
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Socket with user
export interface AuthenticatedSocket extends Socket {
  user: UserPayload;
}

// Socket event handlers
export interface ServerToClientEvents {
  todos: (todos: Todo[]) => void;
  displayComments: (data: { comments: Comment[]; todo_id: string }) => void;
  error: (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  addTodo: (todo: string) => void;
  deleteTodo: (id: string) => void;
  retrieveComments: (id: string) => void;
  addComment: (data: CommentCreateData) => void;
}

export interface InterServerEvents {
  // Inter-server events if needed
}

export interface SocketData {
  user: UserPayload;
}
