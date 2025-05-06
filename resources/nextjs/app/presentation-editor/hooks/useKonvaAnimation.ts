import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { ShapeData } from '@/remotion/types/slideTypes';
import { getAnimationConfig } from '@/remotion/hooks/useAnimeAnimation';

export const useKonvaAnimation = (shape: ShapeData, konvaNode: Konva.Node | null) => {
  const animationRef = useRef<Konva.Animation | null>(null);

  useEffect(() => {
    if (!konvaNode) return;

    const animationConfig = getAnimationConfig(shape);
    if (!animationConfig) return;

    const { duration, easing, delay, ...props } = animationConfig;

    const startAnimation = () => {
      const anim = new Konva.Animation((frame) => {
        if (!frame) return;

        const time = ((frame.time - delay) % (duration + delay)) / duration;
        if (time < 0) return;

        const easedTime = Konva.Easings[easing](time);

        Object.entries(props).forEach(([prop, value]) => {
          if (typeof value === 'function') {
            konvaNode.setAttr(prop, value(easedTime));
          } else if (Array.isArray(value)) {
            konvaNode.setAttr(prop, value[1] + (value[0] - value[1]) * easedTime);
          }
        });
      }, konvaNode.getLayer());

      animationRef.current = anim;
      anim.start();
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [shape, konvaNode]);

  return animationRef;
};
