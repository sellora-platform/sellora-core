'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Heading1, 
  Heading2, 
  Link as LinkIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Strikethrough,
  Code
} from 'lucide-react';
import { Toggle } from './ui/toggle';
import { Separator } from './ui/separator';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] max-w-none p-4',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-background overflow-hidden flex flex-col group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Toolbar */}
      <div className="p-1 border-b bg-muted/20 flex flex-wrap items-center gap-0.5 sticky top-0 z-10 backdrop-blur-md">
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        
        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-popover border shadow-md rounded-lg p-1 gap-1 overflow-hidden">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={() => {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Toggle>
      </BubbleMenu>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-muted/10 border-t flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
        <span>Rich Text Editor Active</span>
        <div className="flex items-center gap-3">
          <span>Characters: {editor.storage.characterCount?.characters?.() || 0}</span>
          <span>Words: {editor.storage.characterCount?.words?.() || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Sub-components to avoid import issues
function Button({ children, className, onClick, disabled, variant, size }: any) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    sm: "h-9 px-3",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={`${base} ${variants[variant as keyof typeof variants] || ""} ${sizes[size as keyof typeof sizes] || ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
