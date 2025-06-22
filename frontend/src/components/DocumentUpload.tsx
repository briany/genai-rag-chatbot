import React, { useState } from 'react';
import { Button } from './ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';

interface DocumentUploadProps {
  onDocumentUploaded: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    // Validate files
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert(`File type ${fileExtension} is not supported. Please upload PDF, DOCX, or TXT files.`);
        return;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
    }

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Upload failed: ${response.status} ${response.statusText}`;
        console.error('Upload failed:', errorMessage);
        alert(errorMessage);
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
    <div>
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
          dragOver 
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          uploading && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">
              Uploading and processing documents...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOCX, TXT (Max size: 10MB each)
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={uploading}
              className="mt-2"
            >
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
    </div>
  );
};

export default DocumentUpload;
