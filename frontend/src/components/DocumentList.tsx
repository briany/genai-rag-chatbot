import React, { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Trash2, Loader2, BookOpen, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

interface Document {
  doc_id: string;
  filename: string;
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
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-3">
              No documents uploaded yet.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Lightbulb className="h-4 w-4 flex-shrink-0" />
              <span>Upload documents to start asking questions about their content!</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div 
                key={doc.doc_id} 
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" title={doc.filename}>
                    {doc.filename}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {doc.chunk_count} chunk{doc.chunk_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.doc_id)}
                  disabled={deleting === doc.doc_id}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  {deleting === doc.doc_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default DocumentList;
