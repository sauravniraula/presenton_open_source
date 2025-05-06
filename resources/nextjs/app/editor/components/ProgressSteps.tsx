'use client'
import { toast } from '@/hooks/use-toast';
import { setCurrentStep, setProcessing } from '@/store/slices/progressSteps';
import { loadSlidesFromStorage, setCurrentSlideIndex } from '@/store/slices/slideSlice';
import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Upload,
    ScrollText,
    Mic2,
    Clapperboard,
    UserCircle2,
    Share2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthState } from '@/hooks/useAuthState';

const improvedSteps = [
    {
        id: 1,
        title: 'Upload',
        icon: <Upload className="w-3.5 h-3.5" />,
    },
    {
        id: 2,
        title: 'Script',
        icon: <ScrollText className="w-3.5 h-3.5" />,
    },
    {
        id: 3,
        title: 'Voice',
        icon: <Mic2 className="w-3.5 h-3.5" />,
    },
    {
        id: 4,
        title: 'Animate',
        icon: <Clapperboard className="w-3.5 h-3.5" />,
    },
    {
        id: 5,
        title: 'Avatar',
        icon: <UserCircle2 className="w-3.5 h-3.5" />,
    },
    {
        id: 6,
        title: 'Export',
        icon: <Share2 className="w-3.5 h-3.5" />,
    }
];

const ProgressSteps = () => {
    const { signOut } = useAuth();
    const dispatch = useDispatch()
    const slides = useSelector((state: RootState) => state.slide.slides)
    const { currentStep, completedSteps, isProcessing } = useSelector(
        (state: RootState) => state.progressSteps
    );
    const { user } = useAuthState();
    useEffect(() => {
        const loadData = async () => {
            try {
                dispatch(setProcessing(true));
                const savedSlides = localStorage.getItem('presentationSlides');
                const savedIndex = localStorage.getItem('currentSlideIndex');
                const currentProgressStep = localStorage.getItem('currentProgressStep');
                if (savedSlides) {
                    dispatch(loadSlidesFromStorage(JSON.parse(savedSlides)));
                    if (savedIndex) {
                        dispatch(setCurrentSlideIndex(parseInt(savedIndex, 10)));
                        dispatch(setCurrentStep(parseInt(currentProgressStep || "1")));
                    }
                } else if (slides.length === 0) {
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
            } finally {
                dispatch(setProcessing(false));
            }
        };

        loadData();
    }, []);

    const handleStepClick = (stepId: number) => {
        if (slides.length > 0) {
            if (stepId === 5 || stepId === 6) {
                return;
            }
            switch (stepId) {
                case 2:
                    if (slides.some(slide => slide.script)) {
                        dispatch(setCurrentStep(stepId));
                        localStorage.setItem('currentProgressStep', stepId.toString());
                    } else {
                        console.log('step two')
                        toast({
                            title: "Scripts not found",
                            description: "Please generate scripts first",
                            variant: "destructive"
                        });
                    }
                    break;

                case 3:
                    if (slides.some(slide => slide.audio?.audio_url)) {
                        dispatch(setCurrentStep(stepId));
                        localStorage.setItem('currentProgressStep', stepId.toString());
                    } else {
                        toast({
                            title: "Audio not found",
                            description: "Please generate audio first",
                            variant: "destructive"
                        });
                    }
                    break;

                case 4:
                    if (slides.some(slide => slide.script) && slides.some(slide => slide.audio?.audio_url)) {
                        dispatch(setCurrentStep(stepId));
                        localStorage.setItem('currentProgressStep', stepId.toString());
                    } else {
                        toast({
                            title: "Missing requirements",
                            description: "Please ensure both script and audio are generated",
                            variant: "destructive"
                        });
                    }
                    break;

                case 1:
                    dispatch(setCurrentStep(stepId));
                    localStorage.setItem('currentProgressStep', stepId.toString());
                    break;

                default:
                    break;
            }
        } else {
            toast({
                variant: "destructive",
                title: "No Presentation Found",
                description: "Please upload a presentation first.",
            });
        }
    }
    const handleLogout = () => {
        signOut();
    }
    if (isProcessing) {
        return <div className='bg-white shadow-sm rounded-lg mb-3 py-3 px-4'>
            <div className='flex justify-center items-center h-[calc(100vh-100px)]'>
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        </div>
    }
    return (
        <div className='bg-white shadow-sm rounded-lg mb-3 py-3 px-4'>
            <div className='relative max-w-3xl mx-auto'>
                {/* Connector lines */}
                <div className='absolute top-[18px] left-0 right-0 flex justify-between items-center px-[14px]'>
                    {improvedSteps.slice(0, -1).map((_, index) => (
                        <div
                            key={index}
                            className={`h-[1.5px] w-full transition-all duration-300 
                                ${currentStep > index + 1
                                    ? 'bg-indigo-500'
                                    : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Steps */}
                <div className='flex justify-between relative z-10'>
                    {improvedSteps.map((step) => (
                        <div
                            key={step.id}
                            className='flex flex-col items-center cursor-pointer group'
                            onClick={() => handleStepClick(step.id)}
                        >
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center
                                    transition-all duration-200 ease-out border
                                    ${currentStep === step.id
                                        ? 'bg-indigo-500 border-indigo-600 text-white scale-105 shadow-sm'
                                        : currentStep > step.id
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-white border-gray-200 text-gray-400 group-hover:bg-gray-50 group-hover:border-indigo-200 group-hover:text-indigo-500'
                                    }
                                    ${isProcessing && currentStep === step.id ? 'animate-pulse' : ''}`}
                            >
                                {step.icon}
                            </div>
                            <span
                                className={`mt-1.5 text-[10px] font-medium transition-colors duration-200 whitespace-nowrap
                                    ${currentStep === step.id
                                        ? 'text-indigo-600'
                                        : currentStep > step.id
                                            ? 'text-indigo-500'
                                            : 'text-gray-500 group-hover:text-indigo-500'
                                    }`}
                            >
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
            <a href='https://discord.gg/9ZsKKxudNE' target='_blank' className='absolute top-3 right-24 z-10 w-10 cursor-pointer h-10 hover:bg-gray-200 rounded-md p-1' >

                <svg className='' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                    <path fill="#6c19ff" d="M38.96,10c0,0-4-2-9-3l-1.225,2.449C27.221,9.161,25.637,9,24,9c-1.65,0-3.247,0.163-4.772,0.455 L18,7c-5,1-9,3-9,3c-8,9-7,25-7,25c3,3,11,6,11,6c0.945-0.945,1.89-2.559,2.624-4C13.078,35.835,12,35,12,35l0.739-0.739 C15.888,35.979,19.779,37,24,37c4.21,0,8.09-1.016,11.235-2.725L35.96,35c0,0-1.078,0.835-3.624,2c0.734,1.44,1.679,3.055,2.624,4 c0,0,8-3,11-6C45.96,35,46.96,19,38.96,10z"></path><path fill="#2100c4" d="M9,28c-1-7,4-14,4-14l7-3l-0.772-1.545c-2.792,0.535-5.338,1.52-7.478,2.852 c-1.118,1.414-5.725,7.821-5.031,16.487c1.349,2.18,3.436,4.057,6.02,5.467L14,33C10.825,31.187,9,28,9,28z"></path><path fill="#2100c4" d="M41.281,28.794c0.694-8.666-3.913-15.073-5.031-16.487c-2.149-1.338-4.708-2.325-7.515-2.858 L27.96,11l7,3c0,0,5,7,4,14c0,0-1.825,3.187-5,5l1.275,1.275C37.831,32.864,39.928,30.982,41.281,28.794z"></path><ellipse cx="17" cy="25.5" fill="#ddbaff" rx="4" ry="4.5"></ellipse><ellipse cx="31" cy="25.5" fill="#ddbaff" rx="4" ry="4.5"></ellipse>
                </svg>
            </a>

            {<Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className='absolute top-4 right-4'
            >
                Logout
            </Button>}
        </div>
    )
}

export default ProgressSteps;
