const TodoModel = require('./models/todoModel');
const db = require('./config/database');

async function testDatabase() {
    console.log('Testing database operations...');
    
    try {
        // Test adding a todo
        console.log('\n1. Testing addTodo...');
        const todoId = 'test-todo-' + Math.random().toString(36).substring(2, 10);
        const newTodo = await TodoModel.addTodo(todoId, 'Test Todo', 1, 'testuser');
        console.log('✅ Todo added:', newTodo);
        
        // Test getting all todos
        console.log('\n2. Testing getAllTodos...');
        const todos = await TodoModel.getAllTodos();
        console.log('✅ Todos retrieved:', todos.length, 'todos found');
        
        // Test adding a comment
        console.log('\n3. Testing addComment...');
        const commentId = 'test-comment-' + Math.random().toString(36).substring(2, 10);
        const newComment = await TodoModel.addComment(commentId, todoId, 'Test Comment', 1, 'testuser');
        console.log('✅ Comment added:', newComment);
        
        // Test getting comments
        console.log('\n4. Testing getComments...');
        const comments = await TodoModel.getComments(todoId);
        console.log('✅ Comments retrieved:', comments);
        
        // Test getting todos with comments
        console.log('\n5. Testing getAllTodos with comments...');
        const todosWithComments = await TodoModel.getAllTodos();
        console.log('✅ Todos with comments:', todosWithComments);
        
        // Test deleting todo
        console.log('\n6. Testing deleteTodo...');
        await TodoModel.deleteTodo(todoId, 1);
        console.log('✅ Todo deleted successfully');
        
        console.log('\n🎉 All database tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

// Run tests
testDatabase();
