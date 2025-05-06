import React from 'react'
import FeatureExplain from './FeatureExplain'
import UploadSection from './UploadSection'

const Hero = () => {
    return (
        <div className='relative'>
            <img src="/rounded-box.svg" alt="curved box" className='hidden lg:block absolute -top-10 2xl:-top-16 left-0 w-full  object-top  md:h-[1750px] 2xl:h-[2000px]  ' />
            <img src="/rounded-box-mobile.svg" alt="rounded-box" className="absolute lg:hidden h-[780px] sm:h-[1100px] md:h-[1150px] left-0 w-full " />
            <div className='relative z-10 shadow-xl border rounded-sm  max-w-[1060px] w-[90%] h-[200px] sm:h-[400px] md:h-[450px] lg:h-[600px] mx-auto bg-blue-100'>
                <video src="/generator/intro.mp4" autoPlay loop muted playsInline className='w-full h-full object-cover' />
            </div>
            <FeatureExplain />
            <UploadSection />
        </div>
    )
}

export default Hero
