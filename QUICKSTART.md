# GenAI RAG Chatbot - Quick Start Guide

## 🚀 Getting Started

### 1. Set up your OpenRouter API Key

First, get an API key from [OpenRouter](https://openrouter.ai/keys) and create your environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API key:
```
OPENROUTER_API_KEY=your_actual_api_key_here
```

### 2. Start the Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend

In a new terminal:
```bash
cd frontend
npm start
```

### 4. Open the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (FastAPI documentation)

## 📋 What You Can Do

1. **Upload Documents**: Drag and drop PDF, DOCX, or TXT files
2. **Ask Questions**: Type questions about your uploaded documents
3. **View Sources**: See which parts of your documents were used to answer each question
4. **Manage Documents**: View and delete documents from your knowledge base

## 🛠️ Troubleshooting

- **Backend won't start**: Make sure you have set the OpenRouter API key in `backend/.env`
- **Frontend won't start**: Run `npm install` in the frontend directory
- **Upload errors**: Ensure the backend is running on port 8000
- **No AI responses**: Check that your OpenRouter API key is valid

## 🐳 Docker Alternative

If you prefer Docker:

```bash
export OPENROUTER_API_KEY=your_api_key_here
docker-compose up --build
```

## 📝 Example Questions to Try

- "What is the main topic of the uploaded document?"
- "Can you summarize the key points?"
- "What does the document say about [specific topic]?"

Enjoy exploring your documents with AI! 🎉
