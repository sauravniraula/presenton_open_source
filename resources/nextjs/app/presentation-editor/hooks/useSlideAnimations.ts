import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ShapeData, SlideData } from '@/remotion/types/slideTypes';
import { applyAnimations } from '@/store/slices/slideSlice';
import crypto from 'crypto';

interface AnimationSegment {
  script_segment: string;
  texts: {
    text_id: string;
    text: string;
    animation: string;
  }[];
}

interface AnimationResult {
  segments: AnimationSegment[];
}

interface AnimationElement {
  shape_name?: string;
  text?: string;
  containing_shape_name?: string;
  animation_type: string;
}

interface AnimationGroup {
  elements: AnimationElement[];
  script_segment: string;
}

interface ProcessedAnimation {
  animation_groups: AnimationGroup[];
}

interface UseSlideAnimationsProps {
  showSubtitles?: boolean;
}

function generateHash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

function processShapesForText(shapes: ShapeData[]): any[] {
  const textGroups: any[] = [];

  shapes.forEach(shape => {
    if (shape.has_text && shape.text_frame?.paragraphs.length) {
      const texts: { id: string; text: string; shape_name: string }[] = [];
      
      // Process each paragraph in the shape's text frame
      shape.text_frame.paragraphs.forEach(paragraph => {
        // For each run in the paragraph, create a text entry
        if (paragraph.text.trim()) {
          // If no runs, use the paragraph text directly
          texts.push({
            id: generateHash(paragraph.text),
            text: paragraph.text,
            shape_name: shape.name
          });
        }
      });

      if (texts.length > 0) {
        // Check if any paragraph in the shape has bullets
        const is_bullet = shape.text_frame.paragraphs.some(
          paragraph => paragraph.bullet_info?.visible
        );

        textGroups.push({
          texts,
          is_bullet
        });
      }
    }
  });
  console.log("textGroups", textGroups);

  return textGroups;
}

function mapAnimationsToSlide(result: AnimationResult, originalSlide: SlideData): ProcessedAnimation {
  const textIdMap = new Map<string, { text: string; shape_name: string }>();
  
  // Build a map of text IDs to their original text and shape information
  originalSlide.shapes.forEach(shape => {
    if (shape.has_text && shape.text_frame?.paragraphs) {
      shape.text_frame.paragraphs.forEach(paragraph => {
        const id = generateHash(paragraph.text);
        textIdMap.set(id, {
          text: paragraph.text,
          shape_name: shape.name
        });
      });
    }
  });

  // Process animation groups
  const animation_groups: AnimationGroup[] = [];
  
  // Add null check for segments array
  if (!result?.segments) {
    console.error('Invalid animation result:', result);
    return { animation_groups: [] };
  }

  result.segments.forEach(segment => {
    if (!segment?.texts) {
      console.warn('Invalid segment:', segment);
      return;
    }

    const elements: AnimationElement[] = [];
    
    segment.texts.forEach(textAnimation => {
      const originalText = textIdMap.get(textAnimation.text_id);
      if (originalText) {
        elements.push({
          text: originalText.text,
          containing_shape_name: originalText.shape_name,
          animation_type: textAnimation.animation
        });
      }
    });

    if (elements.length > 0) {
      animation_groups.push({
        elements,
        script_segment: segment.script_segment
      });
    }
  });

  return { animation_groups };
}

export function useSlideAnimations({ showSubtitles = true }: UseSlideAnimationsProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const fetchAnimations = async (requestBody: { slides: { slide: any[]; script: string | undefined; thumbnail: string | undefined; }[] }): Promise<any> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ANIMATOR_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Animation response received:", data);
      return data;
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  };

  const generateAnimations = async (slides: SlideData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = { slides: slides.map(slide => ({ slide: processShapesForText(slide.shapes), script: slide.script, thumbnail: slide.thumbnail })) };
      const startTime = performance.now();
      const results = await fetchAnimations(requestBody);
      const endTime = performance.now();
      console.log('Animation results:', results);
      console.log(`Time taken to fetch animations: ${endTime - startTime} milliseconds`);
       
      // Map the animation results to the correct format
      const processedAnimations = results.map((result:any, index:number) => {
        if (!result) {
          console.error(`No animation result for slide ${index}`);
          return { animation_groups: [] };
        }
        const processedAnimation = mapAnimationsToSlide(result, slides[index]);
        console.log("processedAnimation", processedAnimation);
        return processedAnimation;
      });

      console.log('Processed animations:', processedAnimations);
      dispatch(applyAnimations(processedAnimations));
      return processedAnimations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate animations';
      console.error('Animation generation error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAnimations,
    isLoading,
    error,
  };
} 