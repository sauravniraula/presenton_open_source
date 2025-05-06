import React, { useCallback } from 'react';
import { ShapeData } from '../types/slideTypes';

const HANDLE_SIZE = 8;

type HandleType = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ResizeHandleProps {
  type: HandleType;
  shape: ShapeData;
  onResize: (newSize: { width: number; height: number; left: number; top: number }) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ type, shape, onResize }) => {
  const size = HANDLE_SIZE;
  const margin = -size / 2;

  const getHandleStyle = (type: HandleType): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: size,
      height: size,
      backgroundColor: 'white',
      border: '1px solid #0B84F3',
      pointerEvents: 'all',
    };

    switch (type) {
      case 'top-left':
        return {
          ...baseStyle,
          top: margin,
          left: margin,
          cursor: 'nw-resize',
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: margin,
          right: margin,
          cursor: 'ne-resize',
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: margin,
          left: margin,
          cursor: 'sw-resize',
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: margin,
          right: margin,
          cursor: 'se-resize',
        };
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const initialX = e.clientX;
    const initialY = e.clientY;
    const initialWidth = shape.width.value;
    const initialHeight = shape.height.value;
    const initialLeft = shape.position_x.value;
    const initialTop = shape.position_y.value;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const offsetX = moveEvent.clientX - initialX;
      const offsetY = moveEvent.clientY - initialY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = initialLeft;
      let newTop = initialTop;

      switch (type) {
        case 'top-left':
          newWidth = Math.max(1, initialWidth - offsetX);
          newHeight = Math.max(1, initialHeight - offsetY);
          newLeft = initialLeft + (initialWidth - newWidth);
          newTop = initialTop + (initialHeight - newHeight);
          break;
        case 'top-right':
          newWidth = Math.max(1, initialWidth + offsetX);
          newHeight = Math.max(1, initialHeight - offsetY);
          newTop = initialTop + (initialHeight - newHeight);
          break;
        case 'bottom-left':
          newWidth = Math.max(1, initialWidth - offsetX);
          newHeight = Math.max(1, initialHeight + offsetY);
          newLeft = initialLeft + (initialWidth - newWidth);
          break;
        case 'bottom-right':
          newWidth = Math.max(1, initialWidth + offsetX);
          newHeight = Math.max(1, initialHeight + offsetY);
          break;
      }

      onResize({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        left: Math.round(newLeft),
        top: Math.round(newTop),
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [shape, type, onResize]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={getHandleStyle(type)}
    />
  );
}; 