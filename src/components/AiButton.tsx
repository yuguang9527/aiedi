'use client'

import { useState } from 'react';
import type { Editor } from '@tiptap/core';

interface AiButtonProps {
  editor: Editor;
  onAction: (action: string, text: string, customPrompt?: string) => void;
}

const AiButton = ({ editor, onAction }: AiButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMenuClick = (action: string) => {
    setIsDropdownOpen(false);

    if (action === 'Custom Prompt...') {
        const customPrompt = window.prompt("Enter your custom instructions for the AI:");
        if (customPrompt) {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, ' ');
            onAction(action, text, customPrompt);
        }
        return;
    }

    if (action === 'Continue Writing') {
        const { to } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, to - 1000), to, '\n');
        onAction(action, textBefore);
        return;
    }

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (text || action === 'Continue Writing') {
      onAction(action, text);
    }
  };

  return (
    <div className="relative inline-block text-left" 
         onMouseEnter={() => setIsDropdownOpen(true)}
         onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <div>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg border inline-flex justify-center w-full text-sm font-medium items-center hover:bg-blue-600 transition-colors"
        >
          AI Assistant
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isDropdownOpen && (
        <div
          className="origin-top-left absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Text Editing</div>
            <button onClick={() => handleMenuClick('Expand')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Expand</button>
            <button onClick={() => handleMenuClick('Continue Writing')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Continue Writing</button>
            <button onClick={() => handleMenuClick('Summarize')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Summarize</button>
            
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase mt-2">Language Processing</div>
            <button onClick={() => handleMenuClick('Translate to English')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Translate to English</button>
            <button onClick={() => handleMenuClick('Improve Writing')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Improve Writing</button>
            <button onClick={() => handleMenuClick('Fix Grammar')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Fix Grammar</button>
            
            <div className="border-t border-gray-200 my-1"></div>
            <button onClick={() => handleMenuClick('Custom Prompt...')} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium">Custom Prompt...</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiButton; 