"use client";

import { useState, useCallback } from "react";
import Editor from "@/components/Editor";
import ChatPanel, { ChatMessage } from "@/components/ChatPanel";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((role: 'user' | 'ai', content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1].content += content;
      }
      return newMessages;
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-2">AI Writing Assistant</h1>
      <p className="text-gray-600 text-center mb-6">
        Use AI to help improve your writing, provide suggestions and ideas
      </p>
      <div className="flex w-full max-w-6xl h-[70vh] border rounded-lg overflow-hidden bg-white shadow">
        <div className="flex-1 p-4 overflow-y-auto">
          <Editor addMessage={addMessage} updateLastMessage={updateLastMessage} />
        </div>
        <div className="w-[360px] border-l bg-gray-50">
          <ChatPanel messages={messages} />
        </div>
      </div>
    </main>
  );
}
