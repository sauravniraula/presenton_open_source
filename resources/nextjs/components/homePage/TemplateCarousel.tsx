import React from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Card, CardContent } from "../ui/card";

interface Slide {
    id: number;
    image: string;
    title: string;
    category: string;
}

const TemplateCarousel: React.FC = () => {
    const slides: Slide[] = [
        {
            id: 1,
            image: "https://picsum.photos/seed/template1/800/600",
            title: "Minimalist Aesthetic CV",
            category: "Professional"
        },
        {
            id: 2,
            image: "https://picsum.photos/seed/template2/800/600",
            title: "Steps for Studying",
            category: "Education"
        },
        {
            id: 3,
            image: "https://picsum.photos/seed/template3/800/600",
            title: "Meet Our Professors",
            category: "Education"
        },

    ];

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full max-w-6xl mx-auto"
        >
            <CarouselContent>
                {slides.map((slide) => (
                    <CarouselItem key={slide.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                        <div className="p-1">
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="flex flex-col p-0 overflow-hidden rounded-lg">
                                    <div className="relative w-full aspect-[16/9]">
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="p-4 bg-white">
                                        <p className="text-sm text-gray-500 mb-1">{slide.category}</p>
                                        <h3 className="text-lg font-semibold text-gray-900">{slide.title}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
        </Carousel>
    );
};

export default TemplateCarousel;
