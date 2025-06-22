import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import { NotificationProvider, useNotifications } from './components/ui/notifications';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';

interface Document {
  id: string;
  name: string;
  upload_date: string;
  size?: number;
  type?: string;
}

const AppContent: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load documents',
        description: 'Please check if the backend server is running.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDocumentUploaded = () => {
    fetchDocuments();
    addNotification({
      type: 'success',
      title: 'Document uploaded successfully',
      description: 'Your document has been processed and added to the knowledge base.',
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      fetchDocuments();
      addNotification({
        type: 'success',
        title: 'Document deleted',
        description: 'The document has been removed from your knowledge base.',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      addNotification({
        type: 'error',
        title: 'Failed to delete document',
        description: 'Please try again or check your connection.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            GenAI RAG Chatbot
          </h1>
          <p className="text-center text-gray-600 mt-3 text-lg">
            Upload documents and ask questions based on their content using advanced AI
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* Left Column - Document Management */}
          <div className="flex flex-col space-y-6 xl:max-w-none max-w-2xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  📤 Upload Documents
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add documents to your knowledge base
                </p>
              </div>
              <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
            </div>
            
            {/* Knowledge Base Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex-1 min-h-[500px] hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <DocumentList 
                documents={documents}
                onDeleteDocument={handleDeleteDocument}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Right Column - Chat Interface */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[700px] hover:shadow-xl transition-shadow duration-300 overflow-hidden xl:max-w-none max-w-2xl mx-auto">
            <ChatInterface documents={documents} />
          </div>
          
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
