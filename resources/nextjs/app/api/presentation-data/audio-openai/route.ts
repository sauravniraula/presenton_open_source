import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface ScriptData {
  slides: {
    index: number;
    script: string;
  }[];
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Add interface for subtitle format
interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

function convertToCharacterTimings(
  text: string, 
  wordTimings: WordTiming[]
) {
  const characters = Array.from(text);
  const startTimes: number[] = new Array(characters.length).fill(0);
  const endTimes: number[] = new Array(characters.length).fill(0);
  
  let currentIndex = 0;
  let lastTiming = 0;
  
  // Process each word and its timing
  for (const timing of wordTimings) {
    const word = timing.word;
    const wordStart = timing.start;
    const wordDuration = timing.end - timing.start;
    const charDuration = wordDuration / word.length;

    // Assign timings to each character in the word
    for (let i = 0; i < word.length; i++) {
      if (currentIndex + i < characters.length) {
        startTimes[currentIndex + i] = wordStart + (i * charDuration);
        endTimes[currentIndex + i] = wordStart + ((i + 1) * charDuration);
        lastTiming = endTimes[currentIndex + i];
      }
    }
    
    currentIndex += word.length;
    
    // Add timing for space after word (if not at the end)
    if (currentIndex < characters.length && characters[currentIndex] === ' ') {
      startTimes[currentIndex] = wordStart + wordDuration;
      endTimes[currentIndex] = wordStart + wordDuration + 0.05;
      lastTiming = endTimes[currentIndex];
      currentIndex++;
    }
  }

  // Find the last non-zero timing
  let lastNonZeroIndex = startTimes.length - 1;
  while (lastNonZeroIndex >= 0 && startTimes[lastNonZeroIndex] === 0) {
    lastNonZeroIndex--;
  }

  // If we found a non-zero timing, fill all subsequent zeros with that value
  if (lastNonZeroIndex >= 0) {
    const lastValue = endTimes[lastNonZeroIndex];
    for (let i = lastNonZeroIndex + 1; i < characters.length; i++) {
      startTimes[i] = lastValue;
      endTimes[i] = lastValue;
    }
  }

  return {
    characters,
    character_start_times_seconds: startTimes.map(t => Math.round(t * 1000) / 1000),
    character_end_times_seconds: endTimes.map(t => Math.round(t * 1000) / 1000)
  };
}

// Function to generate WebVTT content
function generateWebVTT(wordTimings: WordTiming[]): string {
  let vtt = 'WEBVTT\n\n';
  
  // Group words into reasonable chunks (e.g., by natural breaks or max length)
  let currentCue: SubtitleCue = {
    start: wordTimings[0]?.start || 0,
    end: 0,
    text: ''
  };
  
  wordTimings.forEach((timing, index) => {
    currentCue.text += timing.word + ' ';
    
    // Create new cue after ~40 characters or at punctuation
    if (currentCue.text.length > 40 || 
        timing.word.match(/[.!?]$/) || 
        index === wordTimings.length - 1) {
      currentCue.end = timing.end;
      
      // Format timestamps as HH:MM:SS.mmm
      const formatTime = (seconds: number) => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${ms.toString().padStart(3, '0')}`;
      };
      
      vtt += `${formatTime(currentCue.start)} --> ${formatTime(currentCue.end)}\n${currentCue.text.trim()}\n\n`;
      
      // Start new cue
      if (index < wordTimings.length - 1) {
        currentCue = {
          start: timing.end,
          end: 0,
          text: ''
        };
      }
    }
  });
  
  return vtt;
}

async function processSlide(slide: ScriptData['slides'][0], voice: string) {
  try {
    // Generate speech using OpenAI TTS
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: slide.script,
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    
    // Upload to S3
    const fileId = uuidv4();
    const key = `presentations/audio/${fileId}.mp3`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    });

    await s3Client.send(uploadCommand);

    // Create temporary file for transcription
    const filePath = '/tmp/audio.mp3';
    fs.writeFileSync(filePath, audioBuffer);
    const file = fs.createReadStream(filePath);

    // Get transcription with word timings
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"]
    });

    if (!transcriptionResponse || !transcriptionResponse.words) {
      throw new Error('Failed to get transcription');
    }

    console.log("transcription response", transcriptionResponse)

    // Convert word timings to character timings
    const letterTiming = convertToCharacterTimings(
      transcriptionResponse.text,
      transcriptionResponse.words
    );

    // Generate and upload subtitles
    const vttContent = generateWebVTT(transcriptionResponse.words);
    const subtitleFileId = uuidv4();
    const subtitleKey = `presentations/subtitles/${subtitleFileId}.vtt`;

    const uploadSubtitleCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: subtitleKey,
      Body: vttContent,
      ContentType: 'text/vtt',
    });

    await s3Client.send(uploadSubtitleCommand);

    const subtitleUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${subtitleKey}`;

    return {
      index: slide.index,
      script: transcriptionResponse.text,
      audio_url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      subtitle_url: subtitleUrl,
      letter_timing: letterTiming
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
    const VOICE = "alloy";

    // Process all slides in parallel
    const audioResults = await Promise.all(
      data.slides.map(async (slide) => {
        console.log(`Processing slide ${slide.index}`);
        return processSlide(slide, VOICE);
      })
    );

    return NextResponse.json({ slides: audioResults });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
