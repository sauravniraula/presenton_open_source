import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

export const selectCurrentSlide = (state: RootState) => state.slide.currentSlide;

export const selectShapes = createSelector(
  [selectCurrentSlide],
  (currentSlide) => currentSlide?.shapes || []
);

export const selectSlideImages = createSelector(
  [selectCurrentSlide],
  (currentSlide) => currentSlide?.slideImages || {}
);

export const selectSelectedShapeName = (state: RootState) => state.editor.selectedShape?.name;

export const selectSelectedShape = createSelector(
  [selectShapes, selectSelectedShapeName],
  (shapes, selectedShapeName) => shapes.find(shape => shape.name === selectedShapeName)
);
