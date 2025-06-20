# GenAI RAG Chatbot MVP

A GenAI-enabled, RAG-based chatbot that allows users to upload documents and ask questions based on their content. This MVP demonstrates core functionality using local document sources with an intuitive web interface.

## Features

- 📄 **Document Upload**: Support for PDF, DOCX, and TXT files
- 🔍 **Vector Search**: FAISS-powered semantic search with BGE-M3 embeddings
- 🤖 **AI Responses**: Context-aware answers using OpenRouter API (qwen/qwen-2.5-14b-instruct)
- 📚 **Source Attribution**: Transparent source references for all answers
- 🎨 **Modern UI**: React-based interface with drag-and-drop upload
- 🐳 **Docker Ready**: Containerized for easy local deployment

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI       │    │   OpenRouter    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   LLM API       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   FAISS Vector  │
                       │   Store + BGE-M3│
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Docker & Docker Compose (optional)
- OpenRouter API key

### 1. Environment Setup

Create a `.env` file in the backend directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenRouter API key:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Development Commands

**Quick Start (Recommended):**
```bash
# Start both backend and frontend servers
./dev.sh

# Or specify individual commands
./dev.sh install   # Install all dependencies
./dev.sh backend   # Start backend only
./dev.sh frontend  # Start frontend only
./dev.sh help      # Show all options
```

**Manual Commands:**

**Start Backend Server:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start Frontend Server:**
```bash
cd frontend
npm start
```

**Install Dependencies:**
```bash
# Backend dependencies
cd backend && pip install -r requirements.txt

# Frontend dependencies  
cd frontend && npm install
```

### 3. Option B: Docker Deployment

```bash
# Set your OpenRouter API key
export OPENROUTER_API_KEY=your_api_key_here

# Start all services
docker-compose up --build
```

## Usage

1. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

2. **Upload Documents**
   - Drag and drop files or click to browse
   - Supported formats: PDF, DOCX, TXT
   - Documents are automatically processed and indexed

3. **Ask Questions**
   - Type questions about your uploaded documents
   - Receive contextual answers with source references
   - View relevant document chunks that informed each response

## API Documentation

### Endpoints

- `GET /` - API health check
- `POST /upload` - Upload and process documents
- `POST /chat` - Send chat messages and receive RAG responses
- `GET /documents` - List all documents in knowledge base
- `DELETE /documents/{doc_id}` - Delete specific document

### Example Chat Request

```json
{
  "message": "What are the main topics discussed in the documents?"
}
```

### Example Chat Response

```json
{
  "response": "Based on the uploaded documents, the main topics include...",
  "sources": [
    {
      "document_name": "example.pdf",
      "chunk_text": "Relevant text chunk...",
      "score": 0.85
    }
  ]
}
```

## Technical Details

### Document Processing
- **Chunking Strategy**: Sliding window with 1000 character chunks and 200 character overlap
- **Boundary Detection**: Attempts to end chunks at sentence or paragraph boundaries
- **Metadata Tracking**: Preserves source document and chunk position information

### Vector Storage
- **Embedding Model**: BGE-M3 (1024-dimensional embeddings)
- **Vector Database**: FAISS with L2 distance for similarity search
- **Persistence**: Index and metadata saved to disk for persistence across restarts

### LLM Integration
- **Model**: qwen/qwen-2.5-14b-instruct:free via OpenRouter
- **Context Window**: Up to 5 most relevant document chunks per query
- **Temperature**: 0.7 for balanced creativity and accuracy

## Project Structure

```
agent four/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── models/
│   │   └── chat.py         # Pydantic models
│   └── services/
│       ├── document_processor.py  # Document parsing
│       ├── vector_store.py        # FAISS operations
│       └── llm_service.py         # OpenRouter integration
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   └── components/
│   │       ├── ChatInterface.tsx    # Chat UI
│   │       ├── DocumentUpload.tsx   # File upload
│   │       └── DocumentList.tsx     # Document management
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Multi-container deployment
└── README.md              # This file
```

## Success Metrics (MVP Goals)

- ✅ End-to-end document upload and Q&A functionality
- ✅ Sub-3 second average response latency
- ✅ Clear RAG traceability with source attribution
- ✅ Support for PDF, DOCX, and TXT documents
- ✅ Modern, responsive web interface

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm test
```

### Code Quality
- Backend: Uses FastAPI with Pydantic for type safety
- Frontend: TypeScript with ESLint for code quality
- Error handling: Comprehensive error states and user feedback

## Troubleshooting

### Common Issues

1. **Backend won't start**: Check if OpenRouter API key is set in `.env`
2. **Upload fails**: Ensure backend is running on port 8000
3. **No responses**: Verify OpenRouter API key is valid and has credits
4. **Docker issues**: Make sure ports 3000 and 8000 are available

### Logs
- Backend logs: Check FastAPI server output
- Frontend logs: Open browser developer console
- Docker logs: `docker-compose logs [service_name]`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper error handling
4. Test thoroughly with various document types
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

Future enhancements could include:
- User authentication and multi-tenancy
- Support for additional document formats
- Advanced chunking strategies
- Real-time collaborative features
- Production deployment guides
- Performance monitoring and analytics
