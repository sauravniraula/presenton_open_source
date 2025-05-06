import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

console.log(process.env.ACCESS_KEY_ID, process.env.SECRET_ACCESS_KEY, process.env.REGION, process.env.S3_BUCKET_NAME);

const s3Client = new S3Client({
  region: process.env.REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { srtContent, contentType } = await request.json();
    
    const fileId = uuidv4();
    const key = `presentations/subtitles/${fileId}.srt`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: srtContent,
      ContentType: contentType || 'application/x-subrip',
    });

    await s3Client.send(command);

    const subtitleUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ subtitleUrl });
  } catch (error) {
    console.error('Error uploading subtitle:', error);
    return NextResponse.json(
      { error: 'Failed to upload subtitle' },
      { status: 500 }
    );
  }
} 