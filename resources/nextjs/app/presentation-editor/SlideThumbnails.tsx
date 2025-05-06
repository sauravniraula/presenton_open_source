import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setCurrentSlideIndex } from '@/store/slices/slideSlice';
import Image from 'next/image';

const SlideThumbnails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const slides = useSelector((state: RootState) => state.slide.slides);
  const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);

  const handleSlideClick = (index: number) => {
    dispatch(setCurrentSlideIndex(index));
  };

  return (
    <div className="overflow-y-auto h-full">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`cursor-pointer p-2 flex justify-center ${
            index === currentSlideIndex ? 'border-2 border-blue-500' : ''
          }`}
          onClick={() => handleSlideClick(index)}
        >
          {slide.thumbnail ? (
            <div className="relative w-40 h-24">
              <Image
                src={slide.thumbnail}
                alt={`Slide ${index + 1}`}
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-40 h-24 bg-gray-200 flex items-center justify-center">
              <span>No thumbnail</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SlideThumbnails;
