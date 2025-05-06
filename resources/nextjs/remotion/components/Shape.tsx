import React, { memo } from "react";
import { Img } from "remotion";
import { ShapeProps } from "../types/slideTypes";
import { useRemotionAnimation } from "../hooks/useRemotionAnimation";
import { TextFrame } from "./TextFrame";

export const Shape: React.FC<ShapeProps> = memo(({ shape, slideImages }) => {
  const getAnimationStyle = useRemotionAnimation(shape);
  const baseStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: shape.vertical_alignment === 'bottom' ? 'flex-end' :
      shape.vertical_alignment === 'middle' ? 'center' :
        'flex-start',
    overflow: 'visible',
  };

  const animatedStyle = { ...baseStyle, ...getAnimationStyle() };

  if (shape.has_text && shape.text_frame) {
    return <TextFrame textFrame={shape.text_frame} shape={shape} />;
  }

  if (slideImages && slideImages[shape.name]) {
    return (
      <div style={animatedStyle}>
        <Img
          src={slideImages[shape.name]}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
          }}
        />
      </div>
    );
  }

  // For shapes without text or image
  return <div style={animatedStyle} />;
});

Shape.displayName = 'Shape';
