import os
import json
import uuid
import faiss
import numpy as np
from typing import List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import sentence transformers with error handling
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import sentence_transformers: {e}")
    SENTENCE_TRANSFORMERS_AVAILABLE = False

from models.chat import DocumentChunk, Source

class VectorStore:
    """Manages document embeddings and vector search using FAISS."""
    
    def __init__(self):
        logger.info("Initializing VectorStore...")
        
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError("sentence_transformers is not available")
        
        try:
            logger.info("Loading sentence transformer model...")
            # Use a very simple and stable model
            self.model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
            
        self.dimension = 384  # all-MiniLM-L6-v2 embedding dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self.documents: Dict[str, DocumentChunk] = {}
        self.doc_metadata: Dict[str, Dict] = {}
        self.index_file = "vector_index.faiss"
        self.metadata_file = "documents_metadata.json"
        
        logger.info("Loading existing data...")
        self._load_existing_data()
        logger.info("VectorStore initialization complete")
    
    def _load_existing_data(self):
        """Load existing index and metadata if available."""
        if os.path.exists(self.index_file):
            self.index = faiss.read_index(self.index_file)
        
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r') as f:
                data = json.load(f)
                self.doc_metadata = data.get('metadata', {})
                # Reconstruct documents dict from metadata
                for doc_id, metadata in self.doc_metadata.items():
                    chunk = DocumentChunk(
                        text=metadata['text'],
                        metadata=metadata['metadata'],
                        chunk_id=metadata['chunk_id']
                    )
                    self.documents[doc_id] = chunk
    
    def _save_data(self):
        """Save index and metadata to disk."""
        faiss.write_index(self.index, self.index_file)
        
        # Convert documents to serializable format
        serializable_metadata = {}
        for doc_id, chunk in self.documents.items():
            serializable_metadata[doc_id] = {
                'text': chunk.text,
                'metadata': chunk.metadata,
                'chunk_id': chunk.chunk_id
            }
        
        with open(self.metadata_file, 'w') as f:
            json.dump({'metadata': serializable_metadata}, f)
    
    async def add_document(self, filename: str, chunks: List[DocumentChunk]) -> str:
        """Add document chunks to the vector store."""
        doc_id = str(uuid.uuid4())
        
        # Generate embeddings for all chunks
        texts = [chunk.text for chunk in chunks]
        embeddings = self.model.encode(texts)
        
        # Add embeddings to FAISS index
        self.index.add(embeddings.astype('float32'))
        
        # Store chunk metadata
        for i, chunk in enumerate(chunks):
            chunk_doc_id = f"{doc_id}_{i}"
            chunk.metadata['document_id'] = doc_id
            chunk.metadata['document_name'] = filename
            self.documents[chunk_doc_id] = chunk
            self.doc_metadata[chunk_doc_id] = {
                'document_id': doc_id,
                'document_name': filename,
                'chunk_index': i
            }
        
        self._save_data()
        return doc_id
    
    async def search(self, query: str, k: int = 5) -> List[Source]:
        """Search for relevant document chunks."""
        if self.index.ntotal == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.model.encode([query])
        
        # Search in FAISS index
        scores, indices = self.index.search(query_embedding.astype('float32'), k)
        
        sources = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx == -1:  # No more results
                break
                
            # Find corresponding document chunk
            chunk_keys = list(self.documents.keys())
            if idx < len(chunk_keys):
                chunk_key = chunk_keys[idx]
                chunk = self.documents[chunk_key]
                
                source = Source(
                    document_name=chunk.metadata.get('document_name', 'Unknown'),
                    chunk_text=chunk.text,
                    score=float(score)
                )
                sources.append(source)
        
        return sources
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all documents in the knowledge base."""
        documents = {}
        
        for chunk_id, chunk in self.documents.items():
            doc_id = chunk.metadata.get('document_id')
            doc_name = chunk.metadata.get('document_name', 'Unknown')
            
            if doc_id not in documents:
                documents[doc_id] = {
                    'document_id': doc_id,
                    'document_name': doc_name,
                    'chunk_count': 0
                }
            
            documents[doc_id]['chunk_count'] += 1
        
        return list(documents.values())
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document and its chunks from the vector store."""
        # Find chunks belonging to this document
        chunks_to_remove = []
        indices_to_remove = []
        
        for i, (chunk_key, chunk) in enumerate(self.documents.items()):
            if chunk.metadata.get('document_id') == doc_id:
                chunks_to_remove.append(chunk_key)
                indices_to_remove.append(i)
        
        if not chunks_to_remove:
            return False
        
        # Remove chunks from documents dict
        for chunk_key in chunks_to_remove:
            del self.documents[chunk_key]
            if chunk_key in self.doc_metadata:
                del self.doc_metadata[chunk_key]
        
        # Rebuild FAISS index (simple approach for MVP)
        if self.documents:
            texts = [chunk.text for chunk in self.documents.values()]
            embeddings = self.model.encode(texts)
            
            # Create new index
            self.index = faiss.IndexFlatL2(self.dimension)
            self.index.add(embeddings.astype('float32'))
        else:
            # Empty index
            self.index = faiss.IndexFlatL2(self.dimension)
        
        self._save_data()
        return True
