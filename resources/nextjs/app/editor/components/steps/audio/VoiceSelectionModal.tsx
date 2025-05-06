'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VoiceOption } from "../types/audioTypes"
import { Play, Pause, Volume2 } from "lucide-react"
import { useState, useEffect } from "react"

interface VoiceSelectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (voice: string, gender: string) => void;
    initialSelectedVoice?: string;
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

export function VoiceSelectionModal({ isOpen, onClose, onSelect, initialSelectedVoice }: VoiceSelectionProps) {

    const [selectedVoice, setSelectedVoice] = useState<string>(initialSelectedVoice ?? 'onyx');

    const [playingPreview, setPlayingPreview] = useState<string | null>(null);

    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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

    const handleClose = () => {
        stopAudio();
        onClose();
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
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                handleClose();
            }
        }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Select Voice
                    </DialogTitle>
                </DialogHeader>

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
                                onClick={() => setSelectedVoice(voice.id)}
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

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            stopAudio();
                            const selectedVoiceOption = voiceOptions.find(v => v.id === selectedVoice);
                            onSelect(selectedVoice, selectedVoiceOption?.gender || 'male');
                            onClose();
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    >
                        Generate Audio
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 