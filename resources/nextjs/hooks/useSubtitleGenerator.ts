import { SlideData } from '@/types/slideTypes';

interface SubtitleCue {
  index: number;
  start: number;
  end: number;
  text: string;
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Add constant for slide padding and max words per cue
const SLIDE_PADDING_SECONDS = 0.5; // 500ms in seconds
const MAX_WORDS_PER_CUE = 5;

export function useSubtitleGenerator() {
  const getWordTimings = (slide: any): WordTiming[] => {
    const wordTimings: WordTiming[] = [];
    let currentWord = '';
    let wordStart = 0;
    
    const { characters, character_start_times_seconds, character_end_times_seconds } = slide.letter_timing;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      // If we hit a space or punctuation, we've found a word boundary
      if (char.match(/[\s.!?,]/) || i === characters.length - 1) {
        if (currentWord) {
          wordTimings.push({
            word: currentWord + (char.match(/[.!?,]/) ? char : ''),
            start: character_start_times_seconds[wordStart],
            end: character_end_times_seconds[i]
          });
        }
        currentWord = '';
        wordStart = i + 1;
      } else {
        currentWord += char;
      }
    }

    return wordTimings;
  };

  const generateSRT = (slides: any): string => {
    let srt = '';
    let cueIndex = 1;
    let cumulativeTime = 0;

    for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
      const slide = slides[slideIndex];
      if (!slide?.letter_timing || !slide.script) continue;

      // Add padding time at the start of each slide
      cumulativeTime += SLIDE_PADDING_SECONDS;

      const wordTimings = getWordTimings(slide);
      console.log("wordTimings for slide ", slideIndex, wordTimings);
      let currentCue: string[] = [];
      let cueStart = 0;

      const formatTime = (seconds: number) => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${ms.toString().padStart(3, '0')}`;
      };

      for (let i = 0; i < wordTimings.length; i++) {
        const timing = wordTimings[i];
        currentCue.push(timing.word);
        console.log("Word in timing; ",  timing.word )

        // Create a new cue when we hit the word limit or punctuation
        if (currentCue.length >= MAX_WORDS_PER_CUE || 
            timing.word.match(/[.!?]/) || 
            i === wordTimings.length - 1) {
          
          const cueStartTime = cumulativeTime + wordTimings[i - currentCue.length + 1].start
          
          let cueEndTime = cumulativeTime + timing.end;

          if (cueEndTime == cueStartTime) {
            cueEndTime = cueStartTime + 0.5;
          }

          // Only create cue if timing is valid
          if (cueEndTime > cueStartTime) {
            srt += `${cueIndex}\n`;
            srt += `${formatTime(cueStartTime)} --> ${formatTime(cueEndTime)}\n`;
            srt += `${currentCue.join(' ')}\n\n`;
            cueIndex++;
          }

          

          currentCue = [];
        }
      }

      if (currentCue.length > 0) {
        const lastTiming = wordTimings[wordTimings.length - 1];
        const startWordIndex = wordTimings.length - currentCue.length;
        const cueStartTime = cumulativeTime + wordTimings[startWordIndex].start;
        const cueEndTime = cumulativeTime + lastTiming.end;

        if (cueEndTime > cueStartTime) {
          srt += `${cueIndex}\n`;
          srt += `${formatTime(cueStartTime)} --> ${formatTime(cueEndTime)}\n`;
          srt += `${currentCue.join(' ')}\n\n`;
          cueIndex++;
        }
      }

      // Update cumulative time for next slide
      const lastTiming = wordTimings[wordTimings.length - 1];
      if (lastTiming) {
        cumulativeTime += lastTiming.end;
      }
    }

    return srt;
  };

  const correctSubtitles = async (srtContent: string, slides: SlideData[]): Promise<string> => {
    try {
      // Combine all scripts into one
      const fullScript = slides
        .map(slide => slide.script)
        .filter(Boolean)
        .join('\n');

      const response = await fetch('/api/presentation-data/subtitle/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          srtContent,
          script: fullScript 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to correct subtitles');
      }

      const { correctedSRT } = await response.json();
      return correctedSRT;
    } catch (error) {
      console.error('Error correcting subtitles:', error);
      // Return original content if correction fails
      return srtContent;
    }
  };

  const uploadSubtitle = async (srtContent: string): Promise<string> => {
    try {
      const response = await fetch('/api/presentation-data/subtitle/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          srtContent,
          contentType: 'application/x-subrip'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload subtitle');
      }

      const data = await response.json();
      return data.subtitleUrl;
    } catch (error) {
      console.error('Error uploading subtitle:', error);
      throw error;
    }
  };

  return {
    generateAndUploadSubtitle: async (slides: SlideData[]) => {
      // Generate initial SRT content using word-level timing
      const srtContent = generateSRT(slides);
      console.log("Initial SRT content:", srtContent);

      // Correct the subtitles using LLM with script reference
      const correctedSRT = await correctSubtitles(srtContent, slides);
      // console.log("Corrected SRT content:", correctedSRT);

      // Upload the corrected subtitles
      return await uploadSubtitle(correctedSRT);
    }
  };
} 