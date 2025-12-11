import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Configure katex for ReactQuill
if (typeof window !== 'undefined') {
  window.katex = katex;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  className = ""
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'formula'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'image', 'formula'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          borderRadius: '0.5rem',
        }}
      />
      <style>{`
        .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: none;
          background: hsl(var(--background));
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top: none;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .ql-editor {
          color: hsl(var(--foreground));
          min-height: 120px;
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
        
        .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .ql-toolbar button:hover {
          background: hsl(var(--accent));
        }
        
        .ql-toolbar button.ql-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;