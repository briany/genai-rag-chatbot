#!/bin/bash

# GenAI RAG Chatbot Setup Script

echo "🚀 Setting up GenAI RAG Chatbot..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies."
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies."
    exit 1
fi
cd ..

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your OpenRouter API key!"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env and add your OpenRouter API key"
echo "2. Run: npm run start"
echo "3. Or use VS Code tasks: Ctrl/Cmd+Shift+P -> 'Tasks: Run Task' -> 'Start Full Application'"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API docs will be available at: http://localhost:8000/docs"
