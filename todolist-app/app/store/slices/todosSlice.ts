import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Todo } from '../../utils/types';

interface TodosState {
  items: Todo[];
  loading: boolean;
}

const initialState: TodosState = {
  items: [],
  loading: false,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.items.push(action.payload);
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(todo => todo._id !== action.payload);
    },
  },
});

export const { setTodos, setLoading, addTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
