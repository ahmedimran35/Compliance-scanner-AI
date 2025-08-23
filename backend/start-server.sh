#!/bin/bash

echo "🚀 Starting ComplianceScanner Backend Server..."

# Kill any existing processes on port 3001
echo "🔧 Checking for existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Port 3001 is free"

# Wait a moment for processes to fully terminate
sleep 2

# Start the development server
echo "✅ Starting server on port 3001..."
npm run dev 