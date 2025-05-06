import { configureStore } from '@reduxjs/toolkit';
import slideReducer from './slices/slideSlice';
import editorReducer from './slices/editorSlice';
import processingReducer from './slices/processingSlice';
import progressStepsReducer from './slices/progressSteps';
import authReducer from './slices/authSlice';
import transitionReducer from './slices/transitionSlice';
import presentationGenerationReducer from './slices/presentationGeneration';
import themeReducer from '@/app/(presentation-generator)/store/themeSlice';
import pptGenUploadSlice from './slices/presentationGenUpload';
export const store = configureStore({
  reducer: {
    slide: slideReducer,
    editor: editorReducer,
    processing: processingReducer,
    progressSteps: progressStepsReducer,
    auth: authReducer,
    transition: transitionReducer,
    presentationGeneration: presentationGenerationReducer,
    theme: themeReducer,
    pptGenUpload: pptGenUploadSlice
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
