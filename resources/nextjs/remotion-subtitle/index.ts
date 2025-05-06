import SubtitleSequence from './core/SubtitleSequence';
import { FadeCaption } from './captions/FadeCaption';
import { TypewriterCaption } from './captions/TypewriterCaption';
// ... import other captions as needed

export { 
    SubtitleSequence,
    FadeCaption,
    TypewriterCaption
};

// Add TypeScript types directly in the index file
import { ComponentType } from 'react';

export interface CaptionProps {
    style?: React.CSSProperties;
    text?: string;
    startFrame?: number;
    endFrame?: number;
}

export interface SubtitleData {
    text: string;
    startFrame: number;
    endFrame: number;
} 