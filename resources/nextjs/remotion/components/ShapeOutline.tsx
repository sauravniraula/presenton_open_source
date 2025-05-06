import React from 'react';
import { ShapeData } from '../types/slideTypes';
import { ResizeHandle } from './ResizeHandle';

interface ShapeOutlineProps {
  shape: ShapeData;
  isSelected: boolean;
  isDragging: boolean;
  onResize: (newSize: { width: number; height: number; left: number; top: number }) => void;
}

export const ShapeOutline: React.FC<ShapeOutlineProps> = ({ 
  shape, 
  isSelected, 
  isDragging,
  onResize 
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${shape.width.value}${shape.width.unit}`,
    height: `${shape.height.value}${shape.height.unit}`,
    left: `${shape.position_x.value}${shape.position_x.unit}`,
    top: `${shape.position_y.value}${shape.position_y.unit}`,
    outline: isSelected ? '2px solid #0B84F3' : undefined,
    pointerEvents: 'none',
    userSelect: 'none',
    transform: shape.rotation ? `rotate(${shape.rotation.value}${shape.rotation.unit})` : undefined,
  };

  return (
    <div style={style}>
      {isSelected && (
        <>
          <ResizeHandle type="top-left" shape={shape} onResize={onResize} />
          <ResizeHandle type="top-right" shape={shape} onResize={onResize} />
          <ResizeHandle type="bottom-left" shape={shape} onResize={onResize} />
          <ResizeHandle type="bottom-right" shape={shape} onResize={onResize} />
        </>
      )}
    </div>
  );
}; 