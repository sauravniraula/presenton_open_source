import React from 'react'
import Image from 'next/image'

const UsageCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => {
    return (
        <div className='bg-black rounded-xl p-6 flex flex-col justify-between gap-2 lg:gap-4 xl:gap-6'>
            <div className='bg-[#5146e5] w-20 h-20 rounded-lg flex items-center justify-center mb-10'>
                <Image
                    src={icon}
                    alt={`${title} icon`}
                    width={40}
                    height={40}
                />
            </div>
            <div className='space-y-3'>
                <h3 className='text-white text-2xl font-bold font-switzer'>{title}</h3>
                <p className='text-white    text-sm font-normal font-satoshi leading-relaxed'>{description}</p>
            </div>
        </div>
    )
}

export default UsageCard    