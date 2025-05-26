import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import socket from '../utils/socket';
import { Todo as TodoType } from '../utils/types';
import { RootStackParamList } from '../utils/navigationTypes';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { removeTodo } from '../store/slices/todosSlice';

type TodoProps = {
  item: TodoType;
};

const Todo = ({ item }: TodoProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const handleDeleteTodo = (id: string) => {
    if (item.userId && user && String(item.userId) !== String(user.id)) {
      Alert.alert('Unauthorized', 'You can only delete your own todos');
      return;
    }
    socket.emit('deleteTodo', id);
    dispatch(removeTodo(id));
  };

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        onPress={() => 
          navigation.navigate('Comments', { 
            todo_id: item._id, 
            title: item.title 
          })
        }
        style={styles.todoContent}
      >
        <Text style={styles.todoTitle}>{item.title}</Text>
        <View style={styles.todoMeta}>
          {item.username && (
            <Text style={styles.todoCreator}>
              By: {item.username}
            </Text>
          )}
          <Text style={styles.commentCount}>
            {item.comments.length > 0 ? `${item.comments.length} comments` : 'Add comment'}
          </Text>
        </View>
      </TouchableOpacity>
      {/* Only show delete button if user is the creator */}
      {(!item.userId || (user && String(item.userId) === String(user.id))) && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTodo(item._id)}>
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  todoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoCreator: {
    color: '#aaaaaa',
    fontSize: 12,
    marginRight: 8,
  },
  commentCount: {
    color: '#9370db',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 4,
  },
});

export default Todo;
