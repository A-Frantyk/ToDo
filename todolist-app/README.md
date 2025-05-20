# Real-Time TodoList App

A beautiful real-time todo list app built with React Native, TypeScript, and Socket.io, based on the [Novu blog article](https://novu.co/blog/how-to-build-the-most-beautiful-todolist-with-react-native-and-socket-io/).

## Features

- 🔐 User authentication with AsyncStorage
- ✅ Create and delete todos
- 💬 Add comments to todos
- ⚡ Real-time updates across devices using Socket.io
- 🌙 Modern dark theme UI

## Tech Stack

- **Frontend**:
  - React Native with Expo
  - TypeScript
  - React Navigation
  - Socket.io Client
  - AsyncStorage

- **Backend**:
  - Node.js
  - Express
  - Socket.io

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Expo Go app (for mobile testing)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todolist-app
   ```

2. Install dependencies for both server and client:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../app
   npm install
   ```

3. Configure the Socket.io connection:
   - Navigate to `/app/utils/socket.ts`
   - For physical device testing, update the `SOCKET_URL` with your machine's IP address:
     ```typescript
     // Find your IP on macOS with: ipconfig getifaddr en0
     // On Windows with: ipconfig (look for IPv4 Address)
     const SOCKET_URL = "http://YOUR_IP_ADDRESS:4000";
     ```
   - Your current IP address is: 192.168.0.166

4. Start the server:
   ```bash
   cd server
   npm start
   ```

5. Start the React Native app:
   ```bash
   cd ../app
   npm start
   ```

6. Scan the QR code with your Expo Go app or run on a simulator.

## Project Structure

```
todolist-app/
   app/                   # React Native application
      screens/            # App screens
         Comments.tsx     # Comments screen
         Home.tsx         # Home screen with todo list
         Login.tsx        # Login screen
      utils/              # Utility files
         socket.ts        # Socket.io configuration
         types.ts         # TypeScript interfaces
         navigationTypes.ts # Navigation type definitions
   server/                # Node.js server
      index.js            # Express & Socket.io server
```

## Future Improvements

- Add a database for persistent storage
- Add user authentication with JWT
- Add push notifications for new comments
- Add todo completion status
- Add due dates and reminders
