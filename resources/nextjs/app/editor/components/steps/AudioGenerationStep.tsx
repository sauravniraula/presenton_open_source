'use client'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Wand2, ArrowRight, Settings2, Loader2, RotateCcw, CheckCircle2, Mic2 } from 'lucide-react'
import { setCurrentSlideIndex, updateSlides, setMergedSubtitleUrl } from '@/store/slices/slideSlice'
import { completeStep, setCurrentStep } from '@/store/slices/progressSteps'
import { useToast } from "@/hooks/use-toast"
import { VoiceSelectionModal } from './audio/VoiceSelectionModal'
import { AudioResponse } from './types/audioTypes'
import { AudioPlayer } from './audio/AudioPlayer'
import { useAudioGenerator } from '../../hooks/useAudioGenerator'

interface SelectedVoiceInfo {
    id: string;
    gender: string;
}
interface AudioGenerationState {
    status: 'idle' | 'generating audio' | 'complete' | 'error';
    progress: number;
}

export default function AudioGenerationStep() {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const slides = useSelector((state: RootState) => state.slide.slides)
    const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex)
    const { voiceId, voiceGender } = useSelector((state: RootState) => state.transition)
    const { generateAudio, isLoading, error: audioError } = useAudioGenerator()

    // Check if audio is already generated
    const hasGeneratedAudio = slides.some(slide => slide.audio);

    // States
    const [showVoiceModal, setShowVoiceModal] = useState(slides.some(slide => slide.audio) ? false : true)
    const [selectedVoiceInfo, setSelectedVoiceInfo] = useState<SelectedVoiceInfo>({
        id: slides[0]?.selectedVoice || voiceId || "onyx",
        gender: slides[0]?.voiceGender || voiceGender || "male"
    });

    // Simplified generation state
    const [generationState, setGenerationState] = useState<AudioGenerationState>({
        status: hasGeneratedAudio ? 'complete' : 'idle',
        progress: hasGeneratedAudio ? 100 : 0
    });

    // Simplified update function
    const updateGenerationState = (
        status: AudioGenerationState['status'],
        progress: number = 0
    ) => {
        setGenerationState({ status, progress });
    };

    const handleGenerateAudio = () => {

        setShowVoiceModal(true);
    };

    const handleVoiceSelect = async (voiceId: string, gender: string) => {
        console.log("generating for voice id and gender", { id: voiceId, gender });
        setSelectedVoiceInfo({ id: voiceId, gender });
        setShowVoiceModal(false);
        updateGenerationState('generating audio', 0);

        console.log("handling voice select")

        try {
            if (slides.length > 0 && slides.some(slide => slide.script)) {
                toast({
                    title: "Generating Audio",
                    description: "Please wait while we generate your audio...",
                });

                const scripts = slides.map((slide, index) => ({
                    index,
                    script: slide.script || ''
                }));

                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 1;
                    if (progress <= 90) {
                        updateGenerationState('generating audio', progress);
                    }
                }, 200);

                console.log("generating audio")

                const audioResults = await generateAudio(scripts, voiceId);
                clearInterval(progressInterval);
                console.log("audio results", audioResults)

                if (audioResults) {
                    const updatedSlidesAudio = slides.map((slide, index) => ({
                        ...slide,
                        audio: audioResults.slides.find(
                            (result: { index: number }) => result.index === slide.index
                        ),
                        selectedVoice: voiceId,
                        voiceGender: gender,
                        ...(slide.index === 0 ? {
                            merged_audio_url: audioResults.merged_audio_url,
                            merged_subtitle_url: audioResults.merged_subtitle_url
                        } : {}),
                        shapes: slide.shapes.map(shape => ({
                            ...shape,
                            text_frame: shape.text_frame ? {
                                ...shape.text_frame,
                                paragraphs: shape.text_frame.paragraphs.map(para => ({
                                    ...para,
                                    animationType: undefined,
                                    animationDelay: undefined,
                                    animationDuration: undefined
                                }))
                            } : shape.text_frame
                        })),
                        video_url: undefined,
                    }));

                    dispatch(updateSlides(updatedSlidesAudio));
                    if (audioResults.merged_subtitle_url) {
                        dispatch(setMergedSubtitleUrl(audioResults.merged_subtitle_url));
                    }

                    updateGenerationState('complete', 100);

                    handleContinue();

                    // toast({
                    //     title: "Audio Generated",
                    //     description: "Review Your Audio and continue to Animate Slides",
                    // });
                }
            }
        } catch (error) {
            updateGenerationState('error', 0);
            toast({
                variant: "destructive",
                title: "Audio Generation Failed",
                description: audioError || "Failed to generate audio",
            });
        }
    };

    const handleContinue = () => {
        dispatch(completeStep(3));
        dispatch(setCurrentStep(4));
        localStorage.setItem('currentProgressStep', '4');
    };

    useEffect(() => {
        if (voiceId && voiceGender && !hasGeneratedAudio) {
            handleVoiceSelect(voiceId, voiceGender);

        }
    }, [voiceId, voiceGender]);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Audio Generation
                            </h2>
                            <p className="text-gray-500 mt-1">Generate and preview audio for your slides</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Selected Voice Badge */}
                            {selectedVoiceInfo.id && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                                    <Mic2 className="w-4 h-4" />
                                    <span className="font-medium capitalize">{selectedVoiceInfo.id}</span>
                                    <div className="w-1 h-1 bg-purple-300 rounded-full mx-1" />
                                    <span className="text-xs capitalize">{selectedVoiceInfo.gender}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={generationState.status !== 'complete'}
                                        onClick={() => setShowVoiceModal(true)}
                                        className="ml-2 h-auto p-1 hover:bg-purple-100"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Generation Status Badge */}
                            {generationState.status === 'complete' && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">Generation Complete</span>
                                </div>
                            )}

                            {slides.some(slide => slide.audio) ? (
                                <Button
                                    onClick={handleContinue}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white gap-2"
                                >
                                    Go to Animate Slides
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleGenerateAudio}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white gap-2"
                                    disabled={isLoading}
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Generate Audio
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    {generationState.status === 'generating audio' && (
                        <div className="relative overflow-hidden rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="font-medium capitalize">{generationState.status}</span>
                                    </div>
                                    <span className="text-purple-700 font-medium">
                                        {Math.round(generationState.progress)}%
                                    </span>
                                </div>
                                <Progress
                                    value={generationState.progress}
                                    className="h-1.5 bg-purple-100"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Slide Preview */}
                    <Card className="overflow-hidden col-span-2">
                        {/* Slide Navigation */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <span className="font-medium text-gray-700">
                                Slide {currentSlideIndex + 1} of {slides.length}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => dispatch(setCurrentSlideIndex(currentSlideIndex - 1))}
                                    disabled={currentSlideIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => dispatch(setCurrentSlideIndex(currentSlideIndex + 1))}
                                    disabled={currentSlideIndex === slides.length - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Slide Preview */}
                        <div className="aspect-[16/9] relative bg-gray-50">
                            <img
                                src={slides[currentSlideIndex]?.thumbnail}
                                alt={`Slide ${currentSlideIndex + 1}`}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </Card>

                    {/* Audio Preview */}
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-medium text-gray-700">Audio Preview</h3>
                        </div>
                        <div className="p-4">
                            {slides[currentSlideIndex]?.audio ? (
                                <AudioPlayer
                                    script={slides[currentSlideIndex].script || ''}
                                    audioData={slides[currentSlideIndex].audio}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg">
                                    {generationState.status === 'generating audio' ? (
                                        <>
                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                                            <p className="text-gray-500">Generating audio...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Mic2 className="w-8 h-8 text-gray-400 mb-3" />
                                            <p className="text-gray-500">No audio generated yet</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Voice Selection Modal */}
            <VoiceSelectionModal
                initialSelectedVoice={selectedVoiceInfo.id}

                isOpen={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                onSelect={handleVoiceSelect}
            />
        </div>
    );
} 