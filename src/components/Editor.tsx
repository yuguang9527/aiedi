'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import AiButton from './AiButton'
import { useCallback, useEffect } from 'react'

const SAVE_KEY = 'my-notion-ai-content';

interface EditorProps {
  addMessage: (role: 'user' | 'ai', content: string, type?: 'user' | 'ai-thinking' | 'ai-content') => void;
  updateLastMessage: (content: string) => void;
  saveSnapshot: (content: string) => void;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

const getAiThinkingMessage = (action: string): string => {
  switch (action) {
    case 'Expand':
      return "Okay, I'll expand on the selected text, keeping the original tone and meaning.";
    case 'Summarize':
      return "Got it. I'll provide a concise summary of the selected text.";
    case 'Continue Writing':
      return "Let's see... I'll continue writing from where you left off.";
    case 'Translate to English':
      return "I'll translate this text into English for you.";
    case 'Improve Writing':
      return "I'll work on improving the writing style and clarity of this selection.";
    case 'Fix Grammar':
      return "I'll correct any grammatical errors in the selected text.";
    default:
      return "I'm processing your request...";
  }
}

const Editor = ({ addMessage, updateLastMessage, saveSnapshot, editorContent, setEditorContent }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      localStorage.setItem(SAVE_KEY, editor.getHTML());
      setEditorContent(editor.getHTML());
    },
    content: editorContent,
    immediatelyRender: false,
  })

  const handleAiAction = useCallback(async (action: string, text: string, customPrompt?: string) => {
    if (!editor) return;

    // 1. Add user message
    const userMessage = customPrompt ? `Custom Prompt: "${customPrompt}" on selected text.` : `Action: ${action}`;
    addMessage('user', userMessage, 'user');

    // 2. Add AI thinking message
    const thinkingMessage = getAiThinkingMessage(action === 'Custom Prompt...' ? customPrompt || '' : action);
    addMessage('ai', thinkingMessage, 'ai-thinking');

    // 3. Prepare for streaming AI response
    addMessage('ai', '', 'ai-content'); // Add an empty message to be updated

    const { from, to } = editor.state.selection;
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text, customPrompt }),
    });

    if (!response.body) {
      alert("Error: No response body");
      return;
    }

    editor.chain().focus().deleteRange({ from, to }).run();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const read = async () => {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      processBuffer();
      await read();
    };
    
    const processBuffer = () => {
        const boundary = buffer.lastIndexOf('\n');
        if (boundary === -1) return;

        const processable = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 1);

        const lines = processable.split('\n');
        for (const line of lines) {
            if (line.startsWith('0:')) {
                const textChunk = JSON.parse(line.substring(2));
                if (typeof textChunk === 'string') {
                    editor.chain().insertContent(textChunk).run();
                    updateLastMessage(textChunk);
                    // Save snapshot after each AI content chunk (only once at the end)
                    saveSnapshot(editor.getHTML());
                }
            }
        }
    }

    await read();

  }, [editor, addMessage, updateLastMessage, saveSnapshot]);

  useEffect(() => {
    if (editor) {
      const savedContent = localStorage.getItem(SAVE_KEY);
      if (savedContent) {
        editor.commands.setContent(savedContent);
      } else {
        editor.commands.setContent(`<h2>Hi there,</h2><p>this is a <em>basic</em> example of <strong>tiptap</strong>.</p><p>Select some text to try out the AI features!</p>`);
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative rounded-lg border h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
        >
          Heading
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <AiButton editor={editor} onAction={handleAiAction} />
        </BubbleMenu>}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor 