import db from '../config/database';
import { Todo, Comment, TodoRow, CommentRow } from '../types';

class TodoModel {
    // Get all todos with their comments
    static getAllTodos(): Promise<Todo[]> {
        return new Promise((resolve, reject) => {
            // First get all todos
            const todosQuery = `SELECT * FROM todos ORDER BY created_at DESC`;
            
            db.all(todosQuery, [], (err: Error | null, todoRows: TodoRow[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (todoRows.length === 0) {
                    resolve([]);
                    return;
                }
                
                // Then get all comments for these todos
                const todoIds = todoRows.map(todo => todo.id);
                const placeholders = todoIds.map(() => '?').join(',');
                const commentsQuery = `
                    SELECT id, title, username as user, userId, todoId, created_at
                    FROM comments 
                    WHERE todoId IN (${placeholders})
                    ORDER BY created_at DESC
                `;
                
                db.all(commentsQuery, todoIds, (err: Error | null, commentRows: CommentRow[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    // Group comments by todoId
                    const commentsByTodo: { [key: string]: Comment[] } = {};
                    commentRows.forEach(comment => {
                        if (!commentsByTodo[comment.todoId]) {
                            commentsByTodo[comment.todoId] = [];
                        }
                        commentsByTodo[comment.todoId].push({
                            id: comment.id,
                            title: comment.title,
                            user: comment.username,
                            userId: comment.userId,
                            created_at: comment.created_at
                        });
                    });
                    
                    // Combine todos with their comments
                    const todos: Todo[] = todoRows.map(row => ({
                        _id: row.id,
                        title: row.title,
                        userId: row.userId,
                        username: row.username,
                        created_at: row.created_at,
                        comments: commentsByTodo[row.id] || []
                    }));
                    
                    resolve(todos);
                });
            });
        });
    }

    // Add a new todo
    static addTodo(id: string, title: string, userId: number, username: string): Promise<Todo> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO todos (id, title, userId, username) VALUES (?, ?, ?, ?)`;
            db.run(query, [id, title, userId, username], function(err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        _id: id,
                        title: title,
                        userId: userId,
                        username: username,
                        comments: []
                    });
                }
            });
        });
    }

    // Delete a todo
    static deleteTodo(id: string, userId: number): Promise<{ deletedId: string }> {
        return new Promise((resolve, reject) => {
            // First check if the todo belongs to the user
            const checkQuery = `SELECT userId FROM todos WHERE id = ?`;
            db.get(checkQuery, [id], (err: Error | null, row: { userId: number } | undefined) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Todo not found'));
                } else if (row.userId !== userId) {
                    reject(new Error('Unauthorized: Cannot delete another user\'s todo'));
                } else {
                    // Delete comments first (due to foreign key constraint)
                    const deleteCommentsQuery = `DELETE FROM comments WHERE todoId = ?`;
                    db.run(deleteCommentsQuery, [id], (err: Error | null) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Then delete the todo
                            const deleteTodoQuery = `DELETE FROM todos WHERE id = ?`;
                            db.run(deleteTodoQuery, [id], function(err: Error | null) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ deletedId: id });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Get comments for a specific todo
    static getComments(todoId: string): Promise<Comment[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, title, username as user, userId, created_at
                FROM comments 
                WHERE todoId = ? 
                ORDER BY created_at DESC
            `;
            db.all(query, [todoId], (err: Error | null, rows: CommentRow[]) => {
                if (err) {
                    reject(err);
                } else {
                    const comments: Comment[] = rows.map(row => ({
                        id: row.id,
                        title: row.title,
                        user: row.username,
                        userId: row.userId,
                        created_at: row.created_at
                    }));
                    resolve(comments);
                }
            });
        });
    }

    // Add a comment to a todo
    static addComment(commentId: string, todoId: string, title: string, userId: number, username: string): Promise<Comment> {
        return new Promise((resolve, reject) => {
            // First verify the todo exists
            const checkTodoQuery = `SELECT id FROM todos WHERE id = ?`;
            db.get(checkTodoQuery, [todoId], (err: Error | null, row: { id: string } | undefined) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Todo not found'));
                } else {
                    // Add the comment
                    const insertQuery = `INSERT INTO comments (id, title, todoId, userId, username) VALUES (?, ?, ?, ?, ?)`;
                    db.run(insertQuery, [commentId, title, todoId, userId, username], function(err: Error | null) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                id: commentId,
                                title: title,
                                user: username,
                                userId: userId
                            });
                        }
                    });
                }
            });
        });
    }
}

export default TodoModel;
