import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ScriptRequest {
  slides: {
    image: string;
    index: number;
    seconds: number;
  }[];
  tone: string;
  user_prompt: string;
  // presentation_style: string;
}

interface ScriptResponse {
  slides: {
    index: number;
    script: string;
  }[];
}

export function useScriptGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slides = useSelector((state: RootState) => state.slide.slides);

  const generateScript = async (
    tone: string = 'professional',
    userPrompt: string = '',
    seconds: number = 20,
    // presentationStyle: string = 'engaging',
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestData: ScriptRequest = {
        slides: slides.map(slide => ({
          image: slide.thumbnail || '',
          index: slide.index,
          seconds: seconds
        })),
        tone,
        user_prompt: userPrompt
        // presentation_style: presentationStyle
      };

      console.log(requestData);
      
      let response;

      const startTime = performance.now();
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_SCRIPT_GENERATOR_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        const endTime = performance.now();
        console.log(`Script generation request took ${endTime - startTime} milliseconds`);
      } catch (err) {
        console.error('Error generating script:', err instanceof Error ? err.message : 'Unknown error');
      } 

      console.log(response);

      if (!response?.ok) {
        throw new Error('Failed to generate script');
      }

      const data: ScriptResponse = await response.json();
      return data.slides;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateScript,
    isLoading,
    error
  };
} 