import { useCallback } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ShapeData, ParagraphData, Size } from '../types/slideTypes';

function getInverseColor(color: string): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = 255 - parseInt(hex.slice(0, 2), 16);
    const g = 255 - parseInt(hex.slice(2, 4), 16);
    const b = 255 - parseInt(hex.slice(4, 6), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return color === 'white' ? 'black' : 'white';
}

const scalePadding = (padding: { top: Size; right: Size; bottom: Size; left: Size }, scale: number) => {
  return {
    paddingTop: `${padding.top.value * scale}${padding.top.unit}`,
    paddingRight: `${padding.right.value * scale}${padding.right.unit}`,
    paddingBottom: `${padding.bottom.value * scale}${padding.bottom.unit}`,
    paddingLeft: `${padding.left.value * scale}${padding.left.unit}`,
  };
};

export const useRemotionAnimation = (target: ShapeData | ParagraphData, isParagraph: boolean = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const getAnimationStyle = useCallback(() => {
    const { animationType, animationDelay, animationDuration } = target;

    if (!animationType || animationDelay === undefined || animationDuration === undefined || isNaN(animationDelay) || isNaN(animationDuration)) return {};

    const delayFrames = animationDelay * fps;
    const durationFrames = animationDuration * fps;
    const endFrame = delayFrames + durationFrames;

    if (frame < delayFrames && (animationType === 'slideInLeft' || animationType === 'slideInRight')) {
      return { opacity: 0 };
    }

    const progress = interpolate(
      frame,
      [delayFrames, endFrame],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    switch (animationType) {
      case 'scaleUp':
        const scaleUpDuration = 0.25;
        const scaleDownStart = animationDuration - scaleUpDuration;
        const scaleProgress = progress * animationDuration;
        const scale = interpolate(
          scaleProgress,
          [0, scaleUpDuration, scaleDownStart, scaleDownStart + 0.125, animationDuration],
          [1, 1.2, 1.2, 1, 1],
          { extrapolateRight: 'clamp' }
        );
        
        return {
          transform: `scale(${scale})`,
          transformOrigin: 'left center',
          zIndex: scale > 1 ? 999 : 1,
          position: 'relative',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        };

      case 'slideInLeft':
        const startXLeft = isParagraph ? -100 : -(target as ShapeData).width.value;
        const translateXLeft = interpolate(progress, [0, 1], [startXLeft, 0]);
        const opacityLeft = interpolate(progress, [0, 1], [0, 1]);
        return { transform: `translateX(${translateXLeft}px)`, opacity: opacityLeft };

      case 'slideInRight':
        const startXRight = isParagraph ? 100 : (target as ShapeData).width.value;
        const translateXRight = interpolate(progress, [0, 1], [startXRight, 0]);
        const opacityRight = interpolate(progress, [0, 1], [0, 1]);
        return { transform: `translateX(${translateXRight}px)`, opacity: opacityRight };

      case 'fadeIn':
        return { opacity: progress };

      case 'wiggle':
        const wiggle = Math.sin(progress * Math.PI * 4) * 10;
        return { transform: `translateX(${wiggle}px) rotate(${wiggle / 2}deg)` };

      case 'typewriter':
        if (isParagraph && 'text' in target) {
          const textLength = target.text.length;
          const visibleCharacters = Math.floor(progress * textLength);
          return {
            clipPath: `inset(0 ${100 - (visibleCharacters / textLength) * 100}% 0 0)`,
            whiteSpace: 'pre-wrap' as const,
          };
        }
        return {};

      case 'highlight':
        const highlightUpDuration = 0.25;
        const highlightStayDuration = 0.35;
        const highlightDownDuration = 0.25;
        
        const startTime = 0;
        const fadeInEnd = highlightUpDuration;
        const stayEnd = fadeInEnd + highlightStayDuration;
        const fadeOutEnd = stayEnd + highlightDownDuration;
        
        const highlightPosition = interpolate(
          progress * animationDuration,
          [startTime, fadeInEnd, stayEnd, fadeOutEnd],
          [-100, 0, 0, 100],
          { extrapolateRight: 'clamp' }
        );
        
        const firstRun = (target as ParagraphData).runs[0];
        const textColor = firstRun?.color || { red: 0, green: 0, blue: 0, alpha: 1 };
        
        const brightness = (0.299 * textColor.red + 0.587 * textColor.green + 0.114 * textColor.blue) / 255;
        
        const highlightColor = brightness > 0.5 
          ? { red: 0, green: 0, blue: 139, alpha: 0.3 }
          : { red: 255, green: 255, blue: 0, alpha: 0.3 };
        
        const backgroundColor = `rgba(${highlightColor.red}, ${highlightColor.green}, ${highlightColor.blue}, ${highlightColor.alpha})`;
        
        return {
          backgroundImage: `linear-gradient(to right, transparent ${highlightPosition}%, ${backgroundColor} ${highlightPosition}%, ${backgroundColor} ${highlightPosition + 100}%, transparent ${highlightPosition + 100}%)`,
        };

      default:
        return {};
    }
  }, [frame, fps, target, isParagraph]);

  return getAnimationStyle;
};

