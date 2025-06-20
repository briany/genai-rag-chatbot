# Copilot Instructions for GenAI RAG Chatbot

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a GenAI-enabled RAG (Retrieval-Augmented Generation) chatbot MVP that allows users to upload documents and ask questions based on their content.

## Architecture
- **Backend**: Python FastAPI server with document processing and chat API
- **Frontend**: React TypeScript application with modern UI
- **Vector Store**: FAISS for local vector storage with BGE-M3 embeddings  
- **LLM**: OpenRouter API using qwen/qwen-2.5-14b-instruct:free model
- **Document Processing**: Supports PDF, DOCX, TXT files with chunking strategy
- **Deployment**: Docker containers for local development

## Key Components

### Backend (`/backend`)
- `main.py`: FastAPI application with CORS middleware
- `models/chat.py`: Pydantic models for chat requests/responses
- `services/document_processor.py`: Document parsing and text chunking
- `services/vector_store.py`: FAISS vector operations with BGE-M3 embeddings
- `services/llm_service.py`: OpenRouter API integration for LLM responses

### Frontend (`/frontend`)
- `src/App.tsx`: Main application component with document upload and chat interface
- `src/components/DocumentUpload.tsx`: Drag-and-drop file upload with progress
- `src/components/DocumentList.tsx`: Knowledge base document management
- `src/components/ChatInterface.tsx`: Chat UI with source attribution

## Development Guidelines

1. **Environment Variables**: Use `.env` files for configuration (see `.env.example`)
2. **Error Handling**: Implement proper error handling for API calls and file operations
3. **Type Safety**: Use TypeScript interfaces for all data structures
4. **Responsive Design**: Ensure mobile-friendly UI components
5. **Performance**: Implement loading states and optimize for large documents
6. **Security**: Validate file uploads and sanitize user inputs

## API Endpoints
- `POST /upload`: Upload and process documents
- `POST /chat`: Send chat messages and get RAG responses  
- `GET /documents`: List all documents in knowledge base
- `DELETE /documents/{doc_id}`: Delete specific document

## Dependencies
- **Backend**: FastAPI, sentence-transformers, faiss-cpu, PyPDF2, python-docx
- **Frontend**: React, TypeScript, Axios for API calls
- **Deployment**: Docker, docker-compose for local orchestration

When working on this project, prioritize:
- RAG accuracy and source attribution
- User experience and intuitive UI
- Proper error handling and loading states
- Clean separation between document processing and chat functionality
