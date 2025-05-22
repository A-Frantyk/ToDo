# JWT Authentication Implementation

## Overview
This implementation adds JWT (JSON Web Token) authentication to the Todo List API server using SQLite as the database for storing user credentials.

## Features
- User registration and login with JWT authentication
- Password hashing with bcrypt for security
- Protected API routes with JWT verification
- Socket.io connections secured with JWT tokens
- SQLite database for persistent user storage

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ "username": "your_username", "password": "your_password" }`
  - Returns: JWT token and user details

- `POST /auth/login` - Login with existing credentials
  - Body: `{ "username": "your_username", "password": "your_password" }`
  - Returns: JWT token and user details

- `GET /auth/profile` - Get user profile (protected route)
  - Header: `Authorization: Bearer <token>`
  - Returns: User profile data

### Protected Routes
- `GET /api/protected` - Example protected route
  - Header: `Authorization: Bearer <token>`
  - Returns: Success message and user data

- `GET /todos` - Get all todos (now protected)
  - Header: `Authorization: Bearer <token>`
  - Returns: Array of todos

## Socket.io Authentication
To authenticate WebSocket connections, include the JWT token in the connection:

```javascript
// Client-side example
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## Testing Authentication
A test script is included at `server/test-auth.js` to verify that authentication is working correctly. Run it with:

```bash
cd server
node test-auth.js
```

## Note for Frontend Integration
To integrate this authentication with the existing React Native app, you'll need to:

1. Implement login/register screens
2. Store JWT token in secure storage
3. Include the token in API requests and socket connections
4. Handle authentication errors appropriately
