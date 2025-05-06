export type ScriptGenerationState = {
    status: 'idle' | 'generating' | 'complete' | 'error';
    currentSlide: number;
    totalSlides: number;
    progress: number;
    message: string;
    subMessage: string;
};



