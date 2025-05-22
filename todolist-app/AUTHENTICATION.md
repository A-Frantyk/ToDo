# JWT Authentication Implementation

This document describes how JWT authentication is implemented in the TodoList application.

## Server-side Implementation

The server uses JWT (JSON Web Tokens) for authentication with SQLite as the database to store user information.

### Key Components:

1. **Database Setup** (`server/config/database.js`):
   - Creates a SQLite database file (auth.db)
   - Defines a users table with fields for username and password

2. **Authentication Middleware** (`server/middleware/auth.js`):
   - Verifies JWT tokens in request headers
   - Adds user data to request objects

3. **Authentication Routes** (`server/routes/auth.js`):
   - `/auth/register` - Creates new users and issues JWT
   - `/auth/login` - Authenticates users and issues JWT
   - `/auth/profile` - Returns user profile data (protected)

4. **Socket.io Authentication**:
   - Uses JWT for authenticating WebSocket connections
   - Attaches user data to socket object

## Client-side Implementation

The client app integrates JWT auth with a context-based approach for managing authentication state.

### Key Components:

1. **Authentication Context** (`app/context/AuthContext.tsx`):
   - Manages JWT token storage and authentication state
   - Provides login, register, and logout functions
   - Makes auth state available throughout the app

2. **Token Storage**:
   - Uses AsyncStorage to persist tokens between app launches
   - Stores both token and user data

3. **API Authorization**:
   - Adds JWT to Authorization header for API requests
   - Handles token validation and renewal

4. **Socket.io Authentication**:
   - Initializes socket connection with token
   - Handles authentication errors

## Authentication Flow

1. **Registration/Login**:
   - User enters credentials
   - Server validates credentials
   - Server generates JWT token and sends it to client
   - Client stores token in AsyncStorage

2. **Making Authenticated Requests**:
   - REST API: Add token to Authorization header
   - WebSockets: Include token in connection auth object

3. **Token Validation**:
   - Server verifies token signature and expiration
   - If valid, allows access to protected resources
   - If invalid, returns 401/403 error

4. **Logout**:
   - Remove token from AsyncStorage
   - Disconnect and reconnect WebSocket without token

## Testing Authentication

Use the `server/test-auth.js` script to test JWT authentication:

```
node server/test-auth.js
```

This will:
1. Register a test user (or log in if already exists)
2. Access a protected route with the token
3. Test access without token (should fail)
