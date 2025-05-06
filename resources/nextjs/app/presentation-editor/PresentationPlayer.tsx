'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Player } from '@remotion/player';
import { Main } from '../../remotion/Composition';
import { setCurrentSlideIndex } from '@/store/slices/slideSlice';

const FPS = 30;
const SLIDE_PADDING_SECONDS = 1.5;

interface PresentationPlayerProps {
  showSubtitles?: boolean;
}

const PresentationPlayer: React.FC<PresentationPlayerProps> = ({ showSubtitles = true }) => {
  const dispatch = useDispatch();
  const slides = useSelector((state: RootState) => state.slide.slides);
  const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);
  const playerRef = useRef<any>(null);
  const isManualChange = useRef(false);


  // Calculate total duration and frame mappings
  const { totalDurationInFrames, slideFrameMappings } = useMemo(() => {
    const mappings = slides.map((slide, index) => {
      const audioDuration = slide.audio?.letter_timing.character_end_times_seconds.slice(-1)[0] || 0;
      const duration = SLIDE_PADDING_SECONDS + audioDuration;

      const previousDurations = slides
        .slice(0, index)
        .reduce((acc, s) => {
          const sDuration = (s.audio?.letter_timing.character_end_times_seconds.slice(-1)[0] || 0);
          return acc + sDuration + SLIDE_PADDING_SECONDS;
        }, 0);

      const startFrame = Math.ceil(previousDurations * FPS);
      const endFrame = startFrame + Math.ceil(duration * FPS);

      return {
        startFrame,
        endFrame,
        duration,
        audioDuration
      };
    });

    const totalFrames = mappings.length > 0 ?
      mappings[mappings.length - 1].endFrame : 0;

    return {
      totalDurationInFrames: totalFrames,
      slideFrameMappings: mappings
    };
  }, [slides]);

  // Handle frame updates
  const handleFrameChange = () => {
    if (!playerRef.current || isManualChange.current) return;

    const currentFrame = playerRef.current.getCurrentFrame();
    // Find which slide should be currently showing based on the frame
    for (let i = 0; i < slideFrameMappings.length; i++) {
      const mapping = slideFrameMappings[i];
      if (currentFrame >= mapping.startFrame && currentFrame <= mapping.endFrame && i !== currentSlideIndex) {
        // console.log('Frame change:', {
        //   currentFrame,
        //   slideIndex: i,
        //   startFrame: mapping.startFrame,
        //   endFrame: mapping.endFrame
        // });
        // dispatch(setCurrentSlideIndex(i));
        break;
      }
    }
  };

  // Set up frame update listener
  useEffect(() => {
    if (!playerRef.current) return;

    playerRef.current.addEventListener('timeupdate', handleFrameChange);
    return () => {
      playerRef.current?.removeEventListener('timeupdate', handleFrameChange);
    };
  }, [slideFrameMappings, currentSlideIndex]);

  // Handle seeking when thumbnail is clicked
  useEffect(() => {
    if (!playerRef.current || currentSlideIndex === undefined) return;

    const mapping = slideFrameMappings[currentSlideIndex];
    if (mapping) {
      isManualChange.current = true;
      // console.log('Seeking to:', {
      //   slideIndex: currentSlideIndex,
      //   startFrame: mapping.startFrame,
      //   endFrame: mapping.endFrame
      // });
      playerRef.current.seekTo(mapping.startFrame);
      // Increased timeout to ensure frame updates are complete
      setTimeout(() => {
        isManualChange.current = false;
      }, 300);
    }
  }, [currentSlideIndex, slideFrameMappings]);

  if (!slides.length) {
    return <div className='aspect-video h-[400px] flex justify-center items-center'>No slides found</div>;
  }

  const { width, height } = slides[0].frame_size;

  return (
    <div className="flex justify-center items-center h-full">
      <Player
        ref={playerRef}
        component={Main}
        durationInFrames={totalDurationInFrames}
        compositionWidth={Math.round(width)}
        compositionHeight={Math.round(height)}
        fps={FPS}
        controls
        loop={false}
        showPosterWhenPaused
        inputProps={{
          slides,
          currentSlideIndex,
          slideFrameMappings,
          showSubtitles,
          fps: FPS
        }}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`
        }}
      />
    </div>
  );
};

export default PresentationPlayer;