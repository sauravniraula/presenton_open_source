import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document, BLOCKS, INLINES } from '@contentful/rich-text-types';
import Link from 'next/link';

const options = {
    renderNode: {
        [BLOCKS.PARAGRAPH]: (node: any, children: any) => (
            <p className="mb-4">{children}</p>
        ),
        [BLOCKS.HEADING_1]: (node: any, children: any) => (
            <h1 className="text-3xl font-bold mb-4">{children}</h1>
        ),
        [BLOCKS.HEADING_2]: (node: any, children: any) => (
            <h2 className="text-2xl font-bold mb-3">{children}</h2>
        ),
        [BLOCKS.HEADING_3]: (node: any, children: any) => (
            <h3 className="text-xl font-bold mb-2">{children}</h3>
        ),
        [BLOCKS.UL_LIST]: (node: any, children: any) => (
            <ul className="list-disc ml-6 mb-4">{children}</ul>
        ),
        [BLOCKS.OL_LIST]: (node: any, children: any) => (
            <ol className="list-decimal ml-6 mb-4">{children}</ol>
        ),
        [BLOCKS.LIST_ITEM]: (node: any, children: any) => (
            <li className="mb-1">{children}</li>
        ),
        [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
            const { url, height, width, title, description } = node.data.target.fields.file;
            return (
                <div className="my-4">
                    <img
                        src={`https:${url}`}
                        alt={description || title || 'Embedded asset'}
                        width={width || 800}
                        height={height || 450}
                        className="rounded-lg"
                    />
                </div>
            );
        },
        [INLINES.HYPERLINK]: (node: any, children: any) => (
            <Link href={node.data.uri} className="text-blue-600 hover:underline">
                {children}
            </Link>
        ),
        [INLINES.ASSET_HYPERLINK]: (node: any, children: any) => {
            const { url } = node.data.target.fields.file;
            return (
                <a
                    href={`https:${url}`}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            );
        },
    },
};

interface RichTextProps {
    content: Document;
    className?: string;
}

export default function RichText({ content, className = '' }: RichTextProps) {
    return (
        <div className={className}>
            {documentToReactComponents(content, options)}
        </div>
    );
} 