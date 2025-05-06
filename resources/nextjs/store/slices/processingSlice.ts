import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProcessingState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  processedSlides: number;
  totalSlides: number;
  error: string | null;
  totalTime: number;
  timeToFirstSlide: number;
}

const initialState: ProcessingState = {
  status: 'idle',
  progress: 0,
  processedSlides: 0,
  totalSlides: 0,
  error: null,
  totalTime: 0,
  timeToFirstSlide: 0,
};

export const processingSlice = createSlice({
  name: 'processing',
  initialState,
  reducers: {
    setProcessingStatus: (state, action: PayloadAction<Partial<ProcessingState>>) => {
      Object.assign(state, action.payload);
    },
    setTotalSlides: (state, action: PayloadAction<number>) => {
      state.totalSlides = action.payload;
    },
    setProcessingTimes: (state, action: PayloadAction<{ status: 'idle' | 'processing' | 'complete' | 'error', totalTime: number; timeToFirstSlide: number }>) => {
      state.status = action.payload.status;
      state.totalTime = action.payload.totalTime;
      state.timeToFirstSlide = action.payload.timeToFirstSlide;
    },
  },
});

export const { setProcessingStatus, setTotalSlides, setProcessingTimes } = processingSlice.actions;

export default processingSlice.reducer;
