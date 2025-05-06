import { useEffect, useRef, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import anime from 'animejs/lib/anime.es.js';
import { ShapeData, ParagraphData } from '../types/slideTypes';
export const useAnimeAnimation = (shape: ShapeData) => {
  const ref = useRef<HTMLDivElement | HTMLImageElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animationRefs = useRef<{ [key: string]: anime.AnimeInstance }>({});
  const createAnimation = useCallback(() => {
    if (!ref.current) return null;
    const { animationType, animationDelay, animationDuration } = shape;
    if (animationType === 'scaleUp') {
      const totalDuration = Math.max(animationDuration, 1) * 1000;
      return anime({
        targets: ref.current,
        scale: [1, 1.2, 1.2, 1],
        duration: totalDuration,
        easing: 'easeInOutQuad',
        autoplay: false,
        keyframes: [
          { scale: 1, duration: 0 },
          { scale: 1.2, duration: 500 },
          { scale: 1.2, duration: totalDuration - 1000 },
          { scale: 1, duration: 500 }
        ]
      });
    } else if (animationType === 'slideIn') {
      const startPosition = shape.position_x.value < 0 ? -shape.width.value : shape.width.value;
      const endPosition = shape.position_x.value;
      return anime({
        targets: ref.current,
        translateX: [startPosition - endPosition, 0],
        opacity: [0, 1],
        easing: 'easeInCubic',
        duration: animationDuration * 1000,
        autoplay: false,
      });
    } else if (animationType === 'fadeIn') {
      return anime({
        targets: ref.current,
        opacity: [0, 1],
        easing: 'easeInCubic',
        duration: animationDuration * 1000,
        autoplay: false,
      });
    } else if (animationType === 'wiggle') {
      const totalDuration = animationDuration * 1000;
      const wiggleCycleDuration = 1000; // Duration of one complete wiggle cycle
      const cycles = Math.ceil(totalDuration / wiggleCycleDuration);
      const translateX = Array(cycles).fill([0, -10, 10, -10, 10, 0]).flat();
      const rotateZ = Array(cycles).fill([0, -3, 3, -3, 3, 0]).flat();
      return anime({
        targets: ref.current,
        translateX: translateX,
        rotateZ: rotateZ,
        duration: totalDuration,
        easing: 'linear',
        delay: animationDelay * 1000,
        autoplay: false,
      });
    }
    return null;
  }, [shape]);
  const createParagraphAnimation = useCallback((paragraph: ParagraphData, index: number) => {
    if (!ref.current) return null;
    const target = ref.current.querySelector(`[data-paragraph-index="${index}"]`);
    if (!target) return null;
    const baseAnimation = {
      targets: target,
      duration: paragraph.animationDuration * 1000,
      delay: paragraph.animationDelay * 1000,
      autoplay: false,
    };
    if (paragraph.animationType === 'scaleUp') {
      return anime({
        ...baseAnimation,
        scale: [1, 1.2, 1.2, 1],
        easing: 'easeInOutQuad',
        keyframes: [
          { scale: 1, duration: 0 },
          { scale: 1.2, duration: 100 },
          { scale: 1.2, duration: baseAnimation.duration - 200 },
          { scale: 1, duration: 100 }
        ]
      });
    } else if (paragraph.animationType === 'slideIn') {
      return anime({
        ...baseAnimation,
        easing: 'easeInOutQuad',
        translateX: ['-100%', 0],
        opacity: [0, 1],
      });
    } else if (paragraph.animationType === 'fadeIn') {
      return anime({
        ...baseAnimation,
        opacity: [0, 1],
      });
    } else if (paragraph.animationType === 'wiggle') {
      const totalDuration = paragraph.animationDuration * 1000;
      const wiggleCycleDuration = 1000; // Duration of one complete wiggle cycle
      const cycles = Math.ceil(totalDuration / wiggleCycleDuration);
      const translateX = Array(cycles).fill([0, -10, 10, -10, 10, 0]).flat();
      const rotateZ = Array(cycles).fill([0, -3, 3, -3, 3, 0]).flat();

      return anime({
        ...baseAnimation,
        translateX: translateX,
        rotateZ: rotateZ,
        easing: 'linear',
      });
    }

    return null;
  }, []);

  useEffect(() => {
    if (shape.has_text && shape.text_frame) {
      shape.text_frame.paragraphs.forEach((paragraph, index) => {
        const animation = createParagraphAnimation(paragraph, index);
        if (animation) {
          animationRefs.current[`paragraph-${index}`] = animation;
          console.log("paragraph", paragraph.text)
          console.log("animation refs paragraph", animationRefs.current)
        }
      });
    } else {
      const animation = createAnimation();
      if (animation) {
        animationRefs.current['shape'] = animation;
      }
    }

    return () => {
      Object.values(animationRefs.current).forEach(animation => {
        if (animation) {
          animation.pause();
        }
      });
      animationRefs.current = {};
    };
  }, [shape, createAnimation, createParagraphAnimation]);
  useEffect(() => {
    if (animationRefs.current) {
      Object.entries(animationRefs.current).forEach(([key, animation]) => {
        if (animation) {
          const isShape = key === 'shape';
          const targetShape = isShape ? shape : shape.text_frame?.paragraphs[parseInt(key.split('-')[1])];

          if (targetShape) {
            const startFrame = targetShape.animationDelay * fps;
            const endFrame = startFrame + targetShape.animationDuration * fps;
            
            if (frame >= startFrame && frame <= endFrame) {
              const progress = (frame - startFrame) / (endFrame - startFrame);
              animation.seek(animation.duration * progress);
            } else if (frame < startFrame) {
              animation.seek(0);
            } else if (frame > endFrame) {
              animation.seek(animation.duration);
            }
          }
        }
      });
    }
  }, [frame, shape, fps]);
  return ref;
};
