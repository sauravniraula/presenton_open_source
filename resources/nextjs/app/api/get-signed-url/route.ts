import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
    region: process.env.REGION!,
    credentials: {
        accessKeyId: process.env.AWS_TEMP_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_TEMP_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: Request) {
    try {
        const { key } = await request.json();
        const command = new GetObjectCommand({
            Bucket:'pptgen-private-v2',
            Key: key as string,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 5 });
        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }
}