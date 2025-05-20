import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import socket, { SOCKET_URL } from '../utils/socket';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigationTypes';
import { Comment } from '../utils/types';
import CommentUI from '../components/CommentUI';

type Props = NativeStackScreenProps<RootStackParamList, 'Comments'>;

export default function Comments({ route, navigation }: Props) {
  const { todo_id, title } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Function to retrieve comments
  const fetchComments = () => {
    socket.emit('retrieveComments', todo_id);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchComments();
    // If no response after 3 seconds, stop refreshing animation
    setTimeout(() => {
      if (refreshing) {
        setRefreshing(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error retrieving username:', error);
      }
    };

    getUsername();

    // Emit event to retrieve comments for this todo
    fetchComments();

    // Listen for comments from server
    socket.on('displayComments', (data: { comments: Comment[], todo_id: string }) => {
      // Only update comments if they're for this todo
      if (data.todo_id === todo_id) {
        setComments(data.comments);
        setLoading(false);
        setRefreshing(false);
      }
    });

    // Clean up on unmount
    return () => {
      socket.off('displayComments');
    };
  }, [todo_id, navigation]);

  const handleAddComment = () => {
    if (commentInput.trim().length === 0 || !username) return;

    socket.emit('addComment', {
      todo_id,
      comment: commentInput,
      user: username,
    });

    setCommentInput('');
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <CommentUI item={item} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7b68ee" />
            <Text style={styles.loadingText}>Loading comments...</Text>
          </View>
        ) : (
          <>
            {comments.length > 0 ? (
              <FlatList
                data={comments}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.commentsList}
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
                <Text style={styles.emptyText}>No comments yet. Add the first comment!</Text>
              </View>
            )}
          </>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
          value={commentInput}
          onChangeText={setCommentInput}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleAddComment}>
          <Ionicons name="send" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#1e1e1e',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  commentsList: {
    padding: 16,
  },
  // Removed unused comment styles as we're now using CommentUI component
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2d2d2d',
  },
  input: {
    flex: 1,
    backgroundColor: '#3d3d3d',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#7b68ee',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
