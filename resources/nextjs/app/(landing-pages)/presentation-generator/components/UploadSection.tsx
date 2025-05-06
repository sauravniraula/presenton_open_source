'use client'

import React from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'


const UploadSection = () => {

  return (
    <div
      className={`
        max-w-[1060px] w-[95%] z-10 relative mx-auto rounded-[20px] h-[500px] md:h-[712px] 
        bg-[url("/generator/upload_bg.png")] bg-cover bg-center
        transition-transform duration-300 ease-in-out
       
      `}
    >
      <div
        className={`
          absolute inset-0 rounded-[20px] 
          transition-all duration-300 ease-in-out
         
        `}

      >
        <div className="h-full flex flex-col items-center justify-center p-8">


          {/* Updated Title */}
          <h2 className={`
             text-3xl md:text-4xl lg:text-5xl font-bold text-white font-switzer mb-4
            transition-all duration-300 leading-[60px]
          `}>
            Upload Your Files
            <br />
            We'll Do the Rest!
          </h2>



          <p className='text-white/80 font-normal text-md lg:text-lg font-satoshi mb-8 text-center max-w-md'>
            Our AI instantly analyzes your content, extracts key insights, and creates
            stunning presentations with professional charts and visuals
          </p>

          {/* Upload Area */}
          <div className="w-full text-sm md:text-base max-w-xl ">
            <a
              href='/auth/login'
              className="w-full bg-white hover:bg-gray-50 text-purple-600 py-4 rounded-full
                shadow-md hover:shadow-lg transition-all duration-200 font-medium 
                flex items-center font-switzer justify-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src="/generator/ai.svg"
                alt="AI icon"
                width={20}
                height={20}
                className="mr-3"
              />
              Create Your AI Presentation Now
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

export default UploadSection
