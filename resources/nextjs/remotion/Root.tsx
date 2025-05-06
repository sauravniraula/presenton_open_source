'use client';

import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Composition';

export const RemotionRoot: React.FC = () => {
  // Default configuration that will be overridden by actual slide data
  const defaultConfig = {
    width: 1920,
    height: 1080,
    durationInFrames: 30000,
    fps: 30,
  };

  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={Math.floor(defaultConfig.durationInFrames)}
        fps={Math.floor(defaultConfig.fps)}
        width={Math.floor(defaultConfig.width)}
        height={Math.floor(defaultConfig.height)}
        defaultProps={{
          slides: [],
          slideFrameMappings: [],
          currentSlideIndex: 0
        }}
      />
    </>
  );
};
