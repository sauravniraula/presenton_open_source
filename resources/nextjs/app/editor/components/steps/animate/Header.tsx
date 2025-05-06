import { Button } from "@/components/ui/button";
import { Loader2, Wand2, User } from "lucide-react";
import ExportButton from '@/app/presentation-editor/ExportButton';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCurrentStep, completeStep } from '@/store/slices/progressSteps';
import { useToast } from "@/hooks/use-toast";
import { useSlideAnimations } from '@/app/presentation-editor/hooks/useSlideAnimations';
import { useEffect, useCallback } from "react";

interface HeaderProps {
    isLoading: boolean;
    onAvatarModalOpen: (open: boolean) => void;
    animationState: {
        status: 'idle' | 'generating' | 'complete' | 'error';
        message: string;
        subMessage: string;
        progress: number;
    };
    setAnimationState: (state: any) => void;
}

export default function Header({
    isLoading,
    onAvatarModalOpen,
    animationState,
    setAnimationState
}: HeaderProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { toast } = useToast();
    const slides = useSelector((state: RootState) => state.slide.slides);
    const firstSlideAudioUrl = slides[0]?.merged_audio_url;
    const { generateAnimations } = useSlideAnimations();
    const showSubtitles = useSelector((state: RootState) => state.editor.showSubtitles);

    const isThereAnimations = useCallback(() => {
        const hasAnimations = slides.some(slide =>
            slide.shapes.some(shape => {
                // Check shape animations - make sure it's not 'none'
                // const hasShapeAnimation = shape.animationType && shape.animationType !== 'none';

                // Check text frame paragraph animations - make sure they're not 'none'
                const hasParagraphAnimation = shape.text_frame?.paragraphs.some(
                    para => para.animationType && para.animationType !== 'none'
                );

                // console.log('Shape:', shape.name, {
                //     shapeAnimation: shape.animationType,
                //     hasParagraphAnimation,
                //     paragraphAnimations: shape.text_frame?.paragraphs.map(p => p.animationType)
                // });

                // return hasShapeAnimation || hasParagraphAnimation;
                return hasParagraphAnimation;
            })
        );

        // console.log('Has animations:', hasAnimations);
        return hasAnimations;
    }, [slides]);


    useEffect(() => {
        if (slides.length > 0 && slides.some(slide => slide.script) && slides.some(slide => slide.audio) && !isThereAnimations()) {
            handleGenerateAnimations();
        }
    }, [])

    const handleAvatarClick = () => {

        if (!firstSlideAudioUrl) {
            toast({
                variant: "destructive",
                title: "Audio Required",
                description: "Please generate audio for your slides before selecting an avatar.",
            });
            return;
        }

        onAvatarModalOpen(true);
    };

    const handleGenerateAnimations = async () => {
        if (!slides.length) {
            toast({
                variant: "destructive",
                title: "No Slides Found",
                description: "Please ensure your presentation has been uploaded correctly.",
            });
            return;
        }
        setAnimationState({
            status: 'generating',
            message: 'Generating Animations',
            subMessage: 'Please wait while we animate your slides...',
            progress: 0
        });
        try {
            // Start progress animation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 1;
                if (progress <= 90) {
                    setAnimationState((prev: any) => ({
                        ...prev,
                        progress,
                        subMessage: `Processing slide ${Math.min(Math.ceil((progress / 90) * slides.length), slides.length)} of ${slides.length}...`
                    }));
                }
            }, 100);

            await generateAnimations(slides);
            clearInterval(progressInterval);

            setAnimationState({
                status: 'complete',
                message: 'Animations Complete',
                subMessage: 'Your slides have been animated successfully!',
                progress: 100
            });

            toast({
                title: "Animations Generated",
                description: "Your slides have been successfully animated!",
            });

        } catch (error) {
            setAnimationState({
                status: 'error',
                message: 'Generation Failed',
                subMessage: error instanceof Error ? error.message : 'Failed to generate animations',
                progress: 0
            });

            toast({
                variant: "destructive",
                title: "Animation Generation Failed",
                description: error instanceof Error ? error.message : 'An unexpected error occurred',
            });
        }
    };

    const handleExportStart = () => {
        dispatch(completeStep(5));
        dispatch(setCurrentStep(6));
        toast({
            title: "Starting Export",
            description: "Preparing to export your presentation as video...",
        });
    };

    const handleExportComplete = () => {
        toast({
            title: "Export Complete",
            description: "Your video has been exported successfully!",
        });
    };

    const handleExportError = (error: string) => {
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: error || "Failed to export video",
        });
    };


    return (
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Animate Your Presentation
                </h1>
                <p className="text-gray-500 mt-1">
                    Add life to your slides with smart animations
                </p>
            </div>
            <div className="flex items-center gap-2">
                {/* <Button
                    disabled={animationState.status === 'generating' || !isThereAnimations()}
                    onClick={handleAvatarClick}
                    variant="outline"
                    className="gap-2"
                >
                    <User className="h-4 w-4" />
                    Add Avatar
                </Button> */}
                <Button
                    onClick={handleGenerateAnimations}
                    disabled={animationState.status === 'generating'}
                    className="gap-2 bg-gradient-to-r font-medium from-purple-600 to-indigo-600 text-white"
                >
                    {animationState.status === 'generating' ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-4 w-4" />
                            {isThereAnimations() ? 'Regenerate Animations' : 'Animate Slides'}
                        </>
                    )}
                </Button>
                <ExportButton
                    isDisabled={animationState.status === 'generating'}
                    onExportStart={handleExportStart}
                    onExportComplete={handleExportComplete}
                    onExportError={handleExportError}
                    showSubtitles={showSubtitles}
                />
            </div>
        </div>
    );
} 