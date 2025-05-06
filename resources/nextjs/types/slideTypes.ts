export interface AudioTiming {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface AudioData {
  index: number;
  script: string;
  audio_url: string;
  letter_timing: AudioTiming;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  value: number;
  unit: 'px' | '%' | 'em' | 'rem';
}

export interface ShapeData {
  name: string;
  width: Size;
  height: Size;
  position_x: number;
  position_y: number;
  rotation: number;
  type: string;
  content?: string;
  padding: number;
  autofit: boolean;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    opacity?: number;
  };
  animation?: {
    type: string;
    duration: number;
    delay: number;
  };
}

export interface FrameSize {
  width: number;
  height: number;
}

export interface SlideData {
  merged_audio_url?: string;
  merged_subtitle_url?: string;
  script: string;
  audio: AudioData;
  index: number;
  shapes: ShapeData[];
  background?: string;
  thumbnail?: string;
  slideImages: { [key: string]: string };
  frame_size: FrameSize;
  video_url?: string;
}

export type RemotionSlideData = SlideData; 