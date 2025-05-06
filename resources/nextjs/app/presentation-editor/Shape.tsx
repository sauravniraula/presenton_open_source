'use client';

import React, { useState } from 'react';
import { Rect, Image, Transformer } from 'react-konva';
import { ShapeData, ParagraphData } from '@/remotion/types/slideTypes';
import TextFrame from './TextFrame';
import { KonvaEventObject } from 'konva/lib/Node';
import { TransformEvent } from 'konva/lib/events/TransformEvent';

interface ShapeProps {
  shapeProps: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newProps: Partial<ShapeData>) => void;
  slideImages: { [key: string]: string };
}

const Shape: React.FC<ShapeProps> = ({ shapeProps, isSelected, onSelect, onChange, slideImages }) => {
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  const [selectedParagraphId, setSelectedParagraphId] = useState<number | null>(null);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = node.x() - shapeProps.width.value / 2;
    const newY = node.y() - shapeProps.height.value / 2;

    onChange({
      position_x: { ...shapeProps.position_x, value: newX },
      position_y: { ...shapeProps.position_y, value: newY },
    });
  };

  const handleTransformEnd = (e: KonvaEventObject<TransformEvent>) => {
    const node = shapeRef.current;
    if (node) {
      onChange({
        width: { ...shapeProps.width, value: node.width() },
        height: { ...shapeProps.height, value: node.height() },
        position_x: { ...shapeProps.position_x, value: node.x() - node.width() / 2 },
        position_y: { ...shapeProps.position_y, value: node.y() - node.height() / 2 },
        rotation: { ...shapeProps.rotation, value: node.rotation() * 100 }, // Convert to 0.01 degrees
      });
    }
  };

  const handleParagraphSelect = (index: number) => {
    setSelectedParagraphId(index);
  };

  const handleParagraphChange = (index: number, newProps: Partial<ParagraphData>) => {
    if (shapeProps.text_frame) {
      const updatedParagraphs = shapeProps.text_frame.paragraphs.map((p, i) =>
        i === index ? { ...p, ...newProps } : p
      );
      onChange({
        text_frame: {
          ...shapeProps.text_frame,
          paragraphs: updatedParagraphs,
        },
      });
    }
  };

  let ShapeComponent: any;
  if (shapeProps.has_text && shapeProps.text_frame) {
    ShapeComponent = TextFrame;
  } else if (slideImages[shapeProps.name]) {
    ShapeComponent = Image;
  } else {
    ShapeComponent = Rect;
  }

  const image =
    ShapeComponent === Image && slideImages[shapeProps.name]
      ? (() => {
          const img = new window.Image();
          img.src = slideImages[shapeProps.name];
          return img;
        })()
      : undefined;


  return (
    <>
      {ShapeComponent === TextFrame ? (
        <ShapeComponent
          paragraphs={shapeProps.text_frame!.paragraphs as ParagraphData[]}
          selectedParagraphId={selectedParagraphId}
          onSelectParagraph={handleParagraphSelect}
          onChangeParagraph={handleParagraphChange}
        />
      ) : (
        <ShapeComponent
          ref={shapeRef}
          x={shapeProps.position_x.value + shapeProps.width.value / 2}
          y={shapeProps.position_y.value + shapeProps.height.value / 2}
          width={shapeProps.width.value}
          height={shapeProps.height.value}
          fill={shapeProps.fill}
          draggable
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onClick={onSelect}
          onTap={onSelect}
          image={image}
          rotation={-shapeProps.rotation?.value / 100} // Convert to degrees
          offsetX={shapeProps.width.value / 2}
          offsetY={shapeProps.height.value / 2}
        />
      )}
    </>
  );
};

export default Shape;
