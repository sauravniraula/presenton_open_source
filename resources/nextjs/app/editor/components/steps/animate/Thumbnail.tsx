import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setCurrentSlideIndex } from "@/store/slices/slideSlice";

import Image from "next/image";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export default function Thumbnail() {
    const slides = useSelector((state: RootState) => state.slide.slides);
    const currentSlideIndex = useSelector((state: RootState) => state.slide.currentSlideIndex);
    const dispatch = useDispatch<AppDispatch>();
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);


    useEffect(() => {
         if (slideRefs.current[currentSlideIndex]) {
            slideRefs.current[currentSlideIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentSlideIndex]);

    return <div className="lg:col-span-1">
        <Card className="border-blue-200">
            <CardHeader>
                <CardTitle>Slides</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto hide-scrollbar">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            ref={el => { slideRefs.current[index] = el }}
                            className={`cursor-pointer p-2 rounded-lg transition-all ${index === currentSlideIndex
                                ? 'border-2 border-purple-400 bg-purple-50'
                                : 'border border-gray-200 hover:border-purple-400'
                                }`}
                            onClick={() => dispatch(setCurrentSlideIndex(index))}
                        >
                            {slide.thumbnail ? (
                                <div className="relative w-full aspect-video">
                                    <Image
                                        src={slide.thumbnail}
                                        alt={`Slide ${index + 1}`}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded">
                                    <span className="text-sm text-gray-500">No preview</span>
                                </div>
                            )}
                            <div className="mt-2 text-center text-sm font-medium">
                                Slide {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>;
}