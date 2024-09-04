'use client';

import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import ChatHistory from './ChatHistory';
import ConversationStarters from './ConversationStarters';

const welcomeMessages = [
  "Bienvenue sur Nicolas, votre assistant jardinage !",
  "Je suis là pour répondre à toutes vos questions sur le jardinage. N'hésitez pas à me demander conseil !"
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentAssistantMessage]);

  const handleSendMessage = async (message: string) => {
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    setIsLoading(true);
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullMessage = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                // Stream is finished
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullMessage += parsed.text;
                  setCurrentAssistantMessage(fullMessage);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: fullMessage }
        ]);
        setCurrentAssistantMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: "Désolé, une erreur s'est produite." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto mb-4">
        <ChatHistory 
          messages={messages} 
          showWelcomeMessages={!hasUserSentMessage} 
          welcomeMessages={welcomeMessages}
          currentAssistantMessage={currentAssistantMessage}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto">
        {!hasUserSentMessage && <ConversationStarters onSelect={handleSendMessage} />}
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;