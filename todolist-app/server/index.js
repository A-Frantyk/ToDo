const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

// Import database and authentication related modules
const db = require("./config/database");
const authRoutes = require("./routes/auth");
const { verifyToken } = require("./middleware/auth");

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

// Array to store todos
let todoList = [];

// Function to generate random ID
const generateID = () => Math.random().toString(36).substring(2, 10);

io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected! User ID: ${socket.user.id}, Username: ${socket.user.username}`);

    // Send todos to the client
    socket.emit("todos", todoList);

    // Add a todo
    socket.on("addTodo", (todo) => {
        const newTodo = {
            _id: generateID(),
            title: todo,
            comments: [],
            userId: socket.user.id,
            username: socket.user.username
        };
        todoList.unshift(newTodo);
        io.emit("todos", todoList); // Broadcast to all clients
    });

    // Delete a todo
    socket.on("deleteTodo", (id) => {
        // Only allow users to delete their own todos
        const todo = todoList.find(t => t._id === id);
        if (todo && todo.userId === socket.user.id) {
            todoList = todoList.filter((todo) => todo._id !== id);
            io.emit("todos", todoList); // Broadcast to all clients
        } else {
            socket.emit("error", { message: "Unauthorized: Cannot delete another user's todo" });
        }
    });

    // Retrieve comments for a specific todo
    socket.on("retrieveComments", (id) => {
        const result = todoList.filter((todo) => todo._id === id);
        if (result.length > 0) {
            socket.emit("displayComments", {
                comments: result[0].comments,
                todo_id: id
            });
        }
    });

    // Add a comment to a todo
    socket.on("addComment", (data) => {
        const result = todoList.filter((todo) => todo._id === data.todo_id);
        if (result.length > 0) {
            result[0].comments.unshift({
                id: generateID(),
                title: data.comment,
                user: socket.user.username,
                userId: socket.user.id
            });
            // Broadcast comments to all clients
            io.emit("displayComments", {
                comments: result[0].comments,
                todo_id: data.todo_id
            });
        }
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });
});

// API route to get todos
app.get("/todos", verifyToken, (req, res) => {
    res.json(todoList);
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
