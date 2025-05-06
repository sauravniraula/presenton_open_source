export interface Position {
  value: number;
  unit: string; // e.g., 'px', '%'
}

export interface Size {
  value: number;
  unit: string; // e.g., 'px', '%'
}


export interface Animation {
  animationType: string;
  animationDelay: Position;
  animationDuration: Position;
}

export interface RunProps {
  text: string;
  font_name: string;
  font_size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
  };
  highlight_color?: {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
  };
  position_x: Position;
  position_y: Position;
  width: Size;
  height: Size;
}

export interface BulletInfo {
  visible: boolean;
  type: number;
  char: string;
  image_url: string | null;
  bullet_size_percent: number | null;
  bullet_color: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
  color: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  } | null;
  font_name: string;
  font_size: Size;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  orientation: number;
  kerning: boolean;
  distance: Size;
  start_value: number;
  current_value: number;
  indent: Size;
  prefix: string;
  suffix: string;
  level: number;
  style: string;
  type_description: 'CHAR' | 'CHAR_UPPER_LETTER' | 'CHAR_LOWER_LETTER' | 'CHAR_UPPER_ROMAN' | 'CHAR_LOWER_ROMAN' | string;
}

export interface ParagraphData {
  text: string;
  alignment: string;
  level: number | null;
  bullet_info: BulletInfo;
  runs: RunProps[];
  position_x: Position;
  position_y: Position;
  width: Size;
  height: Size;
  padding: {
    left: Size;
    right: Size;
    top: Size;
    bottom: Size;
  };
  autofit: 'Shrink Text on Overflow' | 'Do Not Autofit' | 'Resize Shape to Fit Text';
  line_height: Size;
  margin: {
    left: Size;
    right: Size;
    top: Size;
    bottom: Size;
  };
  highlightColor?: {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
  };
  animationType?: 'none' | 'scaleUp' | 'slideInLeft' | 'slideInRight' | 'fadeIn' | 'wiggle' | 'typewriter' | 'highlight';
  animationDelay?: number;
  animationDuration?: number;
}

export interface TextFrameProps {
  textFrame: {
    paragraphs: ParagraphData[];
  };
}

export interface ShapeData {
  name: string;
  type: string; // e.g., 'rectangle', 'circle', 'text', 'image'
  width: Size;
  height: Size;
  position_x: Position;
  position_y: Position;
  fill?: {
    type: string | null;
    color: {
      red: number;
      green: number;
      blue: number;
      alpha?: number;
    } | null;
    transparency: {
      value: number;
      unit: string;
    };
  };
  rotation?: {
    value: number;
    unit: string;
  };
  has_text?: boolean; // Indicates if the shape has text
  text_frame?: {
    paragraphs: ParagraphData[];
    vertical_alignment?: 'top' | 'middle' | 'bottom';
  };
  animationType?: 'none' | 'scaleUp' | 'slideInLeft' | 'slideInRight' | 'fadeIn' | 'wiggle' | 'typewriter';
  animationDelay?: Position; // Animation delay for the shape
  animationDuration?: Position; // Animation duration for the shape
  vertical_alignment?: 'top' | 'middle' | 'bottom';
  text_auto_grow_height?: boolean;
  text_auto_grow_width?: boolean;
  text_word_wrap?: boolean;
  text_fit_to_size?: boolean;
  padding: {
    left: Size;
    right: Size;
    top: Size;
    bottom: Size;
  };
  autofit: 'Shrink Text on Overflow' | 'Do Not Autofit' | 'Resize Shape to Fit Text';
}

// Define the SlideProps interface if it doesn't exist
export interface SlideProps {
  slideData: {
    shapes: ShapeData[];
  };
  backgroundImage: string;
  slideImages: { [key: string]: string };
}

export interface AudioTiming {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface AudioData {
  index: number;

  audio_url: string;
  letter_timing: AudioTiming;
}

export interface SlideData {
  index: number;
  shapes: ShapeData[];
  background?: string;
  thumbnail?: string;
  slideImages: { [key: string]: string };
  frame_size: {
    width: number;
    height: number;
  };
  script?: string;
  audio?: AudioData;
  selectedVoice?: string;
  voiceGender?: string;
  merged_audio_url?: string;
  merged_subtitle_url?: string;
  video_url?: string;
}

export interface ShapeProps {
  shape: ShapeData;
  slideImages?: { [key: string]: string };
}
