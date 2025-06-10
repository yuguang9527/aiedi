"use client";

import { useState, useCallback } from "react";
import Editor from "@/components/Editor";
import ChatPanel, { ChatMessage } from "@/components/ChatPanel";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]); // for rollback
  const [editorContent, setEditorContent] = useState<string>("");
  const [compensateSnapshot, setCompensateSnapshot] = useState<string | null>(null); // for undo rollback

  const addMessage = useCallback((role: 'user' | 'ai', content: string, type?: ChatMessage['type']) => {
    setMessages((prev) => [
      ...prev,
      { role, content, timestamp: Date.now(), type },
    ]);
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

  // Save snapshot after each AI content
  const saveSnapshot = useCallback((content: string) => {
    setSnapshots((prev) => [...prev, content]);
  }, []);

  // Rollback logic: revert editor content to a previous snapshot
  const handleRollback = (msg: ChatMessage, idx: number) => {
    // Find the corresponding snapshot (same index as ai-content message)
    const aiContentIdx = messages.filter(m => m.type === 'ai-content').findIndex((m, i) => i === idx);
    if (aiContentIdx >= 0 && snapshots[aiContentIdx]) {
      setCompensateSnapshot(editorContent); // Save current for undo
      setEditorContent(snapshots[aiContentIdx]);
    }
  };

  // Undo rollback: restore to compensateSnapshot
  const handleUndoRollback = () => {
    if (compensateSnapshot) {
      setEditorContent(compensateSnapshot);
      setCompensateSnapshot(null);
    }
  };

  // Restore to any version
  const handleRestore = (idx: number) => {
    if (snapshots[idx]) {
      setCompensateSnapshot(editorContent); // Save current for undo
      setEditorContent(snapshots[idx]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-2">AI Writing Assistant</h1>
      <p className="text-gray-600 text-center mb-6">
        Use AI to help improve your writing, provide suggestions and ideas
      </p>
      <div className="flex w-full max-w-6xl h-[70vh] border rounded-lg overflow-hidden bg-white shadow">
        <div className="flex-1 p-4 overflow-y-auto">
          <Editor
            addMessage={addMessage}
            updateLastMessage={updateLastMessage}
            saveSnapshot={saveSnapshot}
            editorContent={editorContent}
            setEditorContent={setEditorContent}
          />
        </div>
        <div className="w-[360px] border-l bg-gray-50">
          <ChatPanel
            messages={messages}
            onRollback={handleRollback}
            onRestore={handleRestore}
            compensateSnapshot={compensateSnapshot}
            onUndoRollback={handleUndoRollback}
            snapshots={snapshots}
          />
        </div>
      </div>
    </main>
  );
}
