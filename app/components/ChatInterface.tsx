'use client';

import React, { useState, useEffect } from 'react';
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

  const handleSendMessage = async (message: string) => {
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    // Ajouter le message de l'utilisateur
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Ajouter la réponse de l'assistant
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "Désolé, une erreur s'est produite." }]);
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
        />
      </div>
      <div className="mt-auto">
        {!hasUserSentMessage && <ConversationStarters onSelect={handleSendMessage} />}
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;