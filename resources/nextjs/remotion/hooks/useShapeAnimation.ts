import { useCallback } from 'react';
import { useVideoConfig } from 'remotion';
import { Scale, Move, Fade } from 'remotion-animated';
import { ShapeData } from '../types/slideTypes';

export const useShapeAnimation = (shape: ShapeData) => {
  const { fps } = useVideoConfig();

  const getAnimations = useCallback(() => {
    const { animationType, animationDelay, animationDuration } = shape;
    const animations = [];

    if (animationType === 'scaleUp') {
      animations.push(
        Scale({
          by: 1,
          initial: 0,
          start: animationDelay * fps,
          duration: animationDuration * fps,
        })
      );
    } else if (animationType === 'slideIn') {
      animations.push(
        Move({
          x: shape.position_x.value,
          initialX: -shape.position_x.value - shape.width.value,
          start: animationDelay * fps,
          duration: animationDuration * fps,
        }),
        Fade({
          to: 1,
          initial: 0.5,
          start: animationDelay * fps,
          duration: animationDuration * fps,
        })
      );
    }

    return animations;
  }, [shape, fps]);

  return { getAnimations };
};