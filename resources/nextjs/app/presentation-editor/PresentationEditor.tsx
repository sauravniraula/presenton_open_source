'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useToast } from "@/hooks/use-toast"
import EditorBar from './EditorBar';
import ExportButton from './ExportButton';
import SlideThumbnails from './SlideThumbnails';
import { AppDispatch, RootState } from '@/store/store';
import { loadSlidesFromStorage, setCurrentSlideIndex } from '@/store/slices/slideSlice';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SlideData } from '@/remotion/types/slideTypes';
import { useSlideAnimations } from './hooks/useSlideAnimations';
import { Button } from "@/components/ui/button";
import { AvatarSelectionModal } from './components/AvatarSelectionModal';
import { Home } from 'lucide-react'
import Link from 'next/link'

const PresentationPlayer = dynamic(() => import('./PresentationPlayer'), { ssr: false });

const PresentationEditor: React.FC = () => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'slides' | 'editor'>('slides');
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const slides = useSelector((state: RootState) => state.slide.slides);
  const firstSlideAudioUrl = slides[0]?.merged_audio_url;
  const { generateAnimations, isLoading, error } = useSlideAnimations();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);
  const currentSlide = useSelector((state: RootState) =>
    state.slide.slides[currentSlideIndex]
  );

  useEffect(() => {
    try {
      const savedSlides = localStorage.getItem('presentationSlides');
      const savedIndex = localStorage.getItem('currentSlideIndex');

      if (savedSlides) {
        const parsedSlides = JSON.parse(savedSlides) as SlideData[];
        dispatch(loadSlidesFromStorage(parsedSlides));

        if (savedIndex) {
          dispatch(setCurrentSlideIndex(parseInt(savedIndex, 10)));
        }
      } else {
        console.warn('No slides found in localStorage');
        toast({
          variant: "destructive",
          title: "No Presentation Found",
          description: "Please upload a presentation first.",
        });
      }
    } catch (error) {
      console.error('Error loading presentation data:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Presentation",
        description: "Failed to load your presentation data.",
      });
    }
  }, [dispatch, toast]);

  const handleAnimateSlides = async () => {
    toast({
      title: "Starting Animation",
      description: "Generating animations for your slides...",
    });

    try {
      await generateAnimations(slides);
      toast({
        title: "Animations Complete",
        description: "Your slides have been animated successfully!",
      });
    } catch (error) {
      console.error('Failed to generate animations:', error);
      toast({
        variant: "destructive",
        title: "Animation Failed",
        description: error instanceof Error ? error.message : "Failed to generate animations",
      });
    }
  };

  const handleAvatarModalOpen = () => {
    if (!firstSlideAudioUrl) {
      toast({
        variant: "destructive",
        title: "Audio Required",
        description: "Please generate audio for your slides before selecting an avatar.",
      });
      return;
    }

    toast({
      title: "Avatar Selection",
      description: "Choose an avatar for your presentation...",
    });
    setIsAvatarModalOpen(true);
  };

  const handleAvatarModalClose = () => {
    setIsAvatarModalOpen(false);
    toast({
      title: "Avatar Updated",
      description: "Your avatar selection has been saved.",
    });
  };

  const handleExportStart = () => {
    toast({
      title: "Starting Export",
      description: "Preparing to export your presentation as video...",
    });
  };

  const handleExportComplete = () => {
    toast({
      title: "Export Complete",
      description: "Your video has been exported successfully! Check your downloads.",
    });
  };

  const handleExportError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: error || "Failed to export video. Please try again.",
    });
  };

  if (!slides.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading presentation...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <a
          href="/"
          className="absolute top-4 left-4 z-10"
        >
          <Button variant="outline" size="icon">
            <Home className="h-4 w-4" />
          </Button>
        </a>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            onClick={handleAvatarModalOpen}
            variant="secondary"
          >
            Add Avatar
          </Button>
          <Button
            onClick={handleAnimateSlides}
            disabled={isLoading}
            variant="secondary"
          >
            {isLoading ? 'Generating...' : 'Animate Slides'}
          </Button>
          <ExportButton
            isDisabled={!slides.length}
            onExportStart={handleExportStart}
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
            isDisabled={isLoading}
            showSubtitles={true}
          />
        </div>
        <PresentationPlayer />
        <AvatarSelectionModal
          isOpen={isAvatarModalOpen}
          onClose={handleAvatarModalClose}
          audioUrl={firstSlideAudioUrl}
        />
      </div>
      <div className="w-[350px] p-4 bg-gray-100">
        <Tabs value={activeSidebarTab} onValueChange={(value) => setActiveSidebarTab(value as 'slides' | 'editor')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="slides">Slides</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
          </TabsList>
          <TabsContent value="slides">
            <SlideThumbnails />
          </TabsContent>
          <TabsContent value="editor">
            <EditorBar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PresentationEditor;
