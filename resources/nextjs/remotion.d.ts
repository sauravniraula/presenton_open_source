declare module 'remotion' {
  export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  export const useCurrentFrame: () => number;
  export const useVideoConfig: () => { fps: number; width: number; height: number; durationInFrames: number };
  export const continueRender: (handle: any) => void;
  export const delayRender: () => any;
  // Add other Remotion exports as needed
}

declare module '@remotion/player' {
  export const Player: React.ForwardRefExoticComponent<any>;
}
