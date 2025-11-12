import React, { useState, useRef, useEffect } from 'react';
import './ChatAssistant.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: Date;
}

interface ChatAssistantProps {
  apiUrl: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ apiUrl }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! Soy tu asistente RAG para documentos de construcción. ¿En qué puedo ayudarte? Puedes preguntarme sobre planos, especificaciones técnicas, procedimientos o cualquier información de los documentos.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maxDocs, setMaxDocs] = useState(15);
  const [showSources, setShowSources] = useState<{[key: string]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Construir historial para enviar al backend (últimos 10 mensajes, excluyendo el mensaje de bienvenida)
      const conversationHistory = messages
        .slice(1)  // Excluir mensaje de bienvenida
        .slice(-10)  // Últimos 10 mensajes
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputText,
          max_context_docs: maxDocs,
          history: conversationHistory
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'Lo siento, no pude procesar tu pregunta.',
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Error: No pude conectar con el servidor. Asegúrate de que el backend esté funcionando.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSources = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const formatContent = (content: string) => {
    // Convertir markdown básico a HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/##\s(.*?)$/gm, '<h3>$1</h3>')
      .replace(/\n/g, '<br>');
  };

  // Preguntas sugeridas
  const suggestedQuestions = [
    "¿Qué información tienes sobre planos de arquitectura?",
    "Dame un resumen de los documentos del proyecto educativo",
    "¿Hay especificaciones técnicas disponibles?",
    "¿Qué tipos de documentos están disponibles?",
    "Necesito información sobre procedimientos de construcción"
  ];

  return (
    <div className="chat-assistant">
      <div className="chat-header">
        <h2>Asistente RAG</h2>
        <p>Búsqueda conversacional en documentos</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
              
              {message.sources && message.sources.length > 0 && (
                <div className="sources-section">
                  <button 
                    className="sources-toggle"
                    onClick={() => toggleSources(message.id)}
                  >
                    Ver fuentes ({message.sources.length})
                  </button>
                  
                  {showSources[message.id] && (
                    <div className="sources-list">
                      {message.sources.map((source, index) => (
                        <div key={index} className="source-item">
                          <div className="source-header">
                            <div className="source-info">
                              <div className="source-title">{source.title}</div>
                              <div className="source-meta">
                                <span className="source-number">Doc: {source.number || 'N/A'}</span>
                                <span className="source-score">Relevancia: {(source.score * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                            {source.filename && source.file_type && (
                              <button
                                className="source-pdf-button"
                                onClick={() => window.open(`${apiUrl}/document/${source.document_id}/file`, '_blank')}
                                title={`Abrir ${source.file_type.toUpperCase()}`}
                              >
                                📄 Ver {source.file_type.toUpperCase()}
                              </button>
                            )}
                          </div>
                          <div className="source-snippet">{source.snippet?.substring(0, 300)}...</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
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

      {messages.length === 1 && (
        <div className="suggested-questions">
          <h4>Preguntas sugeridas:</h4>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="suggested-question"
              onClick={() => setInputText(question)}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <div className="input-controls">
          <div className="docs-control">
            <label htmlFor="maxDocs">Docs: </label>
            <select 
              id="maxDocs"
              value={maxDocs} 
              onChange={(e) => setMaxDocs(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;