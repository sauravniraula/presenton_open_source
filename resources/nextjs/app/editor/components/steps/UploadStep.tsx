'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Upload, FileType, Check, Loader2, Image as ImageIcon, AlertCircle, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Trash } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { completeStep, setCurrentStep } from '@/store/slices/progressSteps'
import { setCurrentSlideIndex, updateSlides } from '@/store/slices/slideSlice'
import { setProcessingStatus } from '@/store/slices/processingSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import JSZip from 'jszip'
import { useAuthState } from '@/hooks/useAuthState'
import DemoVideo from '@/components/DemoVideo'
import ProcessingShimmer from './script/ProcessingShimmer'
import { usePresentationProcessor } from '../../hooks/usePresentationProcessor'

type UploadState = {
    status: 'idle' | 'uploading' | 'processing' | 'preview';
    message: string;
    subMessage: string;
    progress: number;
};

export default function UploadStep() {
    const dispatch = useDispatch()
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const searchParams = useSearchParams()
    const url = searchParams.get('url')


    const [uploadState, setUploadState] = useState<UploadState>({
        status: 'idle',
        message: 'Upload Your Presentation',
        subMessage: 'Drag and drop your PowerPoint file here or click to browse',
        progress: 0
    });
    const slides = useSelector((state: RootState) => state.slide.slides)
    const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex)
    const processingStatus = useSelector((state: RootState) => state.processing)
    const currentStep = useSelector((state: RootState) => state.progressSteps.currentStep)
    const { processPresentation } = usePresentationProcessor()
    // const { checkLimit } = useUsageTracking();
    const { toast } = useToast();
    const { user } = useAuthState();
    // Add this useEffect to sync upload state with slides data

    useEffect(() => {
        const handleUrlProcessing = async () => {
            if (!url || !user) return;
            try {
                updateUploadState(
                    'processing',
                    'Processing Presentation',
                    'Processing presentation from URL...',
                    10
                );

                await processPresentation(url);
                updateUploadState(
                    'preview',
                    'Processing Complete',
                    'Your presentation is ready!',
                    100
                );
                toast({
                    title: "Processing Started",
                    description: "Your presentation is being processed...",
                });

                // Remove the URL parameter after processing
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('url');
                router.replace(newUrl.pathname + newUrl.search);

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Processing Failed",
                    description: error instanceof Error ? error.message : "Failed to process presentation",
                });

                updateUploadState(
                    'idle',
                    'Upload Your Presentation',
                    'Drag and drop your PowerPoint file here or click to browse',
                    0
                );
            }
        };

        handleUrlProcessing();
    }, []);

    useEffect(() => {
        if (url) return; // Skip if URL is present

        const localSlides = localStorage.getItem('presentationSlides');
        const newSlides = JSON.parse(localSlides || '[]');
        if (newSlides.length > 0) {
            setUploadState({
                status: 'preview',
                message: 'Processing Complete',
                subMessage: 'Your presentation is ready!',
                progress: 100
            });
            dispatch(setProcessingStatus({
                status: 'complete',
                progress: 100,
                processedSlides: newSlides.length,
                totalSlides: newSlides.length
            }));
        } else {
            setUploadState({
                status: 'idle',
                message: 'Upload Your Presentation',
                subMessage: 'Drag and drop your PowerPoint file here or click to browse',
                progress: 0
            });
        }
    }, [url]);

    const slidesCount = async (file: File) => {
        const fileData = await file.arrayBuffer();

        // Load the .pptx file as a ZIP archive
        const zip = await JSZip.loadAsync(fileData);

        // Find slide files (ppt/slides/slideX.xml)
        const slideFiles = Object.keys(zip.files).filter((fileName) =>
            fileName.startsWith("ppt/slides/slide") && fileName.endsWith(".xml")
        );
        return slideFiles.length
    }

    const updateUploadState = (
        status: UploadState['status'],
        message: string,
        subMessage: string,
        progress: number = 0
    ) => {
        setUploadState({ status, message, subMessage, progress });
    };

    // Add a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset file input helper function
    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file: File) => {
        console.log('user is ', user)
        if (!user) {
            toast({
                variant: "destructive",
                title: "Login Required",
                description: "Please login to continue",
            })
            router.push('/auth/login')
            return;
        }
        // Check file size first
        // const fileSizeInMB = file.size / (1024 * 1024);
        // const canUpload = await checkLimit('fileSize', fileSizeInMB);
        // if (!canUpload) {
        //     toast({
        //         variant: "destructive",
        //         title: "File Size Limit Exceeded",
        //         description: "The file size exceeds your plan's limit. Please upgrade to upload larger files.",
        //     });
        //     resetFileInput();
        //     return;
        // }

        // check if slides count is within limits
        // const slideCount = await slidesCount(file);
        // const canAddSlides = await checkLimit('slides', slideCount);
        // if (!canAddSlides) {
        //     toast({
        //         variant: "destructive",
        //         title: "Slide Limit Exceeded",
        //         description: `Your plan allows for fewer slides than the presentation contains (${slideCount} slides). Please upgrade to continue.`,
        //     });
        //     resetFileInput();
        //     return;
        // }

        // Initial upload state
        updateUploadState(
            'uploading',
            'Starting Upload',
            'Preparing your presentation...',
            0
        );

        const updateProgress = () => {
            setUploadState(prev => ({
                ...prev,
                progress: prev.progress >= 90 ? prev.progress : prev.progress + Math.random() * 15,
                subMessage: prev.progress < 30
                    ? 'Uploading your file...'
                    : prev.progress < 60
                        ? 'Processing slides...'
                        : 'Almost there...'
            }));
        };

        const progressInterval = setInterval(updateProgress, 500);

        try {
            // Get pre-signed URL
            updateUploadState(
                'uploading',
                'Uploading Presentation',
                'Getting ready for upload...',
                10
            );

            const urlResponse = await fetch('/api/presentation-data/get-upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            });

            if (!urlResponse.ok) throw new Error('Failed to get upload URL');
            const { presignedUrl, fileUrl, key } = await urlResponse.json();

            // Upload to S3
            updateUploadState(
                'uploading',
                'Uploading Presentation',
                'Transferring your file securely...',
                30
            );

            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
                mode: 'cors',
            });

            if (!uploadResponse.ok) throw new Error('Upload to S3 failed');

            // Complete upload
            updateUploadState(
                'uploading',
                'Finalizing Upload',
                'Almost there...',
                70
            );

            const completeResponse = await fetch('/api/presentation-data/upload-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, fileUrl }),
            });

            if (!completeResponse.ok) throw new Error('Failed to complete upload');
            const { success } = await completeResponse.json();

            if (success) {
                updateUploadState(
                    'processing',
                    'Processing Presentation',
                    'Optimizing your slides...',
                    100
                );
                toast({
                    title: "Upload Complete",
                    description: "Starting presentation processing...",
                });
                await processPresentation(fileUrl);
                updateUploadState(
                    'preview',
                    'Processing Complete',
                    'Your presentation is ready!',
                    100
                );
            }
        } catch (error) {
            updateUploadState(
                'idle',
                'Upload Failed',
                error instanceof Error ? error.message : "Failed to upload presentation",
                0
            );

            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload presentation",
            });
            resetFileInput();
        } finally {
            setIsDragging(false);
            clearInterval(progressInterval);
        }
    };

    const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, isDragging: boolean) => {
        e.preventDefault()
        setIsDragging(isDragging)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('application/vnd.openxmlformats-officedocument.presentationml')) {
            uploadFile(file)
        } else {
            toast({
                variant: "destructive",
                title: "Invalid File",
                description: "Please drop a valid presentation file (.pptx)",
            })
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadFile(file)
        }
    }

    const handlePrevSlide = () => {
        if (currentSlideIndex > 0) {
            dispatch(setCurrentSlideIndex(currentSlideIndex - 1))
        }
    }

    const handleNextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            dispatch(setCurrentSlideIndex(currentSlideIndex + 1))
        }
    }

    const handleContinue = () => {
        dispatch(completeStep(1))
        dispatch(setCurrentStep(2))
        localStorage.setItem('currentProgressStep', '2');
    }
    const handleAddNewPresentation = () => {
        dispatch(updateSlides([]))
        localStorage.setItem('presentationSlides', JSON.stringify([]));
        localStorage.setItem('currentSlideIndex', '0');
        localStorage.setItem('lastUpdated', new Date().toISOString());
        dispatch(setCurrentSlideIndex(0))
        dispatch(setProcessingStatus({
            status: 'idle',
            progress: 0,
            processedSlides: 0,
            totalSlides: 0

        }))
        updateUploadState('idle', 'Upload Your Presentation', 'Drag and drop your PowerPoint file here or click to browse', 0)
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto">
                {/* Upload UI Section */}
                {!slides.length && processingStatus.status === 'idle' && (
                    <div className="min-h-[80vh] flex flex-col">
                        <Card className={`flex-1 transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-gray-50
            ${isDragging ? 'scale-[1.02] shadow-xl border-blue-200' : 'shadow-md'}`}
                        >
                            <div className="relative h-full">
                                {/* Decorative Elements */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full opacity-20 blur-3xl" />
                                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full opacity-20 blur-3xl" />
                                </div>

                                {/* Main Upload Area */}
                                <div className="relative h-full flex flex-col">
                                    {/* Header */}
                                    <div className="text-center pt-8 pb-4">
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {uploadState.message}
                                        </h2>
                                        <p className="text-gray-500 mt-2">{uploadState.subMessage}</p>
                                    </div>

                                    {/* Upload Zone */}
                                    <div
                                        className={`flex-1 flex items-center justify-center p-8
                                          ${isDragging ? 'bg-blue-50/30' : ''}`}
                                        onDragOver={(e) => handleDragEvents(e, true)}
                                        onDragLeave={(e) => handleDragEvents(e, false)}
                                        onDrop={handleDrop}
                                    >
                                        {uploadState.status !== 'idle' ? (
                                            // Show upload progress UI
                                            <div className="space-y-8 text-center">
                                                <div className="relative inline-flex">
                                                    <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center">
                                                        {uploadState.status === 'processing' || uploadState.status === 'preview' ? (
                                                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                                                        ) : (
                                                            <div className="text-3xl font-bold text-blue-500">
                                                                {Math.min(100, Math.round(uploadState.progress))}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                                                            px-4 py-1.5 rounded-full text-sm font-medium shadow-lg animate-pulse">
                                                            {uploadState.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="max-w-sm mx-auto">
                                                    <Progress value={uploadState.progress} className="h-1.5" />
                                                </div>
                                            </div>
                                        ) : (
                                            // Show initial upload UI
                                            <div className="max-w-xl w-full mx-auto">
                                                <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300
                                    ${isDragging
                                                        ? 'border-blue-400 bg-blue-50/50'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <div className="text-center space-y-6">
                                                        {/* Icon Container */}
                                                        <div className="relative">
                                                            <div className={`w-28 h-28 mx-auto rounded-full 
                                                ${isDragging
                                                                    ? 'bg-blue-100 scale-110'
                                                                    : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                                                                } 
                                                flex items-center justify-center transition-all duration-300
                                                group-hover:shadow-lg`}
                                                            >
                                                                {isDragging ? (
                                                                    <FileType className="w-14 h-14 text-blue-500 animate-bounce" />
                                                                ) : (
                                                                    <Upload className="w-14 h-14 text-blue-500" />
                                                                )}
                                                            </div>
                                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                                                <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-500 shadow-sm">
                                                                    .pptx
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Text Content */}
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-gray-900">
                                                                {isDragging ? 'Drop to Upload' : 'Upload Your Presentation'}
                                                            </h3>
                                                            <p className="text-gray-500 mt-2">
                                                                {isDragging
                                                                    ? 'Release to start uploading'
                                                                    : 'Drag and drop your PowerPoint file here or click below button'
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Upload Button */}
                                                        <div className="space-y-3 flex flex-col">
                                                            <input
                                                                type="file"
                                                                accept=".pptx"
                                                                onChange={handleFileInput}
                                                                className="hidden"
                                                                id="file-upload"
                                                                ref={fileInputRef}
                                                            />
                                                            <Button
                                                                onClick={() => document.getElementById('file-upload')?.click()}
                                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                                                    hover:to-indigo-700 text-white px-8 py-6 rounded-xl shadow-md 
                                                    hover:shadow-lg transition-all duration-200 font-medium text-lg"
                                                            >
                                                                <Upload className='mr-2 text-blue-50' />  Choose PowerPoint File
                                                            </Button>
                                                            {/* <Button
                                                                variant="outline"
                                                                onClick={handleGeneratePresentation}
                                                                className="  px-8 py-6 rounded-xl shadow-md 
                                                    hover:shadow-lg transition-all duration-200 font-medium text-lg"
                                                            >
                                                                <Sparkles className='mr-2 text-rose-500' /> Generate Presentation with AI
                                                            </Button> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Features Section */}
                                    <div className="p-8 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                                        <div className="max-w-4xl mx-auto">
                                            <div className="grid grid-cols-3 gap-8">
                                                {[
                                                    {
                                                        icon: <Upload className="w-7 h-7" />,
                                                        title: "Simple Upload",
                                                        description: "Drag & drop or browse your files with ease"
                                                    },
                                                    {
                                                        icon: <AlertCircle className="w-7 h-7" />,
                                                        title: "Smart Processing",
                                                        description: "Automatic optimization for the best quality"
                                                    },
                                                    {
                                                        icon: <Check className="w-7 h-7" />,
                                                        title: "Instant Preview",
                                                        description: "Review your slides in real-time"
                                                    }
                                                ].map((feature, index) => (
                                                    <div key={index} className="relative group p-4 rounded-xl transition-all duration-200  shadow-md">

                                                        <div className="relative">
                                                            <div className="w-14 h-14 mx-auto text-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 
                                                flex items-center justify-center mb-4  transition-transform duration-200">
                                                                <div className="text-blue-600 mx-auto">
                                                                    {feature.icon}
                                                                </div>
                                                            </div>
                                                            <h4 className="font-semibold text-gray-900 mb-2 text-center">{feature.title}</h4>
                                                            <p className="text-sm text-gray-500 leading-relaxed text-center">{feature.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
                {processingStatus.status !== 'complete' && slides.length === 0 && processingStatus.status !== 'idle' && (
                    <ProcessingShimmer />
                )}

                {/* Slide Preview Section */}
                {slides.length > 0 && (
                    <div
                        className="space-y-6"
                    >
                        {/* Enhanced Header */}
                        <div className="border border-blue-200 rounded-lg ">
                            <div className="bg-white rounded-lg p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Presentation Preview
                                        </h2>
                                        <p className="text-gray-500 mt-1">Review your slides before proceeding</p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-4">
                                        {processingStatus.status === "processing" ? (
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full animate-pulse">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm font-medium">Processing...</span>
                                            </div>
                                        ) : processingStatus.status === 'complete' ? (
                                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-sm font-medium">Ready for Script Generation</span>
                                            </div>
                                        ) : null}

                                        {<Button
                                            variant="outline"
                                            disabled={processingStatus.status === 'processing' || processingStatus.status === 'idle'}
                                            onClick={handleAddNewPresentation}
                                            className='border-red-500 text-red-500 hover:bg-transparent hover:text-red-600'
                                        >
                                            <Trash className="w-4 h-4 mr-1" /> Reset Presentation
                                        </Button>}
                                        {processingStatus.status === 'complete' && (
                                            <Button
                                                onClick={handleContinue}

                                                className="bg-gradient-to-r font-semibold from-purple-600 to-indigo-600 text-white gap-2"
                                            >
                                                {slides.some(slide => slide.script === undefined) ? 'Go to Script Generation' : 'Continue'}
                                                <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
                            {/* Slide Preview - Takes up 2 columns */}
                            <div className="lg:col-span-2 ">
                                <Card className="overflow-hidden border-blue-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {/* Slide Navigation */}
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-gray-700">
                                                Slide {currentSlideIndex + 1} of {slides.length}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handlePrevSlide}
                                                disabled={currentSlideIndex === 0}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleNextSlide}
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
                            </div>

                            {/* Status Cards - Takes up 1 column */}
                            <div className="space-y-6">
                                {/* Processing Progress Card */}
                                <Card className="overflow-hidden border-blue-200 bg-gradient-to-b from-white to-gray-50">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${processingStatus.status === 'complete'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {processingStatus.status === 'complete' ? 'Complete' : 'Processing'}
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="space-y-6">
                                            {/* Progress Bar */}
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>Overall Progress</span>
                                                    <span className="font-medium">{Math.round(processingStatus.progress)}%</span>
                                                </div>
                                                <Progress
                                                    value={processingStatus.progress}
                                                    className="h-2.5 bg-blue-100"
                                                />
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="">
                                                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 rounded-lg">
                                                            <ImageIcon className="w-5 h-5 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Processed Slides</p>
                                                            <p className="text-xl font-bold text-gray-900">
                                                                {`${processingStatus.processedSlides}/${processingStatus.totalSlides}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>


                                        </div>
                                    </div>
                                </Card>


                            </div>
                        </div>
                    </div>
                )}
            </div>

            {currentStep === 1 && <DemoVideo />}
        </div>
    )
} 