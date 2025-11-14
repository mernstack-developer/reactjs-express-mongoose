import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  variant?: 'full' | 'compact';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder: _placeholder = 'Enter content...',
  readOnly = false,
  height = '400px',
  variant: _variant = 'full',
}) => {
  // TipTap editor with all extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  // Handle link insertion
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Handle image insertion
  const handleImageUpload = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          editor.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-container" style={{ height }}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Heading dropdown */}
        <div className="toolbar-group">
          <select
            onChange={(e) => {
              if (e.target.value === '0') {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="toolbar-select"
            title="Heading level"
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>

        {/* Basic formatting */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        {/* Lists */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet list"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered list"
          >
            #
          </button>
        </div>

        {/* Code */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code block"
          >
            &lt;&gt;
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
            title="Inline code"
          >
            <code>code</code>
          </button>
        </div>

        {/* Media and links */}
        {_variant === 'full' && (
          <div className="toolbar-group">
            <button onClick={setLink} className="toolbar-btn" title="Insert link">
              🔗
            </button>
            <button onClick={handleImageUpload} className="toolbar-btn" title="Insert image">
              🖼️
            </button>
          </div>
        )}

        {/* Quotes and alignment */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Blockquote"
          >
            "
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align left"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align center"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align right"
          >
            →
          </button>
        </div>

        {/* Utility */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className="toolbar-btn"
            title="Clear formatting"
          >
            ✖️
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-btn"
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-btn"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default RichTextEditor;
