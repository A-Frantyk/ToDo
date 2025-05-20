import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import socket, { SOCKET_URL } from '../utils/socket';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigationTypes';
import { Todo as TodoInterface } from '../utils/types';
import Todo from '../components/Todo';
import ShowModal from '../components/ShowModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  const [todos, setTodos] = useState<TodoInterface[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch todos function that can be reused
  const fetchTodos = async () => {
    try {
      // Use the same URL as socket.io connection for consistency
      const todosEndpoint = `${SOCKET_URL}/todos`;
      const response = await fetch(todosEndpoint);
      const data = await response.json();
      setTodos(data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to fetch todos. Pull down to retry.');
    }
  };

  // Handle refresh when pulling down the list
  const onRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  useEffect(() => {
    // Get username from AsyncStorage
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          navigation.navigate('Login');
          return;
        }
        setUsername(storedUsername);
      } catch (error) {
        console.error('Error retrieving username:', error);
        navigation.navigate('Login');
      }
    };

    getUsername();
    
    // Fetch todos initially
    fetchTodos();

    // Socket event listeners for real-time updates
    socket.on('todos', (data: TodoInterface[]) => {
      setTodos(data);
      setLoading(false);
    });

    // Clean up
    return () => {
      socket.off('todos');
    };
  }, [navigation]);

  // Removed handleAddTodo method as it's now handled in the ShowModal component

  // Removed the handleDeleteTodo and navigateToComments methods as they're now handled in the Todo component

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('username');
      navigation.navigate('Login');
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
        <Text style={styles.welcomeText}>Welcome, {username}!</Text>
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

      {/* Using our new ShowModal component */}
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
  // Removed todo item styles as we're now using a separate Todo component
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
  // Removed modal styles as we're now using a separate ShowModal component
});
