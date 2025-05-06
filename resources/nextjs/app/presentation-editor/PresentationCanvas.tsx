'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { updateShape } from '@/store/slices/slideSlice';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Shape from './Shape';
import { ShapeData } from '@/remotion/types/slideTypes';

const ASPECT_RATIO = 1920 / 1080;

const PresentationCanvas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const slideData = useSelector((state: RootState) => state.slide.slideData);
  const backgroundImageSrc = useSelector((state: RootState) => state.slide.backgroundImage);
  const slideImages = useSelector((state: RootState) => state.slide.slideImages);
  const stageRef = useRef<any>(null);

  const [stageSize, setStageSize] = useState({ width: 1920, height: 1080 });
  const [scale, setScale] = useState(1);

  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (backgroundImageSrc) {
      const img = new window.Image();
      img.src = backgroundImageSrc;
      img.onload = () => setBackgroundImage(img);
    }
  }, [backgroundImageSrc]);

  const updateDimensions = () => {
    const containerWidth = window.innerWidth - 350; // Subtracting the width of the EditorBar
    const containerHeight = window.innerHeight;

    let width = containerWidth;
    let height = containerWidth / ASPECT_RATIO;

    if (height > containerHeight) {
      height = containerHeight;
      width = containerHeight * ASPECT_RATIO;
    }

    const newScale = width / 1920;

    setStageSize({ width, height });
    setScale(newScale);
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleShapeChange = (shapeId: string, newProps: Partial<ShapeData>) => {
    dispatch(updateShape({ id: shapeId, updates: newProps }));
  };

  if (!slideData.shapes || slideData.shapes.length === 0) {
    return <div>No shapes to display</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              width={1920}
              height={1080}
              x={0}
              y={0}
            />
          )}
          {slideData.shapes.map((shape) => (
            <Shape
              key={shape.name}
              shapeProps={shape}
              isSelected={false}
              onSelect={() => {}}
              onChange={(newProps) => handleShapeChange(shape.name, newProps)}
              slideImages={slideImages}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default PresentationCanvas;
