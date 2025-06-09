'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import AiButton from './AiButton'
import { useCallback, useEffect } from 'react'

const SAVE_KEY = 'my-notion-ai-content';

const Editor = () => {
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
        if (buffer.length > 0) processBuffer();
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
                }
            }
        }
    }

    await read();

  }, [editor]);

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
      {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <AiButton editor={editor} onAction={handleAiAction} />
      </BubbleMenu>}
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor 