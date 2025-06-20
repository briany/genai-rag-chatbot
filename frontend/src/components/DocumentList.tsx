import React, { useState, useEffect } from 'react';
import './DocumentList.css';

interface Document {
  document_id: string;
  document_name: string;
  chunk_count: number;
}

interface DocumentListProps {
  refreshTrigger: number;
  onDocumentDeleted: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ refreshTrigger, onDocumentDeleted }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(documentId);
    try {
      const response = await fetch(`http://localhost:8000/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDocumentDeleted();
        fetchDocuments();
      } else {
        console.error('Failed to delete document');
        alert('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please check your connection and try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="document-list">
        <h2>Knowledge Base</h2>
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h2>Knowledge Base</h2>
      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents uploaded yet.</p>
          <p>Upload some documents to start asking questions!</p>
        </div>
      ) : (
        <div className="documents">
          {documents.map((doc) => (
            <div key={doc.document_id} className="document-item">
              <div className="document-info">
                <div className="document-name">{doc.document_name}</div>
                <div className="document-stats">
                  {doc.chunk_count} chunks
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(doc.document_id)}
                disabled={deleting === doc.document_id}
                title="Delete document"
              >
                {deleting === doc.document_id ? '...' : '🗑️'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
