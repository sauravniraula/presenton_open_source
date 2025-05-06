'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Info } from "lucide-react";
import { useAvatarGeneration } from '@/app/presentation-editor/hooks/useAvatarGeneration';
import { useDispatch } from 'react-redux';
import { setVideoUrl } from '@/store/slices/slideSlice';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { completeStep, setCurrentStep } from '@/store/slices/progressSteps'
import { useUsageTracking } from '@/hooks/useUsageTracking';


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
    gender?: string;
}

export function AvatarSelectionModal({ isOpen, onClose, audioUrl, gender }: AvatarSelectionModalProps) {
    const [presenters, setPresenters] = useState<Presenter[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPresenter, setSelectedPresenter] = useState<Presenter | null>(null);
    const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
    const { generateAvatar, status } = useAvatarGeneration();
    const dispatch = useDispatch();
    const { toast } = useToast();
    const [generationProgress, setGenerationProgress] = useState(0);
    const { checkLimit, incrementUsage } = useUsageTracking();

    useEffect(() => {
        if (isOpen) {
            fetchPresenters();
        } else {
            setSelectedPresenter(null);
            setHoveredId(null);
            setGenerationProgress(0);
        }
    }, [isOpen]);

    const fetchPresenters = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/presentation-data/avatar/presenters');
            const data = await response.json();
            const filteredPresenters = gender
                ? data.presenters.filter((presenter: Presenter) =>
                    presenter.gender.toLowerCase() === gender.toLowerCase())
                : data.presenters;
            setPresenters(filteredPresenters);
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
        const isIncremented = await incrementUsage('avatarVideoDuration', 1);
        if (!isIncremented) return;

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

        dispatch(completeStep(4));
        dispatch(setCurrentStep(5));

        // Start progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 1;
            if (progress <= 95) {
                setGenerationProgress(progress);
            }
        }, 1500);

        try {
            const resultUrl = await generateAvatar({
                presenter_id: selectedPresenter.presenter_id,
                audio_url: audioUrl
            });

            clearInterval(progressInterval);
            setGenerationProgress(100);

            dispatch(setVideoUrl(resultUrl));

            toast({
                title: "Video Generated",
                description: "Your presentation video has been created successfully!",
            });

            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            clearInterval(progressInterval);
            setGenerationProgress(0);

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
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 max-h-[90vh] overflow-hidden">

                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold">
                        Select Your Presenter
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-8rem)]">
                    {/* Avatar Grid */}
                    <div className="lg:col-span-2 border-r overflow-hidden">
                        <ScrollArea className="h-full w-full">
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    {presenters.map((presenter) => (
                                        <Card
                                            key={presenter.presenter_id}
                                            className={`cursor-pointer transition-all overflow-hidden rounded-lg
                                                ${selectedPresenter?.presenter_id === presenter.presenter_id
                                                    ? 'ring-2 ring-purple-500 ring-offset-2 bg-purple-50/50'
                                                    : 'hover:border-purple-200 border border-gray-200'
                                                }`}
                                            onClick={() => handlePresenterClick(presenter)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
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
                                                                className="w-full h-full "
                                                                onLoadStart={() => handleVideoLoadStart(presenter.presenter_id)}
                                                                onLoadedData={() => handleVideoLoad(presenter.presenter_id)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={presenter.image_url}
                                                            alt={presenter.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    )}
                                                    {selectedPresenter?.presenter_id === presenter.presenter_id && (
                                                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <p className="font-medium text-gray-900 capitalize">{presenter.name}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{presenter.gender}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Preview and Controls */}
                    <div className="p-6 flex flex-col overflow-y-auto">
                        <div className="flex-1">
                            <h3 className="font-semibold mb-4">Selected Presenter</h3>
                            {selectedPresenter ? (
                                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                                    <video
                                        src={selectedPresenter.preview_url}
                                        autoPlay
                                        loop
                                        muted
                                        className="w-full h-full "
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video flex items-center justify-center bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">No presenter selected</p>
                                </div>
                            )}

                            {/* Generation Progress */}
                            {status.isGenerating && (
                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Generation Progress</span>
                                            <span>{Math.round(generationProgress)}%</span>
                                        </div>
                                        <Progress value={generationProgress} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {generationProgress < 50 ? 'Creating avatar...' : 'Processing video...'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Info Message */}
                        {!audioUrl && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                                <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700">
                                    Audio generation is required before adding an avatar. Please generate audio for your slides first.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                                disabled={status.isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                                onClick={handleGenerateVideo}
                                disabled={!selectedPresenter || !audioUrl || status.isGenerating}
                            >
                                {status.isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Video'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 