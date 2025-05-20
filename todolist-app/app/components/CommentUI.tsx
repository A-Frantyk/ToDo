import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Comment } from '../utils/types';

type CommentUIProps = {
  item: Comment;
};

const CommentUI = ({ item }: CommentUIProps) => {
  return (
    <View style={styles.commentContainer}>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{item.title}</Text>
      </View>
      <Text style={styles.username}>{item.user}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: '#3d3d3d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
  },
  username: {
    color: '#9370db',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default CommentUI;
