import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatInterface.css';

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
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Ask Questions</h2>
        <p>Ask questions about your uploaded documents</p>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>👋 Hello! Upload some documents and ask me questions about their content.</p>
            <div className="example-questions">
              <p>Example questions:</p>
              <ul>
                <li>"What is the main topic of the uploaded document?"</li>
                <li>"Can you summarize the key points?"</li>
                <li>"What does the document say about [specific topic]?"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <div className="message-text">
                  {message.sender === 'bot' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <h4>Sources:</h4>
                    {message.sources.map((source, index) => (
                      <div key={index} className="source-item">
                        <div className="source-document">{source.document_name}</div>
                        <div className="source-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {source.chunk_text.length > 200 
                              ? `${source.chunk_text.substring(0, 200)}...` 
                              : source.chunk_text}
                          </ReactMarkdown>
                        </div>
                        <div className="source-score">Relevance: {(1 - source.score).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message bot loading-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your documents..."
          disabled={loading}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || loading}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
