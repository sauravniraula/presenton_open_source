import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { key, fileUrl } = await request.json();

    // Verify the file exists in S3
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      fileUrl
    });
  } catch (error) {
    console.error('Error verifying upload:', error);
    return NextResponse.json(
      { error: 'Failed to verify upload' },
      { status: 500 }
    );
  }
} 