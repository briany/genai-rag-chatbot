import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';

interface Source {
  document_name: string;
  chunk_text: string;
  score?: number;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Source[];
}

interface Document {
  id: string;
  name: string;
  upload_date: string;
  size?: number;
  type?: string;
}

interface ChatInterfaceProps {
  documents: Document[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documents }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (documents.length === 0) {
      alert('Please upload some documents first to ask questions about them.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your message. Please make sure the backend server is running.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text: string) => {
    if (!text) return '';
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          💬 Chat Assistant
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ask questions about your uploaded documents • {documents.length} document{documents.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
                <Bot className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Ready to help!
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Upload some documents and start asking questions. I'll help you find relevant information from your knowledge base.
                </p>
              </div>
            </div>
          ) : (
            messages.filter(message => message && message.id).map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[75%] ${message.isUser ? 'order-first' : ''}`}>
                  <Card className={`shadow-lg border-0 ${
                    message.isUser 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div
                        className={`prose prose-sm max-w-none leading-relaxed ${
                          message.isUser ? 'prose-invert' : 'prose-gray'
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.text || '')
                        }}
                      />
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-3 w-3" />
                            <span className="text-xs font-medium">Sources:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.filter(source => source && source.document_name).map((source, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                {source.document_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className={`text-xs mt-3 ${
                        message.isUser ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp?.toLocaleTimeString() || 'Unknown time'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {message.isUser && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <Card className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            className="flex-1 shadow-sm"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="default"
            className="px-6 shadow-sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Press Enter to send • {documents.length} document{documents.length !== 1 ? 's' : ''} in knowledge base
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
