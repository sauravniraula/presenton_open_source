import React from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'

const UploadSection = () => {
    return (
        <div className="w-[95%] max-w-[1060px] z-10 relative mx-auto my-8 sm:my-12 lg:my-16">
            <div className="rounded-[20px] h-[250px] sm:h-[300px] md:h-[500px] lg:h-[712px] 
                bg-[url('/generator/upload_bg.png')] bg-cover bg-center
                transition-transform duration-300 ease-in-out">
                <div className="absolute inset-0 rounded-[20px] transition-all duration-300">
                    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                        {/* Logo Icon */}
                        <div className="mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-2xl flex items-center justify-center">
                                <Upload className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-switzer mb-2 sm:mb-6">
                            Genearate Your Presentation Video
                        </h2>



                        {/* Upload Area */}
                        <div className="w-full max-w-xl px-4 sm:px-6">
                            <a
                                href="/editor"
                                className="w-full bg-white hover:bg-gray-50 text-purple-600 
                                    py-3 sm:py-4 px-4 rounded-full shadow-md hover:shadow-lg 
                                    transition-all duration-200 font-medium flex items-center 
                                    font-switzer justify-center hover:scale-[1.02] active:scale-[0.98]
                                    text-sm sm:text-base"
                            >
                                <Image
                                    src="/generator/ai.svg"
                                    alt="AI"
                                    width={20}
                                    height={20}
                                    className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5"
                                />
                                Generate Video with AI
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadSection
