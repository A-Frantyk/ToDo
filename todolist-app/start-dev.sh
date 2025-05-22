#!/bin/bash

# Start the Node.js server
echo "Starting Node.js server with JWT authentication..."
cd server
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start the Expo app
echo "Starting React Native app..."
cd ../app
npm run web &
APP_PID=$!

# Function to handle exit
function cleanup {
  echo "Stopping servers..."
  kill $SERVER_PID
  kill $APP_PID
  exit 0
}

# Set up trap to catch SIGINT (Ctrl+C)
trap cleanup SIGINT

echo ""
echo "🚀 Both servers are running!"
echo "👉 Press Ctrl+C to stop both servers"
echo ""

# Keep script running
wait
