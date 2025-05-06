'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PresentationGenerationApi } from '../../services/api/presentation-generation'
import { RootState } from '@/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { setStoryResponse } from '@/store/slices/presentationGenUpload'
import { OverlayLoader } from '@/components/ui/overlay-loader'
import { toast } from '@/hooks/use-toast'
import { MixpanelEventName } from '@/utils/mixpanel/enums'
import { sendMpEvent } from '@/utils/mixpanel/services'

interface QuestionResponse {
    question: string
    answer: string
}

const Questionpage = () => {
    const router = useRouter()
    const dispatch = useDispatch();
    const { questions } = useSelector((state: RootState) => state.pptGenUpload);
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAnswers, setSelectedAnswers] = useState<QuestionResponse[]>([])
    const [customInputs, setCustomInputs] = useState<{ [key: string]: string }>({})
    const { presentation_id } = useSelector((state: RootState) => state.presentationGeneration);

    const handleOptionSelect = (question: string, answer: string) => {
        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.questionOptionsSelected, {
            presentation_id: presentation_id!,
            option_for: question,
            option_value: answer,
        });
        const existingIndex = selectedAnswers.findIndex(a => a.question === question)
        if (existingIndex !== -1) {
            const newAnswers = [...selectedAnswers]
            newAnswers[existingIndex] = { question, answer }
            setSelectedAnswers(newAnswers)
        } else {
            setSelectedAnswers([...selectedAnswers, { question, answer }])
        }
    }

    const handleCustomInput = (question: string, value: string) => {
        setCustomInputs({ ...customInputs, [question]: value })
        if (value) {
            handleOptionSelect(question, value)
        }
    }

    const isQuestionAnswered = (question: string) => {
        return selectedAnswers.some(a => a.question === question) || customInputs[question]
    }

    const handleSubmit = async () => {
        try {

            setIsLoading(true)

            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.submittingQuestionAnswers, {
                presentation_id: presentation_id!,
            });
            const submitResponse = await PresentationGenerationApi.submitAnswers(presentation_id!, selectedAnswers)
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.fetchingStory, {
                presentation_id: presentation_id!,
                big_idea: null,
                story_type: null,
            });
            const storyFormatsResponse = await PresentationGenerationApi.getStoryFormats({ presentation_id: presentation_id!, big_idea: null, story_type: null })
            dispatch(setStoryResponse(storyFormatsResponse))
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.navigation, {
                to: '/story-formats',
            });
            router.push('/story-formats');
        } catch (error) {
            //? Mixpanel User Tracking
            sendMpEvent(MixpanelEventName.error, {
                error_message: error instanceof Error ? error.message : 'Unknown error in catch block',
            });
            console.error('Error in submitting answers', error)
            toast({
                title: 'Error',
                description: 'Failed to submit answers. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const allQuestionsAnswered = questions.every((q: any) => isQuestionAnswered(q.question))

    useEffect(() => {
        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.pageOpened, {
            page_name: "Questions Page",
        });
    }, [])

    return (
        <>
            <OverlayLoader show={isLoading} text="Submitting answers..." showProgress={true} duration={10} />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-satoshi font-bold text-gray-900 mb-2">
                            Presentation Questions
                        </h1>
                        <p className="text-gray-600 font-satoshi">
                            Please answer these questions to help us create a better presentation for you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q: any, qIndex: any) => (
                            <Card key={qIndex} className="p-6 bg-white shadow-sm rounded-md">
                                <h2 className="text-xl font-satoshi font-semibold text-gray-900 mb-4">
                                    {qIndex + 1}. {q.question}
                                </h2>

                                <div className="space-y-3 mb-6">
                                    {q.options.map((option: any, oIndex: any) => (
                                        <Button
                                            key={oIndex}
                                            onClick={() => handleOptionSelect(q.question, option)}
                                            className={`w-full py-6 font-satoshi text-left justify-start text-lg transition-all duration-200 ${selectedAnswers.some(
                                                a => a.question === q.question && a.answer === option
                                            )
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            variant="outline"
                                        >
                                            <span className="mr-4 text-gray-400">{oIndex + 1}.</span>
                                            {option}
                                        </Button>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <label className="block font-satoshi text-sm font-medium text-gray-700 mb-2">
                                        Have a different answer in mind? Type it here:
                                    </label>
                                    <input
                                        value={customInputs[q.question] || ''}
                                        onChange={(e) => handleCustomInput(q.question, e.target.value)}
                                        placeholder="Type your custom answer here..."
                                        className="w-full py-3 border border-gray-300 rounded-md indent-4 outline-none"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!allQuestionsAnswered}
                            className={`px-8 py-6 text-lg font-semibold font-switzer rounded-xl transition-all duration-200 ${allQuestionsAnswered
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Generate Presentation
                        </Button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Questionpage
