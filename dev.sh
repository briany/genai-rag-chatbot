#!/bin/bash

# GenAI RAG Chatbot Development Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}  GenAI RAG Chatbot Development Helper${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo
}

check_env() {
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
        cp backend/.env.example backend/.env
        echo -e "${RED}❗ Please edit backend/.env and add your OpenRouter API key!${NC}"
        echo
    fi
}

install_deps() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && pip install -r requirements.txt && cd ..
    
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
    echo
}

start_backend() {
    echo -e "${BLUE}🚀 Starting backend server...${NC}"
    cd backend
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
}

start_frontend() {
    echo -e "${BLUE}🚀 Starting frontend server...${NC}"
    cd frontend
    npm start
}

start_both() {
    echo -e "${BLUE}🚀 Starting both servers...${NC}"
    echo -e "${YELLOW}Backend will run on: http://localhost:8001${NC}"
    echo -e "${YELLOW}Frontend will run on: http://localhost:3000${NC}"
    echo
    echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
    echo
    
    # Start backend in background
    cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend in background  
    cd frontend && npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for Ctrl+C
    trap "echo -e '\n${YELLOW}Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  install     Install all dependencies"
    echo "  backend     Start backend server only"
    echo "  frontend    Start frontend server only"
    echo "  dev         Start both servers (default)"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0                # Start both servers"
    echo "  $0 dev            # Start both servers"
    echo "  $0 backend        # Start backend only"
    echo "  $0 install        # Install dependencies"
}

main() {
    print_header
    check_env
    
    case "${1:-dev}" in
        "install")
            install_deps
            ;;
        "backend")
            start_backend
            ;;
        "frontend")
            start_frontend
            ;;
        "dev"|"")
            start_both
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"
