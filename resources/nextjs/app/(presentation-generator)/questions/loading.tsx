import React from 'react'

const LoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>

                <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="p-6 bg-white shadow-sm rounded-md">
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="space-y-3 mb-6">
                                {[...Array(3)].map((_, oIndex) => (
                                    <div key={oIndex} className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    )
}

export default LoadingSkeleton