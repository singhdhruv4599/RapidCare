#!/bin/bash

echo "===================================="
echo "   RapidCare - Starting Application"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Build the application
echo "Building application..."
npm run build
echo ""

# Start the server
echo "Starting RapidCare on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npx wrangler pages dev dist --port 3000