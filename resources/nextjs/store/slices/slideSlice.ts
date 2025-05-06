import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SlideData, ShapeData, ParagraphData } from '@/remotion/types/slideTypes';

const AUDIO_PADDING_TIME = 0.5;

// Add new interface for animation data
interface AnimationElement {
  shape_name?: string;
  text?: string;
  containing_shape_name?: string;
  animation_type: string;
}

interface AnimationGroup {
  elements: AnimationElement[];
  script_segment: string;
}

interface SlideAnimations {
  animation_groups: AnimationGroup[];
}

interface SlideState {
  slides: SlideData[];
  currentSlideIndex: number;
  currentSlide: SlideData | null;
  frame_size: { width: number; height: number; }; // Default size
  selectedShapeId: string | null;
  isDragging: boolean;
}

const initialState: SlideState = {
  slides: [],
  currentSlideIndex: 0,
  currentSlide: null,
  frame_size: { width: 960, height: 540 }, // Default size
  selectedShapeId: null,
  isDragging: false,
};

const saveToLocalStorage = (state: SlideState) => {
  try {
    localStorage.setItem('presentationSlides', JSON.stringify(state.slides));
    localStorage.setItem('currentSlideIndex', state.currentSlideIndex.toString());
    localStorage.setItem('lastUpdated', new Date().toISOString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const slideSlice = createSlice({
  name: 'slide',
  initialState,
  reducers: {
    addSlide: (state, action: PayloadAction<SlideData>) => {
      state.slides.push(action.payload);
      if (state.slides.length === 1) {
        state.currentSlide = action.payload;
      }
      saveToLocalStorage(state);
    },
    updateSlides: (state, action: PayloadAction<SlideData[]>) => {
      state.slides = action.payload;
      if (state.currentSlideIndex >= state.slides.length) {
        state.currentSlideIndex = state.slides.length - 1;
      }
      state.currentSlide = state.slides[state.currentSlideIndex] || null;
      saveToLocalStorage(state);
    },
    setCurrentSlideIndex: (state, action: PayloadAction<number>) => {
      state.currentSlideIndex = action.payload;
      state.currentSlide = state.slides[action.payload] || null;
      saveToLocalStorage(state);
    },
    setSelectedShape: (state, action: PayloadAction<string | null>) => {
      state.selectedShapeId = action.payload;
      saveToLocalStorage(state);
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
      saveToLocalStorage(state);
    },
    updateShapePosition: (state, action: PayloadAction<{
      shapeId: string;
      position: { x: number; y: number };
    }>) => {
      const { shapeId, position } = action.payload;
      const currentSlide = state.slides[state.currentSlideIndex];
      
      if (currentSlide) {
        const shape = currentSlide.shapes.find(s => s.name === shapeId);
        if (shape) {
          shape.position_x = { value: position.x, unit: 'px' };
          shape.position_y = { value: position.y, unit: 'px' };
        }
        state.currentSlide = { ...currentSlide };
      }
      saveToLocalStorage(state);
    },
    updateShapeSize: (state, action: PayloadAction<{
      shapeId: string;
      size: { width: number; height: number };
    }>) => {
      const { shapeId, size } = action.payload;
      const currentSlide = state.slides[state.currentSlideIndex];
      
      if (currentSlide) {
        const shape = currentSlide.shapes.find(s => s.name === shapeId);
        if (shape) {
          shape.width = { value: size.width, unit: 'px' };
          shape.height = { value: size.height, unit: 'px' };
        }
        state.currentSlide = { ...currentSlide };
      }
      saveToLocalStorage(state);
    },
    applyAnimations: (state, action: PayloadAction<SlideAnimations[]>) => {
      const animations = action.payload;

      animations.forEach((slideAnimation, slideIndex) => {
        console.log("Adding animations to slide", slideIndex);
        const slide = state.slides[slideIndex];
        if (!slide) return;
        if (!slide.script) return;

        slideAnimation.animation_groups.forEach(group => {
          if (!slide.script!.includes(group.script_segment)) return;
          
          var segment_start_index = slide.script!.indexOf(group.script_segment);
          var segment_end_index = segment_start_index + group.script_segment.length;
          var segment_start_time = slide.audio?.letter_timing.character_start_times_seconds[segment_start_index];
          var segment_end_time = slide.audio?.letter_timing.character_end_times_seconds[segment_end_index - 1];

          segment_start_time = segment_start_time! + AUDIO_PADDING_TIME;
          segment_end_time = segment_end_time! + AUDIO_PADDING_TIME;
          var segment_total_time = segment_end_time! - segment_start_time!;

          group.elements.forEach(element => {
            console.log(group);
            var animationType: 'fadeIn' | 'slideInLeft' | 'scaleUp' | undefined = element.animation_type as 'fadeIn' | 'slideInLeft' | 'scaleUp';
            if (element.animation_type == 'fadeIn') {
              animationType = 'fadeIn';
            }
            else if (element.animation_type == 'slideIn') {
              animationType = 'slideInLeft';
            }
            else if (element.animation_type == 'zoomIn' || element.animation_type == 'emphasis') {
              animationType = 'scaleUp';
            }
            console.log("animationType", animationType);
            
            // Handle text/paragraph animations
            if (element.text && element.containing_shape_name) {
              const shape = slide.shapes.find(s => s.name === element.containing_shape_name);
              console.log("shape", shape);
              if (shape?.text_frame?.paragraphs) {
                const paragraphIndex = shape.text_frame.paragraphs.findIndex(p => 
                  p.text.includes(element.text!)
                );
                
                if (paragraphIndex !== -1) {
                  shape.text_frame.paragraphs[paragraphIndex].animationType = animationType;
                  shape.text_frame.paragraphs[paragraphIndex].animationDelay = segment_start_time!;
                  if (animationType == 'scaleUp') {
                    shape.text_frame.paragraphs[paragraphIndex].animationDuration = segment_total_time!;
                  }
                  else {
                    shape.text_frame.paragraphs[paragraphIndex].animationDuration = 0.5;
                  }
                }
                console.log("Updated paragraph animation", shape.text_frame.paragraphs[paragraphIndex]);
                console.log("--------------------------------");
              }
            }
          });
        });

        if (slideIndex === state.currentSlideIndex) {
          state.currentSlide = { ...slide };
        }
      });
      saveToLocalStorage(state);
    },
    loadSlidesFromStorage: (state, action: PayloadAction<SlideData[]>) => {
      state.slides = action.payload;
      state.currentSlideIndex = 0;
      state.currentSlide = state.slides[0] || null;
      saveToLocalStorage(state);
    },
    setVideoUrl: (state, action: PayloadAction<string>) => {
      if (state.slides.length > 0) {
        state.slides[0].video_url = action.payload;
        if (state.currentSlideIndex === 0) {
          state.currentSlide = state.slides[0];
        }
        saveToLocalStorage(state);
      }
    },
    setMergedSubtitleUrl: (state, action: PayloadAction<string>) => {
      console.log("setMergedSubtitleUrl", action.payload);
      if (state.slides.length > 0) {
        state.slides[0].merged_subtitle_url = action.payload;
        if (state.currentSlideIndex === 0) {
          state.currentSlide = state.slides[0];
        }
        saveToLocalStorage(state);
      }
    },
  },
});

// Make sure all actions are exported
export const { 
  addSlide, 
  updateSlides, 
  setCurrentSlideIndex, 
  setSelectedShape,
  setDragging,
  updateShapePosition,
  updateShapeSize,
  applyAnimations,
  loadSlidesFromStorage,
  setVideoUrl,
  setMergedSubtitleUrl,
} = slideSlice.actions;

export default slideSlice.reducer;
