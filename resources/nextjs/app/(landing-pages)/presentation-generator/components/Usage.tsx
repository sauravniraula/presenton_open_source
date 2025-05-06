import React from 'react'
import UsageCard from './UsageCard'
import Wrapper from '@/components/Wrapper';
const UsageData = [
    {
        title: "For Business",
        description: "Presenton.ai turns quarterly reports, sales performance, and market trends into clear, concise, and visually engaging presentations. Impress stakeholders with data that speaks volumes, backed by polished slides that are ready to present at a moment’s notice.",
        icon: "/generator/report-to-presentation.svg"
    },
    {
        title: "For Education",
        description: "Whether breaking down intricate formulas, explaining historical events, or visualizing scientific concepts, Presenton.ai helps educators create engaging lessons that captivate students and boost understanding",
        icon: "/generator/survey.svg"
    },
    {
        title: "For Creators",
        description: "From pitching innovative ideas to showcasing personal projects, Presenton.ai empowers creators to share their vision in a way that captivates audiences. Design beautiful, interactive presentations that make your ideas unforgettable—no technical skills required",
        icon: "/generator/f-pdf.svg"
    },
    {
        title: "For Everyone",
        description: "Whether you’re a project manager, consultant, researcher, or student, Presenton.ai is the partner you need to take your presentations to the next level. Seamlessly blend professionalism, creativity, and clarity for results that make an impact",
        icon: "/generator/crm.svg"
    }
]

const Usage = () => {
    return (
        <div className='relative'>

            <img src="/generator/curve.svg" alt="generator background curve" className='hidden z-[-1] lg:block absolute top-0 -left-20 xl:-left-10' />
            <Wrapper className=' py-10 md:py-20  '>
                <div className='pb-10 md:pb-20'>

                    <h3 className='text-2xl md:text-[36px] lg:text-[56px] w-[70%] mx-auto font-switzer font-extrabold leading-[30px] md:leading-normal lg:leading-[64px] text-center'>Made For Every Use Case

                    </h3>
                    <p className='text-center  text-[#444] font-satoshi text-[12px] md:text-base lg:text-lg font-[400] leading-[20px] md:leading-[27px] mt-4  mx-auto'>Whether you’re a business professional, educator, or student, Presenton.ai is your ultimate presentation partner.</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6'>
                    {
                        UsageData.map((item, index) => (
                            <UsageCard key={index} title={item.title} description={item.description} icon={item.icon} />
                        ))
                    }
                </div>
            </Wrapper>
        </div>
    )
}

export default Usage
