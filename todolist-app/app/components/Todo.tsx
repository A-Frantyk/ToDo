import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import socket from '../utils/socket';
import { Todo as TodoType } from '../utils/types';
import { RootStackParamList } from '../utils/navigationTypes';

type TodoProps = {
  item: TodoType;
};

const Todo = ({ item }: TodoProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDeleteTodo = (id: string) => {
    socket.emit('deleteTodo', id);
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
        <Text style={styles.commentCount}>
          {item.comments.length > 0 ? `${item.comments.length} comments` : 'Add comment'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item._id)}>
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
      </TouchableOpacity>
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
