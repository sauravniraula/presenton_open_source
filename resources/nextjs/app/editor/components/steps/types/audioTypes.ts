import { AudioTiming } from "@/types/slideTypes";

export interface AudioSlide {
  index: number;
  script: string;
  audio_url: string;
  letter_timing: AudioTiming;
}

export interface AudioResponse {
  slides: AudioSlide[];
  merged_audio_url: string;
}
export interface VoiceOption {
    id: string;
    name: string;
    description: string;
    preview?: string;
    category: 'professional' | 'casual' | 'character';
    gender: 'male' | 'female';
    language: string;
} 