'use client';

import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-stretch">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Posez votre question sur le jardinage..."
        className="flex-grow p-2 border-2 border-r-0 border-indigo-300 rounded-l-lg focus:outline-none focus:ring-0 focus:border-indigo-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-indigo-500 text-white px-4 rounded-r-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
};

export default MessageInput;