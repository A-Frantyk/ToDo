import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import socket, { SOCKET_URL, initializeSocket } from '../utils/socket';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigationTypes';
import { Todo as TodoInterface } from '../utils/types';
import Todo from '../components/Todo';
import ShowModal from '../components/ShowModal';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTodos, setLoading } from '../store/slices/todosSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const { user, token, logout } = useAuth();
  const dispatch = useAppDispatch();
  const todos = useAppSelector(state => state.todos.items);
  const loading = useAppSelector(state => state.todos.loading);

  // Fetch todos function that can be reused
  const fetchTodos = async () => {
    try {
      if (!token) {
        throw new Error('No auth token available');
      }
      dispatch(setLoading(true));
      const todosEndpoint = `${SOCKET_URL}/todos`;
      const response = await fetch(todosEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          Alert.alert('Authentication Error', 'Please log in again');
          await logout();
          return;
        }
        throw new Error('Failed to fetch todos');
      }
      
      const data = await response.json();
      dispatch(setTodos(data));
      dispatch(setLoading(false));
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      dispatch(setLoading(false));
      setRefreshing(false);
      Alert.alert('Error', 'Failed to fetch todos. Pull down to retry.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  useEffect(() => {
    const setupSocketAndFetchTodos = async () => {
      try {
        await initializeSocket();
        
        fetchTodos();

        socket.on('todos', (data: TodoInterface[]) => {
          dispatch(setTodos(data));
          dispatch(setLoading(false));
        });
        
        socket.on('error', (error) => {
          Alert.alert('Error', error.message || 'An error occurred');
        });
      } catch (error) {
        console.error('Error setting up socket or fetching todos:', error);
        dispatch(setLoading(false));
      }
    };

    setupSocketAndFetchTodos();

    return () => {
      socket.off('todos');
      socket.off('error');
    };
  }, [token, dispatch]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderItem = ({ item }: { item: TodoInterface }) => (
    <Todo item={item} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7b68ee" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
      </View>

      {todos.length > 0 ? (
        <FlatList
          data={todos}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.todoList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7b68ee']}
              tintColor={'#7b68ee'}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No todos yet. Add one to get started!</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      <ShowModal visible={modalVisible} setVisible={setModalVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#1e1e1e',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  welcomeText: {
    color: '#9370db',
    fontSize: 16,
  },
  todoList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#7b68ee',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
