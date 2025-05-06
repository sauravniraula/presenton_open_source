import React from 'react'
import Image from 'next/image'

interface FeatureCardProps {
    icon: string
    title: string
    description: string
    altText: string
}

const FeatureCard = ({ icon, title, description, altText }: FeatureCardProps) => {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg space-y-4 sm:space-y-5 lg:space-y-6 h-full">
            <div className="w-full h-[60px] sm:h-[72px] lg:h-[96px] rounded-lg flex items-center justify-center">
                <Image
                    src={icon}
                    alt={altText}
                    width={96}
                    height={96}
                    className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] lg:w-[96px] lg:h-[96px]"
                />
            </div>
            <h3 className="text-center font-switzer font-bold text-[16px] sm:text-[18px] lg:text-[24px]">
                {title}
            </h3>
            <p className="text-[#444] text-center font-satoshi text-[13px] sm:text-[14px] lg:text-[16px] font-[400] leading-[1.5]">
                {description}
            </p>
        </div>
    )
}

export default FeatureCard 