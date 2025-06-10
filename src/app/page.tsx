"use client";

import { useState, useCallback } from "react";
import Editor from "@/components/Editor";
import ChatPanel, { ChatMessage } from "@/components/ChatPanel";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Handler to add a new user/AI message to the chat
  const handleChat = useCallback((userContent: string, aiContent: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
      { role: "ai", content: aiContent },
    ]);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-2">AI Writing Assistant</h1>
      <p className="text-gray-600 text-center mb-6">
        Use AI to help improve your writing, provide suggestions and ideas
      </p>
      <div className="flex w-full max-w-6xl h-[70vh] border rounded-lg overflow-hidden bg-white shadow">
        <div className="flex-1 p-4">
          <Editor onChat={handleChat} />
        </div>
        <div className="w-[360px] border-l bg-gray-50">
          <ChatPanel messages={messages} />
        </div>
      </div>
    </main>
  );
}
