import React from 'react'
import FeatureCard from './FeatureCard'
import Wrapper from '../Wrapper'

const FEATURES = [
    {
        icon: "/SpeechIcon.png",
        title: "Generate Script and Speech",
        description: "Generate script based on the presentation and convert it to audio with our text-to-speech in a click. You may even customize the tone and exact length of the script in minutes. Choose a custom AI voice that meets with your presentation style.",
        altText: "Generate Script"
    },
    {
        icon: "/AnimateIcon.png",
        title: "Animate Shapes",
        description: "Our AI intelligently selects appropriate shapes and texts to animate and highlight for the part of the script. This makes the presentation engaging and helps communicate ideas more effectively.",
        altText: "Animate Shapes"
    },
    {
        icon: "/AvatarIcon.png",
        title: "Add Life-like Avatars",
        description: "Add life-like avatars that make the presentation being given by real humans. This helps user pay more attention, making the presentation seem authentic and engaging.",
        altText: "Add Avatars"
    }
]

const MainFeature = () => {
    return (
        <Wrapper>
            <div className="relative z-10 pt-8  sm:pt-12 lg:pt-16 xl:pt-20">
                <div className="sm:px-6">
                    <h2 className="py-3 sm:py-4 lg:py-6 text-center text-[28px] sm:text-[32px] md:text-[40px] lg:text-[45px] xl:text-[56px] font-switzer font-[800] leading-[1.2] md:leading-[1.3] lg:leading-[1.4] tracking-[-1.12px] text-[#FFF]">
                        Convert your presentation to<br className="hidden sm:block" />
                        engaging video with AI
                    </h2>

                    <p className="w-full max-w-[826px] pb-6 sm:pb-8 lg:pb-10 text-center text-white text-[14px] sm:text-[15px] lg:text-base font-satoshi font-normal leading-[150%] mx-auto px-4">
                        Create presentation video without any effort. Upload your presentation, generate script and audio automatically from your presentation along with animations that syncs with the script.
                    </p>
                </div>

                <div className="relative mx-auto  sm:px-4">
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 lg:gap-8 pb-4 snap-x snap-mandatory hide-scrollbar">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`
                                    flex-shrink-0 w-[80%] sm:w-[85%] md:w-[45%] xl:w-[31%] snap-center
                                    ${index === 0 ? 'ml-2 sm:ml-4' : ''} 
                                    ${index === FEATURES.length - 1 ? 'mr-2 sm:mr-4' : ''}
                                `}
                            >
                                <FeatureCard {...feature} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Wrapper>
    )
}

export default MainFeature
