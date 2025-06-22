import React from 'react';
import { FileText, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Document {
  id: string;
  name: string;
  upload_date: string;
  size?: number;
  type?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument: (id: string) => void;
  isLoading?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onDeleteDocument, 
  isLoading = false 
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getFileIcon = (filename: string) => {
    if (!filename) {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'txt':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Knowledge Base
          <Badge variant="secondary" className="ml-auto">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
            <div>
              <h3 className="font-medium text-gray-700 mb-1">No documents yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload your first document to start building your knowledge base
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Supported formats: PDF, DOCX, TXT</li>
                <li>• Upload multiple files at once</li>
                <li>• Ask questions about your content</li>
                <li>• Get responses with source attribution</li>
              </ul>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-4 space-y-3">
              {documents.filter(doc => doc && doc.id).map((doc) => (
                <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(doc.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {doc.name || 'Unnamed document'}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(doc.upload_date)}
                            </p>
                            {doc.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(doc.size)}
                              </p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
