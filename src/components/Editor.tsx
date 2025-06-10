'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import AiButton from './AiButton'
import { useCallback, useEffect } from 'react'

const SAVE_KEY = 'my-notion-ai-content';

interface EditorProps {
  onChat?: (userContent: string, aiContent: string) => void;
}

const Editor = ({ onChat }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px]',
      },
    },
    onUpdate: ({ editor }) => {
      localStorage.setItem(SAVE_KEY, editor.getHTML());
    },
    immediatelyRender: false,
  })

  const handleAiAction = useCallback(async (action: string, text: string, customPrompt?: string) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    // 记录用户请求
    if (onChat) {
      onChat(customPrompt ? customPrompt : action, '...'); // 先显示用户请求，AI回复稍后补全
    }
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
    let aiReply = '';

    const read = async () => {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.length > 0) processBuffer();
        // 记录AI最终回复
        if (onChat) {
          onChat('', aiReply);
        }
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
                    aiReply += textChunk;
                }
            }
        }
    }

    await read();

  }, [editor, onChat]);

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
    <div className="relative rounded-lg border">
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

      {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <AiButton editor={editor} onAction={handleAiAction} />
      </BubbleMenu>}
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor 