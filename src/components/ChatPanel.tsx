import React, { useEffect, useRef } from 'react';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  type?: 'user' | 'ai-thinking' | 'ai-content'; // for future: distinguish AI thought vs. content
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onRollback?: (msg: ChatMessage, idx: number) => void;
  onRestore?: (idx: number) => void;
  compensateSnapshot?: string | null;
  onUndoRollback?: () => void;
  snapshots?: string[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onRollback, onRestore, compensateSnapshot, onUndoRollback, snapshots }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find all ai-content message indices for restore
  const aiContentIndices = messages
    .map((msg, idx) => (msg.type === 'ai-content' ? idx : -1))
    .filter(idx => idx !== -1);

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l p-4 overflow-y-auto" style={{ minWidth: 340 }}>
      <h2 className="text-lg font-bold mb-4">Chat with AI</h2>
      {compensateSnapshot && onUndoRollback && (
        <div className="mb-4">
          <button
            className="px-3 py-1 bg-yellow-400 text-black rounded shadow hover:bg-yellow-500"
            onClick={onUndoRollback}
          >
            Undo Rollback
          </button>
        </div>
      )}
      <div className="flex-1 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words shadow-sm mb-1 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : msg.type === 'ai-content'
                    ? 'bg-green-100 text-gray-900 border-2 border-green-400 font-semibold'
                    : 'bg-white text-gray-800 border'
              }`}
            >
              {msg.content}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              {formatTime(msg.timestamp)}
              {msg.type === 'ai-content' && onRollback && (
                <button
                  className="ml-2 text-red-500 underline hover:text-red-700"
                  onClick={() => onRollback(msg, idx)}
                >
                  Rollback
                </button>
              )}
              {msg.type === 'ai-content' && onRestore && snapshots && (
                <button
                  className="ml-2 text-green-600 underline hover:text-green-800"
                  onClick={() => {
                    // Find the nth ai-content message
                    const nth = aiContentIndices.indexOf(idx);
                    if (nth !== -1) onRestore(nth);
                  }}
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatPanel; 