'use client'

import React, { useState } from 'react';
import {
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    markdownShortcutPlugin,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    BlockTypeSelect,
    InsertCodeBlock,
    diffSourcePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    frontmatterPlugin,
    sandpackPlugin,
    DiffSourceToggleWrapper,
    // @ts-ignore
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
    initialValue: string;
    onSave?: (content: string, isCSV: boolean) => void;
    isCSV?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onSave }) => {


    const [error, setError] = useState<any | null>(null);
    const convertReferenceLinks = (markdown: string): string => {
        return markdown.replace(/\[(\d+)\]:\s*(https?:\/\/[^\s]+)/g, '[$1]($2)');
    };
    const processedMarkdown = convertReferenceLinks(initialValue);

    return (
        <>
            {error ? (
                // <div className="bg-red-100 border text-center border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                //     <strong className="font-bold">Oops!</strong>
                //     <span className="block sm:inline"> We are unable to parse the Markdown for now.</span>
                //     <span className="block sm:inline text-green-600"> However, your content will still be included in the presentation.</span>
                //     <p className='text-red-600 mt-2'>{error}</p>

                // </div>
                <MarkdownRenderer content={initialValue} />
            ) : (
                <MDXEditor
                    markdown={processedMarkdown}
                    onChange={() => {
                        onSave && onSave(initialValue, false);
                    }}
                    trim={true}
                    onError={(error) => {
                        setError(error.error)
                    }}

                    plugins={[
                        toolbarPlugin({
                            toolbarContents: () => (
                                <DiffSourceToggleWrapper>
                                    <UndoRedo />
                                    <BoldItalicUnderlineToggles />
                                    <BlockTypeSelect />
                                    <CreateLink />
                                    <InsertCodeBlock />
                                    <ListsToggle />
                                    <InsertImage />
                                    <InsertTable />
                                    <InsertThematicBreak />
                                </DiffSourceToggleWrapper>
                            )
                        }),
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        diffSourcePlugin(),
                        imagePlugin(),
                        tablePlugin(),
                        thematicBreakPlugin(),
                        markdownShortcutPlugin(),
                        codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                        codeMirrorPlugin({
                            codeBlockLanguages: {
                                js: 'JavaScript',
                                css: 'CSS',
                                txt: 'text',
                                html: 'HTML',
                                python: 'Python',
                                java: 'Java',
                                cpp: 'C++',
                                typescript: 'TypeScript',
                                jsx: 'JSX',
                                tsx: 'TSX',
                                json: 'JSON',
                                markdown: 'Markdown',
                                yaml: 'YAML',
                                sql: 'SQL',
                                shell: 'Shell',
                                bash: 'Bash'
                            }
                        }),
                        frontmatterPlugin(),
                        sandpackPlugin()
                    ]}
                    contentEditableClassName="min-h-[300px] p-4 prose prose-slate max-w-full"
                />
            )}
        </>
    );
};

export default MarkdownEditor; 