import { useState } from 'react';

import { AUDIO_DELAY_SECONDS } from '@/config.mjs';
import { AudioTiming } from '@/types/slideTypes';
import { useSubtitleGenerator } from '@/hooks/useSubtitleGenerator';
import { useDispatch } from 'react-redux';

interface AudioSlide {
  index: number;
  script: string;
  audio_url: string;
  letter_timing: AudioTiming;
}

interface AudioResponse {
  slides: AudioSlide[];
  merged_audio_url: string;
  subtitles_url: string;
}

export function useAudioGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generateAndUploadSubtitle } = useSubtitleGenerator();
  const dispatch = useDispatch();

  const generateAudio = async (scripts: { index: number; script: string }[], voice: string = 'onyx') => {
    setIsLoading(true);
    setError(null);

    console.log("audio generator request",  { slides: scripts, voice: voice, delay_time: AUDIO_DELAY_SECONDS/1000 })

    console.log("audio generator url ", process.env.NEXT_PUBLIC_AUDIO_GENERATOR_URL)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_AUDIO_GENERATOR_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: scripts, 
          voice, 
          delay_time: AUDIO_DELAY_SECONDS/1000 
        })
      });
      console.timeEnd('fetch-audio-openai');
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const data: AudioResponse = await response.json();
      console.log('Received audio data:', data);

      console.log("data slides", data.slides);

      // console.log("data merged audio url", data.merged_audio_url);

      // Here you can update the store with the audio URLs
      // dispatch(updateSlides(data.slides));

      // After audio generation is complete and slides are updated
      
      // console.log("data slides from audio generator", data.slides)
      // const subtitleUrl = await generateAndUploadSubtitle(data.slides);
      // console.log("subtitle url dispatching", subtitleUrl)
      // dispatch(setMergedSubtitleUrl(subtitleUrl));

      return {
        slides: data.slides,
        merged_audio_url: data.merged_audio_url,
        merged_subtitle_url: data.subtitles_url
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio or subtitles');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAudio,
    isLoading,
    error
  };
} 