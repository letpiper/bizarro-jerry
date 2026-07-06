#!/bin/bash
set -e

echo "🚀 SimulatedWorld Dashboard (Development Mode)"
echo "=============================================="
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

# Start the development servers
echo ""
echo "🎯 Starting development servers..."
echo "   - Next.js: http://localhost:3001"
echo "   - WebSocket: ws://localhost:3002"
echo ""
echo "Dashboard will be available at http://localhost:3001"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
