import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Login from './screens/Login';
import Home from './screens/Home';
import Comments from './screens/Comments';
import { RootStackParamList } from './utils/navigationTypes';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main navigation component that uses auth state
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7b68ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1e1e1e' },
        }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Comments" component={Comments} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Root component that provides the auth context
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
});
