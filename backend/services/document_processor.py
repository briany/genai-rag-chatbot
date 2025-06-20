import os
import uuid
from typing import List
import PyPDF2
from docx import Document
import aiofiles
from models.chat import DocumentChunk

class DocumentProcessor:
    """Handles document parsing and text extraction."""
    
    def __init__(self):
        self.chunk_size = 1000
        self.chunk_overlap = 200
    
    async def process_document(self, file_path: str) -> List[DocumentChunk]:
        """Process a document and return text chunks."""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            text = await self._extract_pdf_text(file_path)
        elif file_extension == '.docx':
            text = await self._extract_docx_text(file_path)
        elif file_extension == '.txt':
            text = await self._extract_txt_text(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        chunks = self._create_chunks(text, os.path.basename(file_path))
        return chunks
    
    async def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    async def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    async def _extract_txt_text(self, file_path: str) -> str:
        """Extract text from TXT file."""
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
            text = await file.read()
        return text
    
    def _create_chunks(self, text: str, filename: str) -> List[DocumentChunk]:
        """Split text into chunks with overlap."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]
            
            # Try to end at a sentence boundary
            if end < len(text):
                last_period = chunk_text.rfind('.')
                last_newline = chunk_text.rfind('\n')
                if last_period > len(chunk_text) * 0.8:
                    end = start + last_period + 1
                    chunk_text = text[start:end]
                elif last_newline > len(chunk_text) * 0.8:
                    end = start + last_newline + 1
                    chunk_text = text[start:end]
            
            chunk = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id="",  # Will be set by vector store
                content=chunk_text.strip(),
                metadata={
                    "source": filename,
                    "chunk_index": len(chunks),
                    "start_pos": start,
                    "end_pos": end
                }
            )
            
            chunks.append(chunk)
            start = end - self.chunk_overlap
            
            if start >= len(text):
                break
        
        return chunks
