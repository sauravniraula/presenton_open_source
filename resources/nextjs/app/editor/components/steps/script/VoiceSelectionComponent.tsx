'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VoiceOption } from "../types/audioTypes"
import { Play, Pause, Volume2 } from "lucide-react"
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'



interface VoiceSelectionComponentProps {
    initialSelectedVoice: string;
    onVoiceSelect: (voiceId: string, gender: string) => void;
}
const voiceOptions: VoiceOption[] = [
    {
        id: "onyx",
        name: "Onyx",
        description: "Deep and professional male voice",
        preview: "https://cdn.openai.com/API/docs/audio/onyx.wav",
        category: "professional",
        gender: "male",
        language: "en-US"
    },
    {
        id: "nova",
        name: "Nova",
        description: "Clear and engaging female voice",
        preview: "https://cdn.openai.com/API/docs/audio/nova.wav",
        category: "professional",
        gender: "female",
        language: "en-US"
    },

    {
        id: "echo",
        name: "Echo",
        description: "Warm and friendly male voice",
        preview: "https://cdn.openai.com/API/docs/audio/echo.wav",
        category: "casual",
        gender: "male",
        language: "en-US"
    },
    {
        id: "fable",
        name: "Fable",
        description: "Gentle and soothing female voice",
        preview: "https://cdn.openai.com/API/docs/audio/fable.wav",
        category: "casual",
        gender: "female",
        language: "en-US"
    }, {
        id: "shimmer",
        name: "Shimmer",
        description: "Bright and energetic female voice",
        preview: "https://cdn.openai.com/API/docs/audio/shimmer.wav",
        category: "casual",
        gender: "female",
        language: "en-US"
    }
];


export function VoiceSelectionComponent({ initialSelectedVoice, onVoiceSelect }: VoiceSelectionComponentProps) {

    const [selectedVoice, setSelectedVoice] = useState<string>(initialSelectedVoice);

    const [playingPreview, setPlayingPreview] = useState<string | null>(null);

    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const { voiceId, voiceGender } = useSelector((state: RootState) => state.transition);

    const selectVoice = (voiceId: string) => {
        setSelectedVoice(voiceId);
        const voice = voiceOptions.find(voice => voice.id === voiceId);
        var voiceGender = "male";
        if (voice) {
            voiceGender = voice.gender;
        }
        onVoiceSelect(voiceId, voiceGender);
    };

    const playPreview = (voiceId: string, previewUrl?: string) => {
        if (!previewUrl) return;

        if (playingPreview === voiceId && audioElement) {
            audioElement.pause();
            setPlayingPreview(null);
        } else {
            if (audioElement) {
                audioElement.pause();
            }
            const audio = new Audio(previewUrl);

            audio.play();
            setAudioElement(audio);
            setPlayingPreview(voiceId);

            audio.onended = () => {
                setPlayingPreview(null);
                setAudioElement(null);
            };
        }
    };

    const stopAudio = () => {
        if (audioElement) {
            audioElement.pause();
            setAudioElement(null);
            setPlayingPreview(null);
        }
    };

    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
            }
        };
    }, []);

    return (
        <div className="space-y-6 py-4">
            {/* Voice Categories */}
            <div className="grid grid-cols-1 gap-4">
                {voiceOptions.map((voice) => (
                    <div
                        key={voice.id}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                                    ${selectedVoice === voice.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        onClick={() => selectVoice(voice.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{voice.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs
                                                ${voice.gender === 'male'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-purple-100 text-purple-700'
                                        }`}
                                    >
                                        {voice.gender}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{voice.description}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {voice.preview && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playPreview(voice.id, voice.preview);
                                        }}
                                    >
                                        {playingPreview === voice.id ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                                {selectedVoice === voice.id && (
                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    )
}

