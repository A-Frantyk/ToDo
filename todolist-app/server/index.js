const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

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

// Array to store todos
let todoList = [];

// Function to generate random ID
const generateID = () => Math.random().toString(36).substring(2, 10);

io.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Send todos to the client
    socket.emit("todos", todoList);

    // Add a todo
    socket.on("addTodo", (todo) => {
        todoList.unshift({ _id: generateID(), title: todo, comments: [] });
        io.emit("todos", todoList); // Broadcast to all clients
    });

    // Delete a todo
    socket.on("deleteTodo", (id) => {
        todoList = todoList.filter((todo) => todo._id !== id);
        io.emit("todos", todoList); // Broadcast to all clients
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
                user: data.user,
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
app.get("/todos", (req, res) => {
    res.json(todoList);
});

// Default route
app.get("/api", (req, res) => {
    res.json({
        message: "Hello world",
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
