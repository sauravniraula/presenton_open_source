'use client'
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Repeat, RotateCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { AudioData } from '@/remotion/types/slideTypes'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
    audioData: AudioData;
    script: string;
    onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({ audioData, onPlayStateChange, script }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isMuted, setIsMuted] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100)
            setCurrentTime(audio.currentTime)
        }

        const handleEnded = () => {
            setIsPlaying(false)
            setProgress(0)
            setCurrentTime(0)
            onPlayStateChange?.(false)
        }

        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
        }

        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)

        return () => {
            audio.removeEventListener('timeupdate', updateProgress)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [onPlayStateChange])

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
        onPlayStateChange?.(!isPlaying)
    }

    const handleVolumeChange = (value: number[]) => {
        if (!audioRef.current) return
        const newVolume = value[0]
        setVolume(newVolume)
        audioRef.current.volume = newVolume
        setIsMuted(newVolume === 0)
    }

    const toggleMute = () => {
        if (!audioRef.current) return
        const newMuted = !isMuted
        setIsMuted(newMuted)
        audioRef.current.volume = newMuted ? 0 : volume
    }

    const handleSeek = (value: number[]) => {
        if (!audioRef.current) return
        const newTime = (value[0] / 100) * duration
        audioRef.current.currentTime = newTime
        setProgress(value[0])
        setCurrentTime(newTime)
    }

    const handleReset = () => {
        if (!audioRef.current) return
        audioRef.current.currentTime = 0
        setProgress(0)
        setCurrentTime(0)
        if (!isPlaying) {
            setIsPlaying(false);
        }
        onPlayStateChange?.(false)
    }

    return (
        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <audio ref={audioRef} src={audioData.audio_url} />

            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                    Audio Script:
                </p>
                <p className="text-sm text-gray-600 ">
                    {script}
                </p>
            </div>



            <div className="mt-2">
                <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlay}
                        className={cn(
                            "hover:bg-blue-50 hover:text-blue-600",
                            isPlaying && "text-blue-600"
                        )}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="hover:bg-blue-50 hover:text-blue-600"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="hover:bg-blue-50 hover:text-blue-600"
                    >
                        {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="w-24"
                    />
                </div>
            </div>
        </div>
    )
} 