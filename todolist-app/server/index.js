const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

// Import database and authentication related modules
const db = require("./config/database");
const authRoutes = require("./routes/auth");
const { verifyToken } = require("./middleware/auth");
const TodoModel = require("./models/todoModel");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*", // Accept connections from any origin for mobile app
        methods: ["GET", "POST"]
    }
});

// Socket.io middleware for JWT validation
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }
        
        // Import JWT_SECRET here to avoid circular dependencies
        const { JWT_SECRET } = require('./middleware/auth');
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);
        
        // Attach user data to socket
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Function to generate random ID
const generateID = () => Math.random().toString(36).substring(2, 10);

io.on("connection", async (socket) => {
    console.log(`⚡: ${socket.id} user just connected! User ID: ${socket.user.id}, Username: ${socket.user.username}`);

    // Send todos to the client
    try {
        const todos = await TodoModel.getAllTodos();
        socket.emit("todos", todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        socket.emit("error", { message: "Error fetching todos" });
    }

    // Add a todo
    socket.on("addTodo", async (todo) => {
        try {
            const newTodo = await TodoModel.addTodo(
                generateID(),
                todo,
                socket.user.id,
                socket.user.username
            );
            
            // Broadcast updated todos to all clients
            const todos = await TodoModel.getAllTodos();
            io.emit("todos", todos);
        } catch (error) {
            console.error('Error adding todo:', error);
            socket.emit("error", { message: "Error adding todo" });
        }
    });

    // Delete a todo
    socket.on("deleteTodo", async (id) => {
        try {
            await TodoModel.deleteTodo(id, socket.user.id);
            
            // Broadcast updated todos to all clients
            const todos = await TodoModel.getAllTodos();
            io.emit("todos", todos);
        } catch (error) {
            console.error('Error deleting todo:', error);
            socket.emit("error", { message: error.message });
        }
    });

    // Retrieve comments for a specific todo
    socket.on("retrieveComments", async (id) => {
        try {
            const comments = await TodoModel.getComments(id);
            socket.emit("displayComments", {
                comments: comments,
                todo_id: id
            });
        } catch (error) {
            console.error('Error retrieving comments:', error);
            socket.emit("error", { message: "Error retrieving comments" });
        }
    });

    // Add a comment to a todo
    socket.on("addComment", async (data) => {
        try {
            await TodoModel.addComment(
                generateID(),
                data.todo_id,
                data.comment,
                socket.user.id,
                socket.user.username
            );
            
            // Get updated comments and broadcast to all clients
            const comments = await TodoModel.getComments(data.todo_id);
            io.emit("displayComments", {
                comments: comments,
                todo_id: data.todo_id
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            socket.emit("error", { message: error.message });
        }
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });
});

// API route to get todos
app.get("/todos", verifyToken, async (req, res) => {
    try {
        const todos = await TodoModel.getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: "Error fetching todos" });
    }
});

// API route to add a todo
app.post("/todos", verifyToken, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        
        const newTodo = await TodoModel.addTodo(
            generateID(),
            title,
            req.user.id,
            req.user.username
        );
        
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({ error: "Error adding todo" });
    }
});

// API route to delete a todo
app.delete("/todos/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await TodoModel.deleteTodo(id, req.user.id);
        res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error('Error deleting todo:', error);
        if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Error deleting todo" });
        }
    }
});

// API route to get comments for a todo
app.get("/todos/:id/comments", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await TodoModel.getComments(id);
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: "Error fetching comments" });
    }
});

// API route to add a comment to a todo
app.post("/todos/:id/comments", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        
        if (!comment) {
            return res.status(400).json({ error: "Comment is required" });
        }
        
        const newComment = await TodoModel.addComment(
            generateID(),
            id,
            comment,
            req.user.id,
            req.user.username
        );
        
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Error adding comment" });
        }
    }
});

// Default route
app.get("/api", (req, res) => {
    res.json({
        message: "Hello world",
    });
});

// Protected route example
app.get("/api/protected", verifyToken, (req, res) => {
    res.json({
        message: "This is a protected route",
        user: req.user
    });
});

// Auth routes
app.use("/auth", authRoutes);

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
