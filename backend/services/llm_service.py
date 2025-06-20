import os
import httpx
import re
from typing import List, Dict, Any
from models.chat import Source

class LLMService:
    """Service for interacting with LLM via OpenRouter API."""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        # Use Qwen3-14B free model
        self.model = "qwen/qwen3-14b:free"
        
        # For testing, temporarily use mock mode due to OpenRouter connectivity issues
        self.mock_mode = False  # Enable real API mode
        if self.api_key:
            print("Note: OpenRouter API key available and real API mode enabled")
    
    def _highlight_keywords(self, text: str, query: str) -> str:
        """Highlight keywords from the query in the text using markdown bold syntax."""
        if not query or not text:
            return text
        
        # Extract meaningful words from query (remove common stop words)
        stop_words = {'what', 'is', 'how', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '?', '!', '.', ',', 'does', 'do', 'can', 'will', 'would', 'should', 'could'}
        query_words = [word.strip().lower() for word in re.split(r'\W+', query) if word.strip().lower() not in stop_words and len(word.strip()) > 2]
        
        highlighted_text = text
        for word in query_words:
            # Use case-insensitive replacement with word boundaries
            pattern = r'\b(' + re.escape(word) + r')\b'
            highlighted_text = re.sub(pattern, r'**\1**', highlighted_text, flags=re.IGNORECASE)
        
        return highlighted_text
    
    async def generate_response(self, question: str, context_docs: List[Source]) -> Dict[str, Any]:
        """Generate a response using the LLM with RAG context."""
        
        # If in mock mode, return a test response
        if self.mock_mode:
            if context_docs:
                # Create highlighted sources for mock response
                highlighted_sources = []
                for doc in context_docs:
                    highlighted_chunk_text = self._highlight_keywords(doc.chunk_text, question)
                    highlighted_source = Source(
                        document_name=doc.document_name,
                        chunk_text=highlighted_chunk_text,
                        score=doc.score
                    )
                    highlighted_sources.append(highlighted_source)
                
                mock_answer = f"""## 📚 **Information Found**

Based on the retrieved documents, I can provide information about your question: **"{question}"**.

### 📄 **Sources Found**
I found **{len(context_docs)}** relevant document(s) that discuss this topic.

> **Note**: This is running in test mode without a real LLM connection. I'm providing this mock response.

### ⚙️ **To Enable Full AI Responses**
To get actual AI-generated responses, please set the `OPENROUTER_API_KEY` environment variable."""

                return {
                    "answer": mock_answer,
                    "sources": highlighted_sources
                }
            else:
                mock_answer = f"""## ❌ **No Relevant Documents Found**

I searched the knowledge base for information about **"{question}"** but didn't find any relevant documents.

### 🔍 **Possible Reasons**
1. **No documents uploaded**: The knowledge base might be empty
2. **Topic not covered**: The uploaded documents don't contain information about this topic  
3. **Search limitations**: The search didn't find good matches

### 💡 **Suggestions**
- Try rephrasing your question
- Upload relevant documents to the knowledge base
- Use more specific or different keywords

> **Note**: This is a mock response since no OpenRouter API key is configured."""

                return {
                    "answer": mock_answer,
                    "sources": []
                }
        
        # Prepare context from retrieved documents
        context = ""
        if context_docs:
            context = "\n\n".join([
                f"Source: {doc.document_name}\nContent: {doc.chunk_text}"
                for doc in context_docs
            ])
        
        # Create prompt with context
        system_prompt = """You are a helpful AI assistant that answers questions based on provided context documents. 

Instructions:
1. Use only the information provided in the context documents to answer questions
2. Format your response using proper Markdown syntax with headings, bullet points, bold text, etc.
3. Always cite which source document(s) you're using in your response
4. Provide accurate, helpful, and well-structured answers
5. If multiple sources provide relevant information, synthesize them appropriately
6. Use proper Markdown formatting like:
   - **Bold text** for important concepts
   - `Code formatting` for technical terms
   - ## Headings for sections
   - * Bullet points for lists
   - > Blockquotes for emphasis
7. If the context doesn't contain enough information, say so clearly and suggest what additional information might be needed"""

        user_prompt = f"""Context Documents:
{context}

Question: {question}

Please provide a comprehensive answer based on the context documents above. If the context doesn't contain sufficient information to answer the question, please state that clearly."""

        # Make API call to OpenRouter
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",  # Fixed: use http instead of https
                "X-Title": "GenAI RAG Chatbot"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
                "stream": False  # Explicitly disable streaming
            }
            
            try:
                print(f"Making API call to OpenRouter with {len(context_docs)} context docs...")
                print(f"Using model: {self.model}")
                
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=15.0
                )
                print(f"API response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text
                    print(f"Error response: {error_text}")
                    return {
                        "answer": f"API Error ({response.status_code}): {error_text}",
                        "sources": []
                    }
                
                result = response.json()
                answer = result["choices"][0]["message"]["content"]
                print(f"Generated answer: {answer[:100]}...")
                
                # Create highlighted sources with keywords emphasized
                highlighted_sources = []
                for doc in context_docs:
                    highlighted_chunk_text = self._highlight_keywords(doc.chunk_text, question)
                    highlighted_source = Source(
                        document_name=doc.document_name,
                        chunk_text=highlighted_chunk_text,
                        score=doc.score
                    )
                    highlighted_sources.append(highlighted_source)
                
                return {
                    "answer": answer,  # LLM already provides well-formatted response
                    "sources": highlighted_sources
                }
                
            except httpx.HTTPError as e:
                print(f"HTTP error: {e}")
                return {
                    "answer": f"Sorry, I encountered an HTTP error: {str(e)}",
                    "sources": []
                }
            except Exception as e:
                print(f"Unexpected error: {e}")
                import traceback
                traceback.print_exc()
                return {
                    "answer": f"Sorry, an unexpected error occurred: {str(e)}",
                    "sources": []
                }
