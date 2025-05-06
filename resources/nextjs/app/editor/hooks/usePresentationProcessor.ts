import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { updateSlides, setCurrentSlideIndex } from '@/store/slices/slideSlice';
import { setProcessingStatus, setTotalSlides, setProcessingTimes } from '@/store/slices/processingSlice';
import JSZip from 'jszip';

interface ProcessingStatus {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress?: number;
  error?: string;
}

export function usePresentationProcessor() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });

  const restructureSlideData = (slideData: any) => {
    const shapes = slideData.structure.map((shape: any) => ({
      name: shape.name,
      type: shape.type,
      width: shape.width,
      height: shape.height,
      position_x: shape.position_x,
      position_y: shape.position_y,
      rotation: shape.rotation,
      z_order: shape.z_order,
      has_text: shape.has_text,
      vertical_alignment: shape.vertical_alignment,
      text_auto_grow_height: shape.text_auto_grow_height,
      text_auto_grow_width: shape.text_auto_grow_width,
      text_word_wrap: shape.text_word_wrap,
      text_fit_to_size: shape.text_fit_to_size,
      text_frame: shape.text_frame ? {
        paragraphs: shape.text_frame.paragraphs.map((paragraph: any) => ({
          text: paragraph.text,
          alignment: paragraph.alignment,
          level: paragraph.level,
          bullet_info: paragraph.bullet_info,
          runs: paragraph.runs,
          position_x: paragraph.position_x,
          position_y: paragraph.position_y,
          width: paragraph.width,
          height: paragraph.height,
          padding: paragraph.padding || {
            left: { value: 0, unit: 'px' },
            right: { value: 0, unit: 'px' },
            top: { value: 0, unit: 'px' },
            bottom: { value: 0, unit: 'px' }
          },
          autofit: paragraph.autofit || 'Do Not Autofit',
          line_height: paragraph.line_height || { value: 1.2, unit: 'em' },
          margin: paragraph.margin || {
            left: { value: 0, unit: 'px' },
            right: { value: 0, unit: 'px' },
            top: { value: 0, unit: 'px' },
            bottom: { value: 0, unit: 'px' }
          },
          animationType: 'none',
          animationDelay: 0,
          animationDuration: 1,
        })),
        vertical_alignment: shape.text_frame.vertical_alignment,
      } : undefined,
      fill: shape.fill,
      line: shape.line,
      animationType: 'none',
      animationDelay: 0,
      animationDuration: 1,
      padding: shape.padding || {
        left: { value: 0, unit: 'px' },
        right: { value: 0, unit: 'px' },
        top: { value: 0, unit: 'px' },
        bottom: { value: 0, unit: 'px' }
      },
      autofit: shape.autofit || 'Do Not Autofit',
    }));

    return {
      index: slideData.index,
      shapes,
      background: slideData.background,
      thumbnail: slideData.thumbnail,
      slideImages: slideData.shapes || {},
      frame_size: slideData.frame_size || { width: 960, height: 540 },
      script: '',
      audio: {
        index: slideData.index,
        script: '',
        audio_url: '',
        letter_timing: {
          characters: [],
          character_start_times_seconds: [],
          character_end_times_seconds: []
        }
      }
    };
  };

  const processPresentation = useCallback(async (presentationUrl: string) => {
    try {
      // Get slide count first
      const file = await fetch(presentationUrl);
      const fileData = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(fileData);
      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.startsWith("ppt/slides/slide") && fileName.endsWith(".xml")
      );
      const slideCount = slideFiles.length;

      // Set initial processing state
      setStatus({ status: 'processing', progress: 0 });
      dispatch(setProcessingStatus({ 
        status: 'processing', 
        progress: 0,
        processedSlides: 0,
        totalSlides: slideCount 
      }));
      dispatch(setTotalSlides(slideCount));

      // Process all slides in parallel
      const slidePromises = Array.from({ length: slideCount }, (_, index) => 
        fetch('https://xs83txxuwl.execute-api.ap-south-1.amazonaws.com/prod/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            presentation: presentationUrl,
            index
          }),
        }).then(res => res.json())
      );

      // Track progress
      let processedSlides = 0;
      const processedSlideData: any[] = [];

      // Process slides as they complete
      await Promise.all(slidePromises.map(async (promise, index) => {
        const slideData = await promise;
        processedSlides++;

        // Update progress
        const progress = (processedSlides / slideCount) * 100;
        setStatus({ status: 'processing', progress });
        dispatch(setProcessingStatus({
          status: 'processing',
          progress,
          processedSlides,
          totalSlides: slideCount
        }));

        const restructuredSlide = restructureSlideData(slideData);
        processedSlideData[index] = restructuredSlide;
        return restructuredSlide;
      }));

      // Update store with processed slides
      dispatch(updateSlides(processedSlideData));
      dispatch(setCurrentSlideIndex(0));
      dispatch(setProcessingStatus({
        status: 'complete',
        progress: 100,
        processedSlides: slideCount,
        totalSlides: slideCount
      }));

      setStatus({ status: 'complete' });

      // Save to localStorage
      localStorage.setItem('presentationSlides', JSON.stringify(processedSlideData));
      localStorage.setItem('currentSlideIndex', '0');
      localStorage.setItem('lastUpdated', new Date().toISOString());

      // Set processing times
      dispatch(setProcessingTimes({
        status: 'complete',
        totalTime: Date.now(), // You might want to track actual processing time
        timeToFirstSlide: Date.now(), // You might want to track time to first slide
      }));

    } catch (error) {
      console.error('Error processing presentation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process presentation';
      setStatus({ status: 'error', error: errorMessage });
      dispatch(setProcessingStatus({ 
        status: 'error', 
        error: errorMessage 
      }));
    }
  }, [dispatch, router]);

  return {
    status,
    processPresentation
  };
} 