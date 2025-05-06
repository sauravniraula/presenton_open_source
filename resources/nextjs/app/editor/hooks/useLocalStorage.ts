import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateSlides, setCurrentSlideIndex } from '@/store/slices/slideSlice';
import { SlideData } from '@/remotion/types/slideTypes';

export function useLocalStorage() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      // Load slides from localStorage
      const savedSlides = localStorage.getItem('presentationSlides');
      const savedIndex = localStorage.getItem('currentSlideIndex');

      if (savedSlides) {
        const parsedSlides = JSON.parse(savedSlides) as SlideData[];
        dispatch(updateSlides(parsedSlides));

        // Restore current slide index if available
        if (savedIndex) {
          dispatch(setCurrentSlideIndex(parseInt(savedIndex, 10)));
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [dispatch]);

  const saveToLocalStorage = (slides: SlideData[], currentIndex: number) => {
    try {
      localStorage.setItem('presentationSlides', JSON.stringify(slides));
      localStorage.setItem('currentSlideIndex', currentIndex.toString());
      localStorage.setItem('lastUpdated', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return { saveToLocalStorage };
} 