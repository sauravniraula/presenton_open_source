'use client'

import React from 'react';

import { marked } from 'marked'
interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (

        <div className="prose prose-slate max-w-none mb-10" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
    );
};

export default MarkdownRenderer; 