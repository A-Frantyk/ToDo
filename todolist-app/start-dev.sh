#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "app" ]; then
    echo -e "${RED}❌ Error: Please run this script from the todolist-app directory${NC}"
    echo "Expected structure: todolist-app/server and todolist-app/app"
    exit 1
fi

# Kill any existing processes on port 4000
echo -e "${YELLOW}🧹 Cleaning up any existing processes...${NC}"
lsof -ti:4000 | xargs kill -9 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Start the Node.js server
echo -e "${BLUE}🚀 Starting Node.js TypeScript server with JWT authentication and SQLite database...${NC}"
cd server
npm run dev &
SERVER_PID=$!

# Wait for server to start and check if it's running
sleep 3
if ! ps -p $SERVER_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start Node.js server${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js server started successfully (PID: $SERVER_PID)${NC}"

# Start the Expo app
echo -e "${BLUE}🚀 Starting React Native app...${NC}"
cd ../app
npm run web &
APP_PID=$!

# Check if app started successfully
sleep 2
if ! ps -p $APP_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start React Native app${NC}"
    # Clean up server if app fails
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo -e "${GREEN}✅ React Native app started successfully (PID: $APP_PID)${NC}"

# Function to handle exit
function cleanup {
  echo ""
  echo "🛑 Stopping servers..."
  
  # Kill server process and its children
  if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping Node.js server (PID: $SERVER_PID)..."
    pkill -P $SERVER_PID  # Kill child processes first
    kill $SERVER_PID 2>/dev/null
  fi
  
  # Kill app process and its children
  if [ ! -z "$APP_PID" ]; then
    echo "Stopping React Native app (PID: $APP_PID)..."
    pkill -P $APP_PID  # Kill child processes first
    kill $APP_PID 2>/dev/null
  fi
  
  # Force kill any remaining nodemon or expo processes
  pkill -f "nodemon" 2>/dev/null
  pkill -f "ts-node" 2>/dev/null
  pkill -f "expo" 2>/dev/null
  pkill -f "node.*index.js" 2>/dev/null
  
  # Kill any processes using port 4000 (server port)
  lsof -ti:4000 | xargs kill -9 2>/dev/null
  
  echo "✅ All servers stopped successfully!"
  exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}🎉 Both servers are running successfully!${NC}"
echo -e "${YELLOW}📱 React Native app: http://localhost:19006${NC}"
echo -e "${YELLOW}🔧 Node.js server: http://localhost:4000${NC}"
echo -e "${BLUE}👉 Press Ctrl+C to stop both servers${NC}"
echo ""

# Keep script running and wait for processes
wait
