import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

function App() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleDocumentUploaded = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  const handleDocumentDeleted = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            GenAI RAG Chatbot
          </h1>
          <p className="text-center text-blue-100 max-w-2xl mx-auto">
            Upload documents and ask questions based on their content using advanced AI
          </p>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Knowledge Base Panel */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DocumentList 
                  refreshTrigger={refreshDocuments}
                  onDocumentDeleted={handleDocumentDeleted}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Upload Panel */}
          <div className="lg:col-span-3">
            <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
          </div>
          
          {/* Chat Panel */}
          <div className="lg:col-span-6">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
