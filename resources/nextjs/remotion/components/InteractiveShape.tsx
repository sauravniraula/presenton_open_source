import React, { useCallback, useMemo } from 'react';
import { Shape } from './Shape';
import { ShapeOutline } from './ShapeOutline';
import { ShapeData } from '../types/slideTypes';

interface InteractiveShapeProps {
  shape: ShapeData;
  slideImages?: { [key: string]: string };
}

export const InteractiveShape: React.FC<InteractiveShapeProps> = ({ shape, slideImages }) => {
  let selectedShapeId = '';
  let isDragging = false;
  let dispatch: any = null;

  try {
    // Try to import and use Redux
    const { useSelector, useDispatch } = require('react-redux');
    const { RootState } = require('@/store/store');
    
    // Only execute these hooks if we successfully imported Redux
    dispatch = useDispatch();
    const storeState = useSelector((state: any) => ({
      selectedShapeId: state.slide.selectedShapeId,
      isDragging: state.slide.isDragging
    }));
    
    selectedShapeId = storeState.selectedShapeId;
    isDragging = storeState.isDragging;
  } catch (error) {
    // Redux not available, use default values
    console.log('Redux not available in this context');
  }

  const isSelected = selectedShapeId === shape.name;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!dispatch) return; // Skip if Redux is not available

    e.stopPropagation();
    if (e.button !== 0) return;

    const { setSelectedShape, setDragging, updateShapePosition } = require('../../store/slices/slideSlice');
    
    dispatch(setSelectedShape(shape.name));
    const initialX = e.clientX;
    const initialY = e.clientY;
    const initialLeft = shape.position_x.value;
    const initialTop = shape.position_y.value;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const offsetX = moveEvent.clientX - initialX;
      const offsetY = moveEvent.clientY - initialY;

      dispatch(setDragging(true));
      dispatch(updateShapePosition({
        shapeId: shape.name,
        position: {
          x: Math.round(initialLeft + offsetX),
          y: Math.round(initialTop + offsetY),
        }
      }));
    };

    const handlePointerUp = () => {
      dispatch(setDragging(false));
      window.removeEventListener('pointermove', handlePointerMove);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, [dispatch, shape.name, shape.position_x.value, shape.position_y.value]);

  const handleResize = useCallback((newSize: { width: number; height: number; left: number; top: number }) => {
    if (!dispatch) return; // Skip if Redux is not available

    const { updateShapeSize, updateShapePosition } = require('../../store/slices/slideSlice');

    dispatch(updateShapeSize({
      shapeId: shape.name,
      size: {
        width: newSize.width,
        height: newSize.height,
      }
    }));
    dispatch(updateShapePosition({
      shapeId: shape.name,
      position: {
        x: newSize.left,
        y: newSize.top,
      }
    }));
  }, [dispatch, shape.name]);

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${shape.width.value}${shape.width.unit}`,
    height: `${shape.height.value}${shape.height.unit}`,
    left: `${shape.position_x.value}${shape.position_x.unit}`,
    top: `${shape.position_y.value}${shape.position_y.unit}`,
    transform: shape.rotation ? `rotate(${shape.rotation.value}${shape.rotation.unit})` : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: dispatch ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        style={containerStyle}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Shape shape={shape} slideImages={slideImages} />
        </div>
      </div>
      {dispatch && (
        <ShapeOutline 
          shape={shape}
          isSelected={isSelected}
          isDragging={isDragging}
          onResize={handleResize}
        />
      )}
    </>
  );
};