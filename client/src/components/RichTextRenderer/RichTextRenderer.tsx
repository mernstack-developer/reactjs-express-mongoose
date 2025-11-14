import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import './RichTextRenderer.css';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * RichTextRenderer
 * Safely renders HTML content with proper sanitization and styling
 * Supports formatted text, code blocks, images, links, and more
 */
const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHTML = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'a',
        'img',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'class', 'style', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }, [content]);

  if (!sanitizedHTML) {
    return <div className={`rich-text-renderer empty ${className}`}>No content available</div>;
  }

  return (
    <div
      className={`rich-text-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export default RichTextRenderer;
