import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

// Import database and authentication related modules
import db from "./config/database";
import authRoutes from "./routes/auth";
import { verifyToken, JWT_SECRET } from "./middleware/auth";
import TodoModel from "./models/todoModel";
import { 
    AuthenticatedRequest, 
    AuthenticatedSocket, 
    ServerToClientEvents, 
    ClientToServerEvents, 
    InterServerEvents, 
    SocketData,
    UserPayload,
    CommentCreateData,
    TodoCreateData
} from "./types";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, {
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
        
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        
        // Attach user data to socket
        (socket as AuthenticatedSocket).user = decoded;
        next();
    } catch (error) {
        console.error('Socket authentication error:', (error as Error).message);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Function to generate random ID
const generateID = (): string => Math.random().toString(36).substring(2, 10);

io.on("connection", async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    // Cast to AuthenticatedSocket since authentication middleware has already verified the user
    const authSocket = socket as AuthenticatedSocket;
    console.log(`⚡: ${socket.id} user just connected! User ID: ${authSocket.user.id}, Username: ${authSocket.user.username}`);

    // Send todos to the client
    try {
        const todos = await TodoModel.getAllTodos();
        socket.emit("todos", todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        socket.emit("error", { message: "Error fetching todos" });
    }

    // Add a todo
    socket.on("addTodo", async (todo: string) => {
        try {
            const newTodo = await TodoModel.addTodo(
                generateID(),
                todo,
                authSocket.user.id,
                authSocket.user.username
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
    socket.on("deleteTodo", async (id: string) => {
        try {
            await TodoModel.deleteTodo(id, authSocket.user.id);
            
            // Broadcast updated todos to all clients
            const todos = await TodoModel.getAllTodos();
            io.emit("todos", todos);
        } catch (error) {
            console.error('Error deleting todo:', error);
            socket.emit("error", { message: (error as Error).message });
        }
    });

    // Retrieve comments for a specific todo
    socket.on("retrieveComments", async (id: string) => {
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
    socket.on("addComment", async (data: CommentCreateData) => {
        try {
            await TodoModel.addComment(
                generateID(),
                data.todo_id,
                data.comment,
                authSocket.user.id,
                authSocket.user.username
            );
            
            // Get updated comments and broadcast to all clients
            const comments = await TodoModel.getComments(data.todo_id);
            io.emit("displayComments", {
                comments: comments,
                todo_id: data.todo_id
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            socket.emit("error", { message: (error as Error).message });
        }
    });

    socket.on("disconnect", () => {
        socket.disconnect();
        console.log("🔥: A user disconnected");
    });
});

// API route to get todos
app.get("/todos", verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const todos = await TodoModel.getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: "Error fetching todos" });
    }
});

// API route to add a todo
app.post("/todos", verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { title }: TodoCreateData = req.body;
        if (!title) {
            res.status(400).json({ error: "Title is required" });
            return;
        }
        
        const newTodo = await TodoModel.addTodo(
            generateID(),
            title,
            req.user!.id,
            req.user!.username
        );
        
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({ error: "Error adding todo" });
    }
});

// API route to delete a todo
app.delete("/todos/:id", verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await TodoModel.deleteTodo(id, req.user!.id);
        res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error('Error deleting todo:', error);
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('not found')) {
            res.status(403).json({ error: errorMessage });
        } else {
            res.status(500).json({ error: "Error deleting todo" });
        }
    }
});

// API route to get comments for a todo
app.get("/todos/:id/comments", verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
app.post("/todos/:id/comments", verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { comment }: { comment: string } = req.body;
        
        if (!comment) {
            res.status(400).json({ error: "Comment is required" });
            return;
        }
        
        const newComment = await TodoModel.addComment(
            generateID(),
            id,
            comment,
            req.user!.id,
            req.user!.username
        );
        
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('not found')) {
            res.status(404).json({ error: errorMessage });
        } else {
            res.status(500).json({ error: "Error adding comment" });
        }
    }
});

// Default route
app.get("/api", (req: Request, res: Response): void => {
    res.json({
        message: "Hello world",
    });
});

// Protected route example
app.get("/api/protected", verifyToken, (req: AuthenticatedRequest, res: Response): void => {
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
