import { createClient, Entry, EntrySkeletonType } from 'contentful';
import { Document } from '@contentful/rich-text-types';

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
});

export interface BlogPost {
  slug: string;
  title: string;
  summary: Document;
  heroImage?: string;
  content: Document;
  publishedDate?: string;
  tags?: string[];
  relatedPosts?: BlogPost[];
}

interface IBlogFields {
  slug: string;
  title: string;
  summary: Document;
  heroImage?: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  content: Document;
  publishedDate?: string;
  tags?: string[];
//   @ts-ignore
  relatedPosts?: Entry<IBlogFields>[];
}

interface IBlogEntry extends EntrySkeletonType {
  fields: IBlogFields;
  contentTypeId: 'blogPage';
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const response = await client.getEntries<IBlogEntry>({
    content_type: 'blogPage'
  });
  
  return response.items.map((item) => ({
    slug: item.fields.slug,
    title: item.fields.title,
    summary: item.fields.summary,
    // @ts-ignore
    heroImage: item.fields.heroImage?.fields?.file?.url,
    content: item.fields.content,
    publishedDate: item.fields.publishedDate,
    tags: item.fields.tags,
  }));
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const response = await client.getEntries<IBlogEntry>({
    content_type: 'blogPage',
    // @ts-ignore
    'fields.slug': slug,
    limit: 1
  });

  if (response.items.length === 0) {
    return null;
  }

  const item = response.items[0];
  return {
    slug: item.fields.slug,
    title: item.fields.title,
    summary: item.fields.summary,
    // @ts-ignore
    heroImage: item.fields.heroImage?.fields?.file?.url,
    content: item.fields.content,
    publishedDate: item.fields.publishedDate,
    tags: item.fields.tags,
  };
}
