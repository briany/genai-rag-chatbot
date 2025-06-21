import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentUploadProps {
  onDocumentUploaded: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        onDocumentUploaded();
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        console.error('Upload failed:', response.statusText);
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    if (event.dataTransfer.files) {
      handleFileUpload(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            uploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Uploading and processing documents...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX, TXT
                </p>
              </div>
              <Button variant="outline" size="sm" disabled={uploading}>
                Choose Files
              </Button>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
