import Link from 'next/link'
import React from 'react'

const MainIntro = () => {
    return (

        <div className="flex flex-col items-center justify-center text-center pt-10  md:pt-20">
            <h1 className="text-[24px] md:text-[35px] lg:text-[50px] xl:text-[64px] font-switzer font-black leading-[32px] md:leading-[50px] lg:leading-[76px] max-w-[800px]">
                Best Presentation
                <span className="block text-[#5146E5]">Video Generator</span>
            </h1>
            <div className="flex justify-center md:hidden my-3">
                <Link href="/editor" className="mx-auth bg-gradient-to-r from-[#9034EA] to-[#5146E5] text-white font-medium py-1 px-5 rounded-full">
                    Get Started
                </Link>
            </div>
            <p className="text-[#444] text-center font-satoshi text-[12px] md:text-[15px] ld:text-[18px] font-[400] leading-[27px] mt-6 max-w-[327px] sm:max-w-[350px]  md:max-w-[600px]">
                Simply upload your powerpoint presentation and create a very engaging video with AI generated script, audio, animations and life-like avatars. Create a video in 2 mins with your custom presentation.
            </p>
        </div>

    )
}

export default MainIntro
