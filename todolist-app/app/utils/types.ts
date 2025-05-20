export interface Comment {
  id: string;
  title: string;
  user: string;
}

export interface Todo {
  _id: string;
  title: string;
  comments: Comment[];
}

export interface UserData {
  username: string;
}
