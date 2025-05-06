import React from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

interface TestimonialCardProps {
    name: string;
    position: string;
    comment: string;
    image: string;
}

const TestimonialCard = ({ name, position, comment, image }: TestimonialCardProps) => {
    return (
        <div className="bg-white rounded-[20px] p-6 lg:p-8  gap-6">
            <div className="">
                <img
                    src={image}
                    alt={`${name} testimonial`}
                    className="rounded-full h-20 w-20 object-cover mx-auto"
                />
                <div className='text-center pt-3 pb-2'>
                    <h4 className="font-switzer font-bold text-base lg:text-xl">{name}</h4>
                    <p className="text-gray-600 text-xs md:text-sm font-satoshi py-1 ">{position}</p>
                </div>
            </div>
            <div className="flex gap-1 justify-center pt-1 pb-3">
                {[...Array(5)].map((_, index) => (
                    <Star key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
            </div>
            <p className="text-gray-700 font-satoshi font-normal text-sm sm:text-base md:text-lg lg:text-base lg:max-w-[80%] mx-auto text-center leading-relaxed">{comment}</p>
        </div>
    )
}

export default TestimonialCard 