import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

interface ScriptData {
  slides: {
    index: number;
    script: string;
  }[];
}

async function processSlide(slide: ScriptData['slides'][0], VOICE_ID: string) {
  try {
    // Generate audio using ElevenLabs REST API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API || '',
        },
        body: JSON.stringify({
          text: slide.script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    const audioBuffer = Buffer.from(responseData.audio_base64, 'base64');

    // Upload to S3
    const fileId = uuidv4();
    const key = `presentations/audio/${fileId}.mp3`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    });

    await s3Client.send(command);

    return {
      index: slide.index,
      script: slide.script,
      audio_url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`,
      letter_timing: responseData.alignment
    };
  } catch (error) {
    console.error(`Error processing slide ${slide.index}:`, error);
    return {
      index: slide.index,
      script: slide.script,
      error: 'Failed to generate audio'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ScriptData = await request.json();
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

    const audioResults = [];
    
    // Process slides one by one
    for (const slide of data.slides) {
      console.log(`Processing slide ${slide.index}`);
      const result = await processSlide(slide, VOICE_ID);
      audioResults.push(result);
    }

    return NextResponse.json({ slides: audioResults });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
} 