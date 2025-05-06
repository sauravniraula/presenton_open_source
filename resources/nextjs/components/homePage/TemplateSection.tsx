'use client'
import React from 'react'
import Wrapper from '../Wrapper'
import { Button } from '../ui/button'
import TemplateCarousel from './TemplateCarousel'

const TemplateSection = () => {
    return (
        <Wrapper className="py-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h3 className="text-[24px] md:text-[35px] lg:text-[50px] xl:text-[64px] font-switzer font-black leading-[32px] md:leading-[50px] lg:leading-[76px] max-w-[800px] pb-4">
                    Transform Your Data into Stunning Presentations with AI
                </h3>
                <p className="text-[14px] sm:text-[15px] lg:text-base font-satoshi font-normal leading-[150%] mx-auto">

                    Choose from our diverse collection of professionally designed templates,
                    each crafted to showcase your data in the most compelling way.
                    Let AI help you create impactful presentations in minutes.
                </p>
            </div>
            <div className="text-center my-12">
                <a href="/presentation-generator" className="px-8 py-4 text-white font-bold font-switzer rounded-[32px] bg-gradient-to-r from-[#9034EA] to-[#5146E5]">
                    Generate Presentation
                </a>
            </div>

            {/* <TemplateCarousel /> */}


        </Wrapper>
    )
}

export default TemplateSection