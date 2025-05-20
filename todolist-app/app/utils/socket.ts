import { io } from "socket.io-client";
import { Platform } from 'react-native';

// IMPORTANT: When testing on physical devices, you need to use your computer's local IP address
// To find your IP address:
// - On macOS/Linux: Run `ipconfig getifaddr en0` in terminal
// - On Windows: Run `ipconfig` in command prompt and look for IPv4 Address
// Then replace the URL below with your IP address:
// Example: const SOCKET_URL = "http://192.168.1.100:4000";

// For physical devices using Expo Go, uncomment and update this:
// const SOCKET_URL = "http://YOUR_COMPUTER_IP_HERE:4000"; 

// For simulator/emulator:
export const SOCKET_URL = "http://localhost:4000";

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Add event listeners for connection monitoring
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected, reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  
  if (Platform.OS !== 'web') {
    console.log('If running on a physical device, make sure to update SOCKET_URL with your computer\'s IP address');
  }
});

export default socket;
