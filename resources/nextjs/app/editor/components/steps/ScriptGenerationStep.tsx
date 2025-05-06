'use client'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Wand2, Save, Edit3, ArrowRight, Settings2, Loader2, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react'
import { setCurrentSlideIndex, updateSlides } from '@/store/slices/slideSlice'
import { completeStep, setCurrentStep } from '@/store/slices/progressSteps'
import { useToast } from "@/hooks/use-toast"
import { ScriptPreferencesModal, type ScriptPreferences } from './script/ScriptPreferencesModal'
import { Progress } from "@/components/ui/progress"
import { useScriptGenerator } from '../../hooks/useScriptGenerator'



// Simplify the ScriptGenerationState type
interface ScriptGenerationState {
    status: 'idle' | 'generating' | 'complete' | 'error';
    progress: number;
}

export default function ScriptGenerationStep() {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const slides = useSelector((state: RootState) => state.slide.slides)
    const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex)
    const { generateScript, isLoading, error: scriptError } = useScriptGenerator()

    const [isEditing, setIsEditing] = useState(false)
    const [showPreferences, setShowPreferences] = useState(slides.some(slide => slide.script) ? false : true)

    // Simplified generation state
    const [generationState, setGenerationState] = useState<ScriptGenerationState>({
        status: slides.some(slide => slide.script) ? 'complete' : 'idle',
        progress: slides.some(slide => slide.script) ? 100 : 0
    });

    // Simplified update function
    const updateGenerationState = (
        status: ScriptGenerationState['status'],
        progress: number = 0
    ) => {
        setGenerationState({ status, progress });
    };

    const handleGenerateClick = () => {
        setShowPreferences(true);
    }

    const handlePreferencesSubmit = async (preferences: ScriptPreferences) => {
        setShowPreferences(false);
        updateGenerationState('generating', 0);

        try {
            if (slides.length > 0) {
                toast({
                    title: "Generating Scripts",
                    description: "Please wait while we generate your scripts...",
                });

                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 1;
                    if (progress <= 90) {
                        updateGenerationState('generating', progress);
                    }
                }, 200);

                const generatedScripts = await generateScript(preferences.tone, preferences.userPrompt, preferences.duration);
                clearInterval(progressInterval);

                if (generatedScripts) {
                    // save script and reset audio and animations;
                    const updatedSlides = slides.map((slide, index) => ({
                        ...slide,
                        script: generatedScripts[index].script,
                        audio: undefined,
                        selectedVoice: undefined,
                        voiceGender: undefined,
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
                    dispatch(updateSlides(updatedSlides));

                    updateGenerationState('complete', 100);

                    // toast({
                    //     title: "Scripts Generated",
                    //     description: "Review Your Scripts and continue to Audio Generation",
                    // });

                    handleContinue();
                }
            }
        } catch (error) {
            updateGenerationState('error', 0);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: scriptError || "Failed to generate scripts. Please try again.",
            });
        }
    };

    const handleScriptChange = (value: string) => {
        if (!isEditing) return;

        const updatedSlides = slides.map((slide, index) =>
            index === currentSlideIndex
                ? { ...slide, script: value }
                : slide
        );
        dispatch(updateSlides(updatedSlides));
    }

    const handleContinue = () => {
        dispatch(completeStep(2));
        dispatch(setCurrentStep(3));
        localStorage.setItem('currentProgressStep', '3');
    }

    const getProgressColor = (status: ScriptGenerationState['status']) => {
        switch (status) {
            case 'generating':
                return 'bg-purple-600';
            case 'complete':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-200';
        }
    };
    const showPreferenceBoolen = slides.length > 0 && slides[currentSlideIndex]?.script === undefined;

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    return (
        <>
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Script Generation
                                </h2>
                                <p className="text-gray-500 mt-1">Create and edit scripts for your slides</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {generationState.status === 'complete' && <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-medium">Completed, Review script</span>
                                </div>}

                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreferences(true)}
                                    disabled={showPreferenceBoolen || isLoading}
                                    className="gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Regenerate Script
                                </Button>
                                {slides[currentSlideIndex]?.script !== undefined ? (
                                    <Button
                                        disabled={generationState.status === 'generating' || isLoading}
                                        onClick={handleContinue}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white gap-2"
                                    >
                                        Go to Audio Generation
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={isLoading}
                                        onClick={handleGenerateClick}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white gap-2"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        Generate Script
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Minimal Progress Indicator */}
                        {generationState.status === 'generating' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-purple-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Generating Scripts</span>
                                    </div>
                                    <span>{Math.round(generationState.progress)}%</span>
                                </div>
                                <Progress
                                    value={generationState.progress}
                                    className={`h-1.5 transition-all duration-300 ${getProgressColor(generationState.status)}`}
                                />
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

                        {/* Script Editor */}
                        <Card className="overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-medium text-gray-700">Script Editor</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="gap-2"
                                >
                                    {isEditing ? (
                                        <>
                                            <Save onClick={handleSave} className="w-4 h-4" />
                                            Save
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="p-4">
                                <Textarea
                                    value={slides[currentSlideIndex]?.script || ''}
                                    onChange={(e) => handleScriptChange(e.target.value)}
                                    placeholder={isLoading ? "Generating script..." : "No script generated yet"}
                                    disabled={!isEditing}
                                    className="min-h-[400px] resize-none"
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Script Preferences Modal */}
            <ScriptPreferencesModal
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
                onGenerate={handlePreferencesSubmit}
            />
        </>
    )
} 