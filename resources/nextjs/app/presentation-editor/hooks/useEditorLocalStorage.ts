import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadSlidesFromStorage, setCurrentSlideIndex } from '@/store/slices/slideSlice';
import { SlideData } from '@/remotion/types/slideTypes';

export function useEditorLocalStorage() {
  const dispatch = useDispatch();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSlides = localStorage.getItem('presentationSlides');
      const savedIndex = localStorage.getItem('currentSlideIndex');

      if (savedSlides) {
        const parsedSlides = JSON.parse(savedSlides) as SlideData[];
        
        // Use loadSlidesFromStorage action instead of updateSlides
        dispatch(loadSlidesFromStorage(parsedSlides));
        
        if (savedIndex) {
          const index = parseInt(savedIndex, 10);
          if (!isNaN(index) && index >= 0 && index < parsedSlides.length) {
            dispatch(setCurrentSlideIndex(index));
          }
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [dispatch]);

  return {
    saveToLocalStorage: (slides: SlideData[], currentIndex: number) => {
      try {
        localStorage.setItem('presentationSlides', JSON.stringify(slides));
        localStorage.setItem('currentSlideIndex', currentIndex.toString());
        localStorage.setItem('lastUpdated', new Date().toISOString());
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };
} 