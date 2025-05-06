import React, { memo, useCallback, useMemo } from "react";
import { AbsoluteFill, Img } from "remotion";
import { InteractiveShape } from "./InteractiveShape";
import { SlideData } from "../types/slideTypes";
import { useDispatch } from "react-redux";

interface SlideProps {
  slideData: SlideData;
}

const Slide: React.FC<SlideProps> = memo(({ slideData }) => {
  // Try to get dispatch from redux, if not available set to null
  const dispatch = useDispatch();
  // const dispatch = useMemo(() => {
  //   try {
  //     // Dynamic import of react-redux
  //     const redux = require('react-redux');
  //     return redux.useDispatch();
  //   } catch (error) {
  //     console.log('Redux not available in this context');
  //     return null;
  //   }
  // }, []);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && dispatch) {
      try {
        const { setSelectedShape } = require('../../store/slices/slideSlice');
        dispatch(setSelectedShape(null));
      } catch (error) {
        console.log('Redux actions not available in this context');
      }
    }
  }, [dispatch]);

  return (
    <AbsoluteFill onClick={handleBackgroundClick}>
      {slideData.background && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <Img
            src={slideData.background}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
      {slideData.shapes.map((shape) => (
        <InteractiveShape
          key={shape.name}
          shape={shape}
          slideImages={slideData.slideImages}
        />
      ))}
    </AbsoluteFill>
  );
});

Slide.displayName = 'Slide';

export default Slide;
