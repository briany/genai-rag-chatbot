import os
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

from services.document_processor import DocumentProcessor
from services.simple_vector_store import SimpleVectorStore
from services.llm_service import LLMService
from models.chat import ChatRequest, ChatResponse, Source

load_dotenv()

app = FastAPI(title="GenAI RAG Chatbot", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services will be initialized lazily
document_processor = None
vector_store = None
llm_service = None

def get_document_processor():
    global document_processor
    if document_processor is None:
        document_processor = DocumentProcessor()
    return document_processor

def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = SimpleVectorStore()
    return vector_store

def get_llm_service():
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service

@app.get("/")
async def root():
    return {"message": "GenAI RAG Chatbot API"}

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process documents for the knowledge base."""
    try:
        processed_docs = []
        for file in files:
            if not file.filename:
                continue
                
            # Save uploaded file temporarily
            temp_path = f"/tmp/{file.filename}"
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Process document
            chunks = await get_document_processor().process_document(temp_path)
            
            # Add to vector store
            doc_id = await get_vector_store().add_document(file.filename, chunks)
            processed_docs.append({
                "filename": file.filename,
                "document_id": doc_id,
                "chunks_count": len(chunks)
            })
            
            # Clean up temp file
            os.remove(temp_path)
        
        return {"message": "Documents processed successfully", "documents": processed_docs}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat request and return a response with sources."""
    try:
        # Retrieve relevant documents
        relevant_docs = await get_vector_store().search(request.message, k=5)
        
        # Convert DocumentChunk objects to Source objects for LLM service
        sources = []
        for doc in relevant_docs:
            source = Source(
                document_name=doc.metadata.get("source", "Unknown"),
                chunk_text=doc.content,
                score=1.0  # Simple vector store doesn't provide scores
            )
            sources.append(source)
        
        # Generate response using LLM
        response = await get_llm_service().generate_response(
            question=request.message,
            context_docs=sources
        )
        
        return ChatResponse(
            response=response["answer"],
            sources=response["sources"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """List all documents in the knowledge base."""
    try:
        documents = await get_vector_store().list_documents()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug/chunks")
async def debug_chunks():
    """Debug endpoint to see all stored chunks."""
    try:
        vs = get_vector_store()
        chunks_info = []
        for chunk_id, chunk in vs.documents.items():
            chunks_info.append({
                "id": chunk.id,
                "document_id": chunk.document_id,
                "content": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                "metadata": chunk.metadata
            })
        return {"chunks": chunks_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document from the knowledge base."""
    try:
        success = await get_vector_store().delete_document(doc_id)
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-search")
async def test_search(query: str = "RAG"):
    """Test endpoint to debug search functionality."""
    try:
        vs = get_vector_store()
        print(f"Testing search for: {query}")
        results = await vs.search(query, k=3)
        print(f"Search returned {len(results)} results")
        
        search_results = []
        for result in results:
            search_results.append({
                "id": result.id,
                "content": result.content[:200] + "..." if len(result.content) > 200 else result.content,
                "metadata": result.metadata
            })
        
        return {"query": query, "results": search_results}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug/chunks")
async def debug_chunks():
    """Debug endpoint to see all stored chunks."""
    try:
        vs = get_vector_store()
        chunks_info = []
        for chunk_id, chunk in vs.documents.items():
            chunks_info.append({
                "id": chunk.id,
                "document_id": chunk.document_id,
                "content": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                "metadata": chunk.metadata
            })
        return {"chunks": chunks_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document from the knowledge base."""
    try:
        success = await get_vector_store().delete_document(doc_id)
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
