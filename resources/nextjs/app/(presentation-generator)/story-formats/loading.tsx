import React from 'react'

const StoryFormatLoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Big Idea Section */}
            <div className="bg-white border-b">
                <div className="max-w-[1440px] mx-auto px-8 py-12">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mt-8">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            {/* Story Types Section */}
            <div className="max-w-[1440px] mx-auto px-8 py-12">
                <div className="mb-8">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                {/* Horizontally Scrollable Story Types */}
                <div className="relative my-2 px-4">
                    <div className="overflow-x-auto flex gap-4 hide-scrollbar p-2 px-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-[320px] p-6 bg-white shadow-sm rounded-md">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Format Details */}
                <div className="mt-12">
                    <div className="bg-white p-8 border-0 shadow-sm">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        {[...Array(2)].map((_, index) => (
                            <div key={index} className="grid grid-cols-1 gap-8 my-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 flex justify-end">
                            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StoryFormatLoadingSkeleton
