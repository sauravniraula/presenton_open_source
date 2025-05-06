'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { useRouter } from 'next/navigation'
import anime from 'animejs'
import { RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"
import { setStoryResponse } from "@/store/slices/presentationGenUpload"
import { PresentationGenerationApi } from "../../services/api/presentation-generation"
import { OverlayLoader } from "@/components/ui/overlay-loader"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { setTitles } from "@/store/slices/presentationGeneration"
import { setPresentationId } from "@/store/slices/presentationGeneration"
import { toast } from "@/hooks/use-toast"
import { MixpanelEventName } from "@/utils/mixpanel/enums"
import { sendMpEvent } from "@/utils/mixpanel/services"

interface StoryFormat {
    id: string
    title: string
    useCase: string
    bestFor: string

}

const StoryTypes: StoryFormat[] = [
    {
        id: 'heros_journey',
        title: "The Hero's Journey (Data Edition)",
        useCase: "Showing how data led to a transformation",
        bestFor: "Data insights that lead to big changes",

    },
    {
        id: 'before_after_bridge',
        title: "Before-After-Bridge (Data-Driven Change Story)",
        useCase: "Showing how data led to a solution",
        bestFor: "Case studies, business transformation stories",

    },
    {
        id: 'pixar_formula',
        title: "The Pixar Formula (Storytelling with Trends & Insights)",
        useCase: "Presenting a data trend with a human angle",
        bestFor: "Trends, industry reports, insights presentations",

    },
    {
        id: 'problem_agitate',
        title: "Problem-Agitate-Solution (Data-Backed Persuasion)",
        useCase: "Presenting a data-backed problem and solution",
        bestFor: "Persuasive presentations, sales decks, pitching data-backed solutions",

    },

    {
        id: 'failure_redemption',
        title: "The Failure-Redemption Story (Learning from Data Mistakes)",
        useCase: "Showing how data helped correct a mistake",
        bestFor: "Lessons learned, growth case studies",

    },
    {
        id: 'mystery_reveal',
        title: "The Mystery-Reveal Format (Surprising Data Story)",
        useCase: "Starting with a counterintuitive data point to hook the audience",
        bestFor: "Social media, keynote presentations, thought leadership",

    },
    {
        id: 'one_big_idea',
        title: "The One Big Idea (Data-Driven Thought Leadership)",
        useCase: "Making a bold statement backed by data",
        bestFor: "TED-style talks, industry whitepapers, executive insights",

    }
]

const StoryFormatPage = () => {
    const { storyResponse } = useSelector((state: RootState) => state.pptGenUpload);

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState<any>(storyResponse.story_type)
    const { presentation_id } = useSelector((state: RootState) => state.presentationGeneration);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.pageOpened, {
            page_name: "Story Page",
        });
        if (storyResponse.story_type) {
            const storyType = document.getElementById(storyResponse.story_type)
            if (storyType) {
                storyType.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [storyResponse])
    const handleFormatSelect = async (format_id: string) => {
        try {

            setIsLoading(true)
            setSelectedFormat(format_id)
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.fetchingStory, {
                presentation_id: presentation_id!,
                big_idea: storyResponse.big_idea,
                story_type: format_id,
            });
            const response = await PresentationGenerationApi.getStoryFormats({ presentation_id: presentation_id!, big_idea: storyResponse.big_idea, story_type: format_id })
            dispatch(setStoryResponse(response))
            setIsLoading(false)
            // Smooth scroll to details
            if (format_id) {
                const detailsSection = document.getElementById('format-details')
                if (detailsSection) {
                    detailsSection.scrollIntoView({ behavior: 'smooth' })
                }
            }
        } catch (error) {
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.error, {
                error_message: error instanceof Error ? error.message : 'Unknown error in selecting format',
            });
            console.error('Error in selecting format', error)
            toast({
                title: 'Error',
                description: 'Failed to select format. Please try again.',
                variant: 'destructive',
            })
        }
    }
    const handleContinue = async () => {
        try {
            setLoading(true)
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.generatingTitles, {
                presentation_id: presentation_id!,
            });
            const titleData = await PresentationGenerationApi.titleGeneration({

                presentation_id: presentation_id ?? ""
            });

            dispatch(setPresentationId(titleData.id)); // Update Redux store with presentation ID
            dispatch(setTitles(titleData.titles)); // Update Redux store with titles
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.navigation, {
                to: '/theme',
            });
            router.push('/theme')

        } catch (error) {
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.error, {
                error_message: error instanceof Error ? error.message : 'Unknown error in continuing to create',
            });
            setLoading(false)
            console.error('Error in continuing to create', error)
            toast({
                title: 'Error',
                description: 'Failed to continue to create. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }

    }


    // Add these scroll handler functions before the return statement
    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -340, // Width of card + gap
                behavior: 'smooth'
            });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 340, // Width of card + gap
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#FAFAFA] font-satoshi">
                {/* Big Idea Section */}
                <div className="bg-white border-b">
                    <div className="max-w-[1440px] mx-auto px-8 py-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Story Formats</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Choose a storytelling format that best fits your presentation narrative.
                        </p>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8">
                            <h2 className="text-xl font-semibold text-blue-900 mb-3">Big Idea</h2>
                            <p className="text-blue-700 text-lg">
                                {storyResponse.big_idea}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Story Types Section */}
                <div className="max-w-[1440px] mx-auto px-8 py-12">
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Format</h3>
                        <p className="text-gray-600">Select a storytelling format to see how it will structure your presentation.</p>
                    </div>

                    {/* Horizontally Scrollable Story Types */}
                    <div className="relative my-2 px-4">
                        <div ref={scrollContainerRef} className="overflow-x-auto flex gap-4 hide-scrollbar p-2 px-4  ">
                            {StoryTypes.map((format) => (
                                <Card
                                    id={format.id}
                                    key={format.id}
                                    className={`flex-shrink-0 w-[320px] p-6 cursor-pointer transition-all duration-300 hover:shadow-lg
                                        ${format.id === selectedFormat
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'}`}
                                    onClick={() => handleFormatSelect(format.id)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {format.title.split('(')[0].trim()}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-blue-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Use Case</p>
                                                <p className="text-sm text-gray-600">{format.useCase}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-green-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Best For</p>
                                                <p className="text-sm text-gray-600">{format.bestFor}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                            ))}

                        </div>
                        {/* left arrow */}
                        <div className="absolute left-1 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent flex items-center justify-center">
                            <button onClick={handleScrollLeft} className="bg-white rounded-full p-2 shadow-lg cursor-pointer">

                                <ArrowLeft className="text-gray-500" />
                            </button>
                        </div>
                        {/* right arrow */}
                        <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent flex items-center justify-center">
                            <button onClick={handleScrollRight} className="bg-white rounded-full p-2 shadow-lg cursor-pointer">
                                <ArrowRight className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Selected Format Details */}
                    {selectedFormat && (
                        <div id="format-details" className={`mt-12 relative ${isLoading ? "opacity-70" : ""}`}>
                            {isLoading && <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center">
                                <Loader2 className="animate-spin text-blue-500" />
                            </div>}
                            <Card className="bg-white p-8 border-0 shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                                    {selectedFormat.title}
                                </h3>
                                {
                                    storyResponse.story.map((format: any, index: number) => (
                                        <div key={index} className="grid grid-cols-1 gap-8 my-4">
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                                                    <h4 className="text-lg font-semibold text-blue-900 mb-3">{format.name}</h4>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {format.content}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        disabled={loading}
                                        onClick={handleContinue}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl font-switzer transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Creating..." : "Continue with this Format"}
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default StoryFormatPage
