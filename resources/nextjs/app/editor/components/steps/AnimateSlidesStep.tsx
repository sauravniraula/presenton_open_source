'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleSubtitles } from '@/store/slices/editorSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';


import { Textarea } from '@/components/ui/textarea';
import Thumbnail from './animate/Thumbnail';
import GenerationStatus from './animate/GenerationStatus';
import Header from './animate/Header';
import { useToast } from "@/hooks/use-toast";
import { useSlideAnimations } from '@/app/presentation-editor/hooks/useSlideAnimations';
import { AvatarSelectionModal } from './animate/AvatarSelectionModal';
import { updateSlides } from '@/store/slices/slideSlice';

const PresentationPlayer = dynamic(
    () => import('@/app/presentation-editor/PresentationPlayer'),
    { ssr: false }
);

const AnimateSlidesStep = () => {
    const { toast } = useToast();
    const dispatch = useDispatch();
    const slides = useSelector((state: RootState) => state.slide.slides);
    const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);
    const showSubtitles = useSelector((state: RootState) => state.editor.showSubtitles);
    const firstSlideAudioUrl = slides[0]?.merged_audio_url;
    const { isLoading } = useSlideAnimations({ showSubtitles });
    const [prompt, setPrompt] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [animationState, setAnimationState] = useState({
        status: 'idle' as const,
        message: 'Ready to Generate',
        subMessage: 'Click generate to start animating your slides',
        progress: 0
    });

    const handleScriptChange = (value: string) => {

        const updatedSlides = slides.map((slide, index) =>
            index === currentSlideIndex
                ? { ...slide, script: value }
                : slide
        );
        dispatch(updateSlides(updatedSlides));
    }

    const handleToggleSubtitles = () => {
        dispatch(toggleSubtitles());
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Header
                    isLoading={isLoading}
                    onAvatarModalOpen={setIsAvatarModalOpen}
                    animationState={animationState}
                    setAnimationState={setAnimationState}
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Thumbnail />
                    {/* Preview Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Preview</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleSubtitles}
                                >
                                    {showSubtitles ? 'Hide' : 'Show'} Subtitles
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video  bg-muted rounded-lg overflow-hidden">
                                    <PresentationPlayer showSubtitles={showSubtitles} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prompt Input and Script Card */}
                        <Card className="overflow-hidden mt-3">
                            <CardHeader className="border-b bg-gray-50 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">Script Editor</CardTitle>
                                        <p className="text-sm text-gray-500">Edit or regenerate the script for this slide</p>
                                    </div>

                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Script Textarea */}
                                <div className="border-b">
                                    <Textarea
                                        onChange={(e) => handleScriptChange(e.target.value)}
                                        value={slides[currentSlideIndex]?.script || ''}
                                        placeholder={isLoading ? "Generating script..." : "No script generated yet"}
                                        className="min-h-[200px] rounded-none border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                                    />
                                </div>
                                {/* Prompt Input Section */}
                                {/* <div className="p-4 bg-gray-50">
                                    <form onSubmit={handlePromptSubmit} className="space-y-2">

                                        <div className="relative mt-2">
                                            <Input
                                                id="prompt"
                                                placeholder="e.g., Make it more professional and concise..."
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                className="pr-24 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-purple-600"
                                            />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="absolute right-1 top-[2px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                                            >
                                                <Wand2 className="w-4 h-4 mr-1" />
                                                Generate
                                            </Button>
                                        </div>
                                    </form>
                                </div> */}
                            </CardContent>
                        </Card>

                    </div>
                    <GenerationStatus animationState={animationState} />
                </div>
            </div>

            <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                audioUrl={firstSlideAudioUrl}
                gender={slides[0]?.voiceGender}
            />
        </div>
    );
};

export default AnimateSlidesStep;
