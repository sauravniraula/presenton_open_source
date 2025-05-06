import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShapeData, ParagraphData } from '@/remotion/types/slideTypes';

interface EditorState {
  selectedShape: ShapeData | null;
  selectedParagraph: ParagraphData | null;
  showSubtitles: boolean;
}

const initialState: EditorState = {
  selectedShape: null,
  selectedParagraph: null,
  showSubtitles: true,
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setSelectedShape: (state, action: PayloadAction<ShapeData | null>) => {
      state.selectedShape = action.payload;
      state.selectedParagraph = null;
    },
    setSelectedParagraph: (state, action: PayloadAction<ParagraphData | null>) => {
      state.selectedParagraph = action.payload;
    },
    toggleSubtitles: (state) => {
      state.showSubtitles = !state.showSubtitles;
    },
  },
});

export const { setSelectedShape, setSelectedParagraph, toggleSubtitles } = editorSlice.actions;

export default editorSlice.reducer;
