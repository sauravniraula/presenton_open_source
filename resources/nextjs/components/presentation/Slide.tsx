import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit } from 'lucide-react'
import { SlideData } from '@/types/presentation'

interface SlideProps {
    slide: SlideData;
    index: number;
    slidePrompt: string;
    isUpdating: boolean;
    onPromptChange: (value: string) => void;
    onUpdate: () => void;
}

export const Slide = memo(({
    slide,
    index,
    slidePrompt,
    isUpdating,
    onPromptChange,
    onUpdate
}: SlideProps) => (
    <Card className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Slide {index + 1}</h3>
        </div>

        <div className="aspect-[16/9]">
            <img
                src={slide.thumbnail}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain bg-gray-50"
                key={slide.thumbnail}
            />
        </div>

        <div className="p-4 bg-white border-t">
            <div className="space-y-3">
                <div className="flex gap-3">
                    <Textarea
                        placeholder="Enter your changes for this slide..."
                        value={slidePrompt || ''}
                        onChange={(e) => onPromptChange(e.target.value)}
                        className="resize-none h-[42px] text-sm flex-grow"
                    />
                    <Button
                        className="shrink-0 self-start"
                        onClick={onUpdate}
                        disabled={isUpdating || !slidePrompt}
                    >
                        {isUpdating ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin">⚡</div>
                                <span>Updating</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                <span>Update</span>
                            </div>
                        )}
                    </Button>
                </div>
                {slidePrompt && (
                    <p className="text-xs text-gray-500">
                        Your changes will update this slide's content and design
                    </p>
                )}
            </div>
        </div>
    </Card>
));

Slide.displayName = 'Slide'; 