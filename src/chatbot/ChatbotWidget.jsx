import React, { useState, useEffect, useRef } from 'react';
import { getConfig } from '@edx/frontend-platform';
import './ChatbotWidget.scss';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const config = getConfig();

  const chatbotConfig = {
    apiUrl: config.CHATBOT_API_URL || '',
    buttonText: config.CHATBOT_BUTTON_TEXT || '💬',
    primaryColor: config.CHATBOT_PRIMARY_COLOR || '#4CAF50',
    welcomeMessage: config.CHATBOT_WELCOME_MESSAGE || 'Xin chào! Tôi là chatbot MOOC 🤖',
    placeholder: config.CHATBOT_PLACEHOLDER || 'Hỏi tôi về tài liệu PDF...',
    position: config.CHATBOT_POSITION || 'bottom-right',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when chatbot opens for the first time
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: chatbotConfig.welcomeMessage,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatbotConfig.apiUrl) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Don't create bot message yet - wait for first chunk
    const botMessageId = messages.length + 2;
    let botMessageCreated = false;

    try {
      const response = await fetch(chatbotConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming SSE response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                
                // Create bot message on first chunk
                if (!botMessageCreated) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: botMessageId,
                      text: accumulatedText,
                      sender: 'bot',
                      timestamp: new Date(),
                    },
                  ]);
                  botMessageCreated = true;
                  setIsLoading(false);
                } else {
                  // Update existing bot message
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  );
                }
              }
              if (data.done) {
                break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

      // If no text was accumulated, show default message
      if (!accumulatedText) {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            text: 'Xin lỗi, tôi không hiểu câu hỏi của bạn.',
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorText = 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.';
      
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        errorText = 'Không thể kết nối với chatbot. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.message.includes('404')) {
        errorText = 'API endpoint không tồn tại. Vui lòng kiểm tra cấu hình server.';
      } else if (error.message.includes('500')) {
        errorText = 'Lỗi server chatbot. Vui lòng thử lại sau.';
      }
      
      // Create or update bot message with error
      if (botMessageCreated) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: errorText }
              : msg
          )
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            text: errorText,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatbotConfig.apiUrl) {
    // Don't render if API URL is not configured
    return null;
  }

  return (
    <div className={`chatbot-widget ${chatbotConfig.position}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" style={{ '--primary-color': chatbotConfig.primaryColor }}>
          <div className="chatbot-header" style={{ backgroundColor: chatbotConfig.primaryColor }}>
            <div className="chatbot-header-content">
              <div className="chatbot-logo">🤖</div>
              <div className="chatbot-title">
                <h3>MOOC AI</h3>
                <p>Chat với chúng tôi</p>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close-btn"
              onClick={toggleChat}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
              >
                {message.sender === 'bot' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-bot">
                <div className="message-avatar">🤖</div>
                <div className="message-text typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder={chatbotConfig.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-toggle-btn"
          onClick={toggleChat}
          style={{ backgroundColor: chatbotConfig.primaryColor }}
          aria-label="Open chatbot"
        >
          <span className="chatbot-icon">{chatbotConfig.buttonText}</span>
          <div className="chatbot-tooltip">Bạn cần hỗ trợ gì?</div>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
