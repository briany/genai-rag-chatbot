import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Send, MessageCircle, Loader2, BookOpen, User, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: Source[];
}

interface Source {
  document_name: string;
  chunk_text: string;
  score: number;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          sources: data.sources,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error while processing your request. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I cannot connect to the server right now. Please check if the backend is running and try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Ask Questions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about your uploaded documents
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome!</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Upload some documents and ask me questions about their content.
              </p>
              <div className="space-y-2 text-left max-w-lg">
                <p className="text-sm font-medium text-muted-foreground">Example questions:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• "What is the main topic of the uploaded document?"</p>
                  <p>• "Can you summarize the key points?"</p>
                  <p>• "What does the document say about [specific topic]?"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.sender === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className={cn(
                      "rounded-lg p-3 max-w-[80%]",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}>
                      {message.sender === 'bot' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Sources:</h4>
                        <div className="space-y-2">
                          {message.sources.map((source, index) => (
                            <div key={index} className="bg-muted/50 rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{source.document_name}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  Relevance: {(1 - source.score).toFixed(2)}
                                </span>
                              </div>
                              <div className="prose prose-xs dark:prose-invert max-w-none text-muted-foreground">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {source.chunk_text.length > 200 
                                    ? `${source.chunk_text.substring(0, 200)}...` 
                                    : source.chunk_text}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t bg-background p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || loading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
