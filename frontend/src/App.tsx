import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';

function App() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleDocumentUploaded = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  const handleDocumentDeleted = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GenAI RAG Chatbot</h1>
        <p>Upload documents and ask questions based on their content</p>
      </header>
      
      <main className="App-main">
        <div className="upload-section">
          <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
          <DocumentList 
            refreshTrigger={refreshDocuments}
            onDocumentDeleted={handleDocumentDeleted}
          />
        </div>
        
        <div className="chat-section">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

export default App;
