'use client'
import React, { useState, useEffect } from 'react'
import TestimonialCard from './TestimonialCard'
import Wrapper from '@/components/Wrapper'

const testimonials = [
    {
        name: "Raym Tabone",
        position: "Project Manager - Saimon Consulting Ltd.",
        comment: "The AI presentation generator has completely transformed how I handle client reports. What used to take hours of reformatting and visualization now takes minutes. It's particularly impressive how it captures key insights from our analytics reports and turns them into compelling slides. This tool has become indispensable for our weekly executive updates.",
        image: "/generator/person-1.jpeg"
    },
    {
        name: "Shairah Davidson",
        position: "Research Consulting - Kinu Tech Pvt. Ltd.",
        comment: "Finally, a tool that understands how to translate dense consultant reports into executive-ready presentations. It maintains the strategic narrative while making the data more digestible. I've cut my presentation prep time by 70%, and our clients consistently praise how clear and impactful our deliverables have become.",
        image: "/generator/person-2.jpeg"
    },

]

const Testimonial = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 2))
            }, 5000)
        }
        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const handleDotClick = (index: number) => {
        setCurrentSlide(index)
        setIsAutoPlaying(false)
    }

    return (
        <div className="py-14 lg:py-20 bg-black">
            <h3 className='text-center  text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-switzer font-extrabold mb-10 sm:mb-12 md:mb-16'>
                Trusted by <span className='text-[#5141e5]'>Leaders</span> ,<br /> Loved by <span className='text-[#5141e5]'>Professionals</span>
            </h3>

            <Wrapper className="">
                <div className="relative">
                    {/* Carousel container */}
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {/* Group testimonials in pairs */}
                            {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, groupIndex) => (
                                <div key={groupIndex} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {testimonials.slice(groupIndex * 2, groupIndex * 2 + 2).map((testimonial, index) => (
                                        <div key={index} >
                                            <TestimonialCard {...testimonial} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carousel dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={` rounded-full transition-all duration-300 ${currentSlide === index
                                    ? 'w-8 bg-[#5141e5]'
                                    : 'bg-white w-2 h-2'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </Wrapper>
        </div>
    )
}

export default Testimonial  