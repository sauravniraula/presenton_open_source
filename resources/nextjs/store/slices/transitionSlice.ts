import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TransitionState {
  voiceId: string;
  voiceGender: string;
}

const initialState: TransitionState = {
  voiceId: 'onyx',
  voiceGender: 'male'
};

export const transitionSlice = createSlice({
  name: 'transition',
  initialState,
  reducers: {
    setVoicePreference: (state, action: PayloadAction<{ voiceId: string; voiceGender: string }>) => {
        state.voiceId = action.payload.voiceId;
      state.voiceGender = action.payload.voiceGender;
    }
  }
});

export const { setVoicePreference } = transitionSlice.actions;
export default transitionSlice.reducer;