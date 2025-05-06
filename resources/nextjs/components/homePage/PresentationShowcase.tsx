import React from 'react'
import Wrapper from '../Wrapper'

const IMAGES = Array(4).fill("/Banner.png")

const PresentationShowcase = () => {
    return (
        <div className='bg-[#130000] overflow-hidden'>
            <Wrapper className='flex flex-col lg:flex-row items-center  gap-8 lg:gap-16 py-12'>
                <div className='w-full lg:w-1/2'>
                    <h2 className='text-[28px] sm:text-[32px] md:text-[40px] lg:text-[45px] xl:text-[56px] font-switzer font-[800] leading-[1.2] md:leading-[1.3] lg:leading-[1.4] tracking-[-1.12px] text-white'>
                        Enter Prompt and Select a template to generate presentation
                    </h2>
                    <p className='text-[14px] text-white sm:text-[15px] lg:text-base font-satoshi font-normal leading-[150%] mt-6 text-center lg:text-left'>
                        Et enim cursus tortor felis sagittis felis vel. Ornare tincidunt cursus felis a ut. Gravida ullamcorper accumsan volutpat viverra imperdiet diam dolor. Amet pretium ullamcorper id pulvinar.
                    </p>
                </div>

                <div className='w-full lg:w-1/2 flex gap-4 h-[790px] overflow-hidden'>
                    {/* First Column - Moving Up */}
                    <div className='flex-1 space-y-4 animate-slideUp'>
                        {IMAGES.map((src, index) => (
                            <img
                                key={`up-${index}`}
                                src={src}
                                alt={`Banner ${index + 1}`}
                                className='h-[200px] aspect-video object-cover rounded-lg'
                            />
                        ))}
                        {/* Duplicate set for seamless animation */}
                        {IMAGES.map((src, index) => (
                            <img
                                key={`up-duplicate-${index}`}
                                src={src}
                                alt={`Banner ${index + 1}`}
                                className='h-[200px] aspect-video object-cover rounded-lg'
                            />
                        ))}
                    </div>

                    {/* Second Column - Moving Down */}
                    <div className='flex-1 space-y-4 animate-slideDown'>
                        {IMAGES.map((src, index) => (
                            <img
                                key={`down-${index}`}
                                src={src}
                                alt={`Banner ${index + 1}`}
                                className='h-[200px] aspect-video object-cover rounded-lg'
                            />
                        ))}
                        {/* Duplicate set for seamless animation */}
                        {IMAGES.map((src, index) => (
                            <img
                                key={`down-duplicate-${index}`}
                                src={src}
                                alt={`Banner ${index + 1}`}
                                className='h-[200px] aspect-video object-cover rounded-lg'
                            />
                        ))}
                    </div>
                </div>
            </Wrapper>
        </div>
    )
}

export default PresentationShowcase
