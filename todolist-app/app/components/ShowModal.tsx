import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { addTodo } from '../store/slices/todosSlice';

interface ShowModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ShowModal = ({ visible, setVisible }: ShowModalProps) => {
  const [todoInput, setTodoInput] = useState<string>('');
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const handleAddTodo = () => {
    if (todoInput.trim().length === 0) {
      Alert.alert('Error', 'Todo cannot be empty');
      return;
    }

    // Emit to socket and let the server create the todo
    socket.emit('addTodo', todoInput);
    setTodoInput('');
    setVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Todo</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            placeholderTextColor="#999"
            value={todoInput}
            onChangeText={setTodoInput}
            autoFocus
            multiline
          />
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTodo}>
            <Text style={styles.buttonText}>Add Todo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#3d3d3d',
    borderRadius: 5,
    padding: 15,
    color: '#ffffff',
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#7b68ee',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ShowModal;
