'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { Wand2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { VoiceSelectionComponent } from "./VoiceSelectionComponent"
import { useDispatch, useSelector } from 'react-redux';
import { setVoicePreference } from '@/store/slices/transitionSlice';
import { RootState } from '@/store/store';

interface ScriptPreferencesProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (preferences: ScriptPreferences) => void;
}

export interface ScriptPreferences {
    tone: string;
    duration: number;
    style: string;
    complexity: string;
    userPrompt: string;
}

export function ScriptPreferencesModal({ isOpen, onClose, onGenerate }: ScriptPreferencesProps) {
    const dispatch = useDispatch();
    const { voiceId } = useSelector((state: RootState) => state.transition);
    const [preferences, setPreferences] = useState<ScriptPreferences>({
        tone: 'professional',
        duration: 15,
        style: 'engaging',
        complexity: 'moderate',
        userPrompt: ''
    })

    const toneOptions = [
        {
            value: 'professional',
            label: 'Professional',
            description: 'Formal and business-oriented tone'
        },
        {
            value: 'casual',
            label: 'Casual',
            description: 'Relaxed and conversational tone'
        },
        {
            value: 'friendly',
            label: 'Friendly',
            description: 'Warm and approachable tone'
        }
    ]

    // const styleOptions = [
    //     {
    //         value: 'engaging',
    //         label: 'Engaging',
    //         description: 'Interactive and attention-grabbing'
    //     },
    //     {
    //         value: 'narrative',
    //         label: 'Narrative',
    //         description: 'Story-driven presentation style'
    //     },
    //     {
    //         value: 'educational',
    //         label: 'Educational',
    //         description: 'Clear and instructional approach'
    //     }
    // ]

    const handleVoiceSelection = (voiceId: string, gender: string) => {
        dispatch(setVoicePreference({ voiceId, voiceGender: gender }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Script Preferences
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Tone Selection */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Presentation Tone</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {toneOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                                        ${preferences.tone === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, tone: option.value }))}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{option.label}</span>
                                            {preferences.tone === option.value && (
                                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{option.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duration per Slide */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Duration per Slide (seconds)</Label>
                        <div className="space-y-2">
                            <Slider
                                value={[preferences.duration]}
                                onValueChange={(value) => setPreferences(prev => ({ ...prev, duration: value[0] }))}
                                min={10}
                                max={40}
                                step={5}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>10s</span>
                                <span className="font-medium text-blue-600">{preferences.duration}s</span>
                                <span>40s</span>
                            </div>
                        </div>
                    </div>

                    {/* Presentation Style */}
                    {/* <div className="space-y-4">
                        <Label className="text-base font-semibold">Presentation Style</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {styleOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                                        ${preferences.style === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setPreferences(prev => ({ ...prev, style: option.value }))}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{option.label}</span>
                                            {preferences.style === option.value && (
                                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{option.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </div>
                <Textarea
                    value={preferences.userPrompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPreferences(prev => ({ ...prev, userPrompt: e.target.value }))}
                    placeholder="Enter your custom prompt here..."
                    className="w-full focus-visible:right-1 focus-visible:ring-offset-1 focus-visible:ring-blue-200 text-sm min-h-[100px]  font-medium"
                />
                <hr className="my-4 border-t border-gray-200" />
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Select Voice
                    </DialogTitle>
                </DialogHeader>
                <VoiceSelectionComponent 
                    initialSelectedVoice={voiceId}
                    onVoiceSelect={handleVoiceSelection}
                />
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onGenerate(preferences)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Script and Speech
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 