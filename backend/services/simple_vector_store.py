import os
import json
import uuid
from typing import List, Dict, Any
import logging
from models.chat import DocumentChunk, Source

logger = logging.getLogger(__name__)

class SimpleVectorStore:
    """A simple in-memory vector store for testing purposes."""
    
    def __init__(self):
        logger.info("Initializing SimpleVectorStore...")
        self.documents: Dict[str, DocumentChunk] = {}
        self.doc_metadata: Dict[str, Dict] = {}
        self.metadata_file = "simple_documents_metadata.json"
        
        self._load_existing_data()
        logger.info("SimpleVectorStore initialization complete")
    
    def _load_existing_data(self):
        """Load existing metadata if available."""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, 'r') as f:
                    self.doc_metadata = json.load(f)
                logger.info(f"Loaded {len(self.doc_metadata)} document metadata records")
            except Exception as e:
                logger.error(f"Failed to load metadata: {e}")
                self.doc_metadata = {}
    
    def _save_metadata(self):
        """Save metadata to file."""
        try:
            with open(self.metadata_file, 'w') as f:
                json.dump(self.doc_metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save metadata: {e}")
    
    async def add_document(self, filename: str, chunks: List[DocumentChunk]) -> str:
        """Add a document and its chunks to the store."""
        doc_id = str(uuid.uuid4())
        
        # Store document chunks
        for i, chunk in enumerate(chunks):
            # Update the chunk with document_id
            chunk.document_id = doc_id
            chunk_id = chunk.id
            self.documents[chunk_id] = chunk
        
        # Store document metadata
        self.doc_metadata[doc_id] = {
            "filename": filename,
            "chunk_count": len(chunks),
            "doc_id": doc_id
        }
        
        self._save_metadata()
        logger.info(f"Added document {filename} with {len(chunks)} chunks")
        return doc_id
    
    async def search(self, query: str, k: int = 5) -> List[DocumentChunk]:
        """Simple keyword search (for testing - not semantic)."""
        try:
            query_lower = query.lower().strip()
            # Extract meaningful words from query (remove common words)
            stop_words = {'what', 'is', 'how', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '?', '!', '.', ','}
            query_words = [word for word in query_lower.split() if word not in stop_words and len(word) > 1]
            
            print(f"Searching for words: {query_words}")
            
            results = []
            
            for chunk in self.documents.values():
                content_lower = chunk.content.lower()
                # Count matches for each query word
                matches = sum(1 for word in query_words if word in content_lower)
                
                # If at least one word matches, include it
                if matches > 0:
                    results.append((chunk, matches))
            
            # Sort by number of matches (descending)
            results.sort(key=lambda x: x[1], reverse=True)
            
            print(f"Found {len(results)} results")
            
            # Return up to k results (just the chunks, not the scores)
            return [chunk for chunk, _ in results[:k]]
            
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all documents in the store."""
        return list(self.doc_metadata.values())
    
    async def delete_document(self, doc_id: str) -> bool:
        """Delete a document and all its chunks."""
        if doc_id not in self.doc_metadata:
            return False
        
        # Remove all chunks for this document
        chunks_to_remove = [
            chunk_id for chunk_id, chunk in self.documents.items()
            if chunk.document_id == doc_id
        ]
        
        for chunk_id in chunks_to_remove:
            del self.documents[chunk_id]
        
        # Remove metadata
        del self.doc_metadata[doc_id]
        self._save_metadata()
        
        logger.info(f"Deleted document {doc_id}")
        return True
