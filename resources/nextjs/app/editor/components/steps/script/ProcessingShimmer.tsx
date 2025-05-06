import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageIcon, Loader2 } from 'lucide-react'
import React from 'react'

const ProcessingShimmer = () => {
    return (
        <div className="space-y-6">
            {/* Processing Header */}
            <div className="border border-blue-200 rounded-lg animate-pulse">
                <div className="bg-white rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
                            <div className="h-4 w-48 bg-gray-100 rounded-lg"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Preview Area */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden border-blue-200 bg-white shadow-sm">
                        {/* Navigation Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                            <div className="flex gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="aspect-[16/9] bg-gray-100 animate-pulse">
                            <div className="h-full w-full flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Status Card */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-blue-200 bg-gradient-to-b from-white to-gray-50">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
                                <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 animate-pulse">
                                    Processing
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Overall Progress</span>
                                        <span className="font-medium">{Math.round(0)}%</span>
                                    </div>
                                    <Progress
                                        value={0}
                                        className="h-2.5 bg-blue-100"
                                    />
                                </div>

                                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <ImageIcon className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Processed Slides</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ProcessingShimmer
