#!/bin/bash
set -e

echo "🚀 SimulatedWorld Dashboard Startup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

# Build Next.js
echo ""
echo "🔨 Building Next.js app..."
npm run build

# Start the servers
echo ""
echo "🎯 Starting servers..."
echo "   - Next.js: http://localhost:3001"
echo "   - WebSocket: ws://localhost:3002"
echo ""
echo "Dashboard will be available at http://localhost:3001"
echo ""

npm start
