#!/bin/bash

# Arduino Launchpad - Development Server Startup Script

echo "🚀 Starting Arduino Launchpad..."
echo ""
echo "📋 Prerequisites:"
echo "  ✅ Node.js installed"
echo "  ✅ npm packages installed (npm install)"
echo "  ✅ .env.local configured with GEMINI_API_KEY"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "   Please create .env.local with your GEMINI_API_KEY"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY" .env.local; then
    echo "❌ Error: GEMINI_API_KEY not found in .env.local"
    echo "   Please add: GEMINI_API_KEY=your_key_here"
    exit 1
fi

echo "✅ Configuration looks good!"
echo ""
echo "Starting servers..."
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run both servers
npm run dev:all
