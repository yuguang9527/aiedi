import React, { useEffect, useRef } from 'react';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l p-4 overflow-y-auto" style={{ minWidth: 340 }}>
      <h2 className="text-lg font-bold mb-4">Chat with AI</h2>
      <div className="flex-1 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatPanel; 