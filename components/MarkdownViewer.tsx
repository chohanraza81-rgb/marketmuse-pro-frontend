'use client';
import ReactMarkdown from 'react-markdown';
import { CopyButton } from './CopyButton';

export const MarkdownViewer = ({ content }: { content: string }) => {
  return (
    <div className="relative glass-card p-6 prose prose-invert max-w-none">
      <div className="absolute top-4 right-4">
        <CopyButton text={content} />
      </div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};
