import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigationTypes';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { login, register, error } = useAuth();

  const handleSubmit = async () => {
    if (username.trim().length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }
    
    if (password.trim().length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login({ username, password });
      } else {
        await register({ username, password });
      }
      // No need to navigate - the AuthProvider will handle redirection
    } catch (err) {
      Alert.alert(
        isLoginMode ? 'Login Failed' : 'Registration Failed',
        error || 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.welcomeText}>Welcome to TodoList App</Text>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{isLoginMode ? 'Login' : 'Create Account'}</Text>
        
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {isLoginMode ? 'Login' : 'Register'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={toggleAuthMode}
          disabled={isLoading}>
          <Text style={styles.switchModeText}>
            {isLoginMode 
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#3d3d3d',
    borderRadius: 5,
    padding: 12,
    color: '#ffffff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7b68ee',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#5a5a5a',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchModeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#9370db',
    fontSize: 14,
  },
});
