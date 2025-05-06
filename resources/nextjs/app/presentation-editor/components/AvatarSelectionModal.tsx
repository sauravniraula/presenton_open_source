'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAvatarGeneration } from '../hooks/useAvatarGeneration';
import { useDispatch } from 'react-redux';
import { setVideoUrl } from '@/store/slices/slideSlice';
import { useToast } from "@/hooks/use-toast";

interface Presenter {
  presenter_id: string;
  gender: string;
  name: string;
  image_url: string;
  preview_url: string;
}

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl?: string;
}

export function AvatarSelectionModal({ isOpen, onClose, audioUrl }: AvatarSelectionModalProps) {
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPresenter, setSelectedPresenter] = useState<Presenter | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
  const { generateAvatar, status } = useAvatarGeneration();
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPresenters();
    } else {
      setSelectedPresenter(null);
      setHoveredId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened with audioUrl:', audioUrl);
    }
  }, [isOpen, audioUrl]);

  const fetchPresenters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/presentation-data/avatar/presenters');
      const data = await response.json();
      setPresenters(data.presenters);
      toast({
        title: "Avatars Loaded",
        description: "Choose an avatar for your presentation",
      });
    } catch (error) {
      console.error('Failed to fetch presenters:', error);
      toast({
        variant: "destructive",
        title: "Failed to Load Avatars",
        description: "Unable to load avatar options. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoLoad = (presenterId: string) => {
    setLoadingVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(presenterId);
      return newSet;
    });
  };

  const handleVideoLoadStart = (presenterId: string) => {
    setLoadingVideos(prev => new Set(prev).add(presenterId));
  };

  const handlePresenterClick = (presenter: Presenter) => {
    setSelectedPresenter(presenter);
    toast({
      title: "Avatar Selected",
      description: `Selected ${presenter.name} as your presenter`,
    });
  };

  const handleGenerateVideo = async () => {
    if (!selectedPresenter || !audioUrl) {
      toast({
        variant: "destructive",
        title: "Missing Requirements",
        description: !selectedPresenter
          ? "Please select an avatar first"
          : "No audio available. Please generate audio first.",
      });
      return;
    }

    toast({
      title: "Generating Video",
      description: "For demo we will add presenter to only first slide.",
    });

    setTimeout(() => {
      toast({
        title: "Video Generation Complete",
        description: "Will take around 1-5 minutes to add presenter. Please wait...",
      });
    }, 3500);

    try {
      const resultUrl = await generateAvatar({
        presenter_id: selectedPresenter.presenter_id,
        audio_url: audioUrl
      });

      console.log('Avatar video generated:', resultUrl);
      dispatch(setVideoUrl(resultUrl));

      toast({
        title: "Video Generated",
        description: "Your presentation video has been created successfully!",
      });

      onClose();
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      toast({
        variant: "destructive",
        title: "Video Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate video with avatar",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-[720px] lg:max-w-[920px] h-[80vh] flex flex-col p-0"

      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Select an Avatar</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
            {presenters.map((presenter) => (
              <div
                key={presenter.presenter_id}
                className={`relative cursor-pointer group border-2 rounded-lg p-2 transition-all
                  ${selectedPresenter?.presenter_id === presenter.presenter_id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-primary/50'}`}
                onMouseEnter={() => setHoveredId(presenter.presenter_id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handlePresenterClick(presenter)}
              >
                <div className="relative w-full pb-[75%] overflow-hidden rounded-lg bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {hoveredId === presenter.presenter_id ? (
                      <>
                        {loadingVideos.has(presenter.presenter_id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        )}
                        <video
                          src={presenter.preview_url}
                          autoPlay
                          loop
                          muted
                          className="absolute inset-0 w-full h-full object-contain bg-muted"
                          onLoadStart={() => handleVideoLoadStart(presenter.presenter_id)}
                          onLoadedData={() => handleVideoLoad(presenter.presenter_id)}
                        />
                      </>
                    ) : (
                      <img
                        src={presenter.image_url}
                        alt={presenter.name}
                        className="absolute inset-0 w-full h-full object-contain bg-muted transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium capitalize">{presenter.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{presenter.gender}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 pt-2 border-t">
          <div className="flex gap-2 justify-end mb-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={status.isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={!selectedPresenter || !audioUrl || status.isGenerating}
            >
              {status.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status.progress === 'creating' ? 'Creating Avatar...' : 'Processing Video...'}
                </>
              ) : (
                'Generate Avatar Video'
              )}
            </Button>
          </div>
          {!audioUrl && (
            <p className="text-xs text-red-500 mt-2">
              No audio available. Please generate audio first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 