"use client";

import { useState } from "react";
import parse from "pptx-parser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertPresentationFormat } from "./utils/presentation-converter";
import { useDispatch, useSelector } from "react-redux";
import { updateSlides } from "@/store/slices/slideSlice";
import { RootState } from "@/store/store";

import PPTXCompose from "pptx-compose";

interface BackgroundColor {
  type: 'color';
  color: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
}

interface BackgroundImage {
  type: 'image';
  url: string;
}

export type Background = BackgroundColor | BackgroundImage;

interface Slide {
  index: number;
  shapes: any[];
  frame_size: {
    width: number;
    height: number;
  };
  slideImages: Record<string, string>;
  background: Background;
  thumbnail?: string;
  script?: string;
  audio?: any;
  video_url?: string;
}

export function PresentationProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const currentSlides = useSelector((state: RootState) => state.slide.slides);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {

// Initialize repo
      const fileUrl = URL.createObjectURL(file);
      const composer = new PPTXCompose(fileUrl);
      const pptx = await composer.toJSON();

      // const pptJson = await parse(file);
      // console.log("Parsed presentation:", pptJson);
      // const convertedFormat = await convertPresentationFormat(pptJson);
      
      // Merge new slides with existing data structure
      const updatedSlides = convertedFormat.map((newSlide: Slide, index: number) => {
        const existingSlide = currentSlides[index];
        if (!existingSlide) return newSlide;

        return {
          ...existingSlide,
          shapes: newSlide.shapes || existingSlide.shapes,
          frame_size: newSlide.frame_size || existingSlide.frame_size,
          index: newSlide.index ?? existingSlide.index,
          slideImages: {
            ...existingSlide.slideImages,
            ...newSlide.slideImages
          },
          background: newSlide.background || existingSlide.background,
          thumbnail: newSlide.thumbnail || existingSlide.thumbnail,
          script: existingSlide.script,
          audio: existingSlide.audio,
          video_url: existingSlide.video_url,
        };
      });

      dispatch(updateSlides(updatedSlides));
      console.log("Updated presentation structure:", updatedSlides);
    } catch (error) {
      console.error("Error parsing presentation:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Input
        type="file"
        accept=".pptx"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="max-w-md"
      />
      {isProcessing && (
        <p className="text-sm text-muted-foreground">Processing presentation...</p>
      )}
    </div>
  );
}
