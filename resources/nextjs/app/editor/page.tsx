'use client';
import React from 'react'
import ProgressSteps from './components/ProgressSteps'
import UploadStep from './components/steps/UploadStep'
import ScriptGenerationStep from './components/steps/ScriptGenerationStep'
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import AudioGenerationStep from './components/steps/AudioGenerationStep';
import AnimateSlidesStep from './components/steps/AnimateSlidesStep';
import { Loader2 } from 'lucide-react';

const EditorPage = () => {
    const { currentStep, isProcessing } = useSelector((state: RootState) => state.progressSteps);

    const [initialLoad, setInitialLoad] = React.useState(true);


    // Handle initial loading state
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoad(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Show loading state during initial load or when processing
    if (initialLoad || isProcessing) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ProgressSteps />
                <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                    <Loader2 className="h-10 w-10 animate-spin" />
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <UploadStep />;
            case 2:
                return <ScriptGenerationStep />;
            case 3:
                return <AudioGenerationStep />;
            default:
                return <AnimateSlidesStep />;
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 pb-20'>
            <ProgressSteps />
            {renderStep()}

        </div>
    )
}

export default EditorPage
