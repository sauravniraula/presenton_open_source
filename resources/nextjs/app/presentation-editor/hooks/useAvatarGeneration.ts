import { useState } from 'react';

interface GenerateAvatarParams {
  presenter_id: string;
  audio_url: string;
}

interface GenerationStatus {
  isGenerating: boolean;
  progress: 'creating' | 'processing' | 'completed' | 'error';
  error?: string;
  resultUrl?: string;
}

const isValidHttpUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export function useAvatarGeneration() {
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    progress: 'creating'
  });

  const generateAvatar = async ({ presenter_id, audio_url }: GenerateAvatarParams) => {
    try {
      setStatus({ isGenerating: true, progress: 'creating' });

      // Create avatar clip
      const createResponse = await fetch('/api/presentation-data/avatar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presenter_id,
          audio_url,
          background_color: false
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create avatar clip');
      }

      const createData = await createResponse.json();
      const clipId = createData.id;

      // Start polling
      const pollResult = await pollClipStatus(clipId);
      return pollResult;

    } catch (error) {
      setStatus({
        isGenerating: false,
        progress: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate avatar'
      });
      throw error;
    }
  };

  const pollClipStatus = async (clipId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await fetch(`/api/presentation-data/avatar/get?clip_id=${clipId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch clip status');
          }

          const data = await response.json();
          
          console.log("polled avatar data", data);

          if (data.status === 'error') {
            setStatus({
              isGenerating: false,
              progress: 'error',
              error: data.error || 'Generation failed'
            });
            reject(new Error(data.error || 'Generation failed'));
            return;
          }

          if (data.result_url && isValidHttpUrl(data.result_url)) {
            setStatus({
              isGenerating: false,
              progress: 'completed',
              resultUrl: data.result_url
            });
            resolve(data.result_url);
            return;
          }

          // Continue polling
          setStatus({
            isGenerating: true,
            progress: 'processing'
          });
          setTimeout(poll, 10000); // Poll every 10 seconds
        } catch (error) {
          setStatus({
            isGenerating: false,
            progress: 'error',
            error: error instanceof Error ? error.message : 'Polling failed'
          });
          reject(error);
        }
      };

      poll();
    });
  };

  return {
    generateAvatar,
    status
  };
} 