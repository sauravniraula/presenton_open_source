'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { renderVideo, getProgress } from '@/lambda/api';
import { RootState } from '@/store/store';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUsageTracking } from '@/hooks/useUsageTracking';

const FPS = 30;
const SLIDE_PADDING_SECONDS = 1.5;

interface ExportButtonProps {
  isDisabled: boolean;
  onExportStart: () => void;
  onExportComplete: () => void;
  onExportError: (error: string) => void;
  showSubtitles?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  isDisabled,
  onExportStart,
  onExportComplete,
  onExportError,
  showSubtitles = true
}) => {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const slides = useSelector((state: RootState) => state.slide.slides);
  const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);
  const { toast } = useToast();
  // const { checkLimit, incrementUsage } = useUsageTracking();

  // Calculate frame mappings
  const { totalDurationInFrames, slideFrameMappings } = useMemo(() => {
    const mappings = slides.map((slide, index) => {
      const audioDuration = slide.audio?.letter_timing.character_end_times_seconds.slice(-1)[0] || 0;
      const duration = SLIDE_PADDING_SECONDS + audioDuration;

      const previousDurations = slides
        .slice(0, index)
        .reduce((acc, s) => {
          const sDuration = (s.audio?.letter_timing.character_end_times_seconds.slice(-1)[0] || 0);
          return acc + sDuration + SLIDE_PADDING_SECONDS;
        }, 0);

      const startFrame = Math.ceil(previousDurations * FPS);
      const endFrame = startFrame + Math.ceil(duration * FPS);

      return {
        startFrame,
        endFrame,
        duration,
        audioDuration
      };
    });

    const totalFrames = mappings.length > 0 ?
      mappings[mappings.length - 1].endFrame : 0;

    return {
      totalDurationInFrames: totalFrames,
      slideFrameMappings: mappings,
    };
  }, [slides]);

  const handleExport = async () => {
    // Set loading state immediately
    setIsRendering(true);

    if (isDisabled) {
      setIsRendering(false);
      return;
    }
    if (!slides.length) {
      setIsRendering(false);
      toast({
        variant: "destructive",
        title: "No Slides Available",
        description: "Please upload a presentation before exporting.",
      });
      return;
    }

    // const isIncremented = await incrementUsage('exports', 1);
    // if (!isIncremented) {
    //   setIsRendering(false);
    //   return;
    // }

    setProgress(0);
    setShowProgress(true);
    setExportStatus('processing');
    onExportStart();

    // Start initial progress animation
    let initialProgress = 0;
    const initialProgressInterval = setInterval(() => {
      initialProgress += 0.5;
      if (initialProgress <= 20) {
        setProgress(initialProgress);
      }
    }, 100);

    const serializedSlides = JSON.parse(JSON.stringify(slides));

    try {
      const renderResult = await renderVideo({
        id: 'Main',
        inputProps: {
          slides: serializedSlides,
          currentSlideIndex,
          slideFrameMappings,
          totalDurationInFrames,
          showSubtitles
        },
      });

      // Clear initial progress animation
      clearInterval(initialProgressInterval);
      setProgress(25); // Set to 25% after render starts

      const checkProgress = async () => {
        try {
          const progressResult = await getProgress({
            id: renderResult.renderId,
            bucketName: renderResult.bucketName,
          });

          if (progressResult.type === 'progress') {
            // Scale progress from 25% to 95%
            const scaledProgress = 25 + (progressResult.progress * 70);
            setProgress(scaledProgress);

            // Update toast every 25%
            if (Math.floor(scaledProgress) % 25 === 0) {
              toast({
                title: "Export Progress",
                description: `${Math.round(scaledProgress)}% complete...`,
              });
            }

            setTimeout(checkProgress, 2000); // Check every 2 seconds
          } else if (progressResult.type === 'done') {
            setProgress(100);
            setExportStatus('complete');
            setIsRendering(false);
            onExportComplete();

            // Small delay before starting download
            setTimeout(() => {
              window.location.href = progressResult.url;
              // Only stop loading after download starts
              setIsRendering(false);
            }, 1000);

            // Close dialog after download starts
            setTimeout(() => {
              setShowProgress(false);
              setProgress(0);
            }, 3000);

          } else if (progressResult.type === 'error') {
            clearInterval(initialProgressInterval);
            setExportStatus('error');
            setIsRendering(false);
            setErrorMessage(progressResult.message || "An error occurred during export");
            onExportError(progressResult.message || "Export failed");
          }
        } catch (error) {
          clearInterval(initialProgressInterval);
          setExportStatus('error');
          setIsRendering(false);
          setErrorMessage("Failed to check export progress");
          onExportError("Failed to check export progress");
        }
      };

      checkProgress();
    } catch (error) {
      clearInterval(initialProgressInterval);
      setExportStatus('error');
      setIsRendering(false);
      setErrorMessage(error instanceof Error ? error.message : "Failed to export video");
      onExportError(error instanceof Error ? error.message : "Export failed");
    }
  };



  return (
    <>
      <Button
        onClick={handleExport}
        disabled={isRendering || !slides.length || isDisabled}
        variant="outline"
        className="gap-2"
      >
        {isRendering ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Video
          </>
        )}
      </Button>

      <Dialog open={showProgress} onOpenChange={(open) => {
        if (exportStatus !== 'processing') {
          setShowProgress(open);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Status Icon */}
            <div className="flex items-center gap-4">
              {exportStatus === 'processing' && (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              )}
              {exportStatus === 'complete' && (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              )}
              {exportStatus === 'error' && (
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {exportStatus === 'processing' && 'Exporting Video'}
                  {exportStatus === 'complete' && 'Export Complete'}
                  {exportStatus === 'error' && 'Export Failed'}
                </h4>
                <p className="text-sm text-gray-500">
                  {exportStatus === 'processing' && 'Please wait while we export your video...'}
                  {exportStatus === 'complete' && 'Your video has been exported successfully!'}
                  {exportStatus === 'error' && errorMessage}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {exportStatus === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />

              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportButton;