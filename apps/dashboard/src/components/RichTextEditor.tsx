'use client';

import React from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="border rounded-lg bg-background p-4 min-h-[500px]">
      <textarea
        className="w-full h-full min-h-[460px] outline-none bg-transparent resize-none font-mono text-sm"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
        Debug Mode: Tiptap temporarily disabled to fix React Error 130.
      </div>
    </div>
  );
}
