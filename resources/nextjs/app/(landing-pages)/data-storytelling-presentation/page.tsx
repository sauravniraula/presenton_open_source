import React from 'react'
import { Metadata } from 'next'
import LandingHeader from '../components/LandingHeader'
import Wrapper from '@/components/Wrapper'
import Footer from '@/components/homePage/Footer'
import Link from 'next/link'
import { BookOpen, LineChart, Brain, Presentation, MessageSquare, Share2, Lightbulb, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Data Storytelling Presentation | Turn Data into Stories | Presenton.ai',
    description: 'Transform your data into compelling stories that captivate your audience. Our AI-powered tool helps you create narrative-driven presentations that engage and inspire.',
    keywords: ['Data Storytelling', 'Story Presentation', 'Data Narrative', 'Business Storytelling', 'Data Visualization', 'Presentation Stories', 'Data Communication'],
    openGraph: {
        title: 'Data Storytelling Presentation | Turn Data into Stories',
        description: 'Transform your data into compelling stories that captivate your audience. Create narrative-driven presentations that engage and inspire.',
        url: 'https://presenton.ai/data-storytelling-presentation',
        siteName: 'Presenton.ai',
        images: [
            {
                url: 'https://presenton.ai/og-storytelling.png',
                width: 1200,
                height: 630,
                alt: 'Data Storytelling Presentation',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Data Storytelling Presentation | Turn Data into Stories',
        description: 'Transform your data into compelling stories that captivate your audience. Create narrative-driven presentations that engage and inspire.',
        images: ['https://presenton.ai/og-storytelling.png'],
    },
    alternates: {
        canonical: 'https://presenton.ai/data-storytelling-presentation',
    }
}

const DataStorytellingPresentation = () => {
    return (
        <div className="bg-gradient-to-b from-emerald-50 to-white">
            <LandingHeader />
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <Wrapper>
                        <div className="flex flex-col lg:flex-row items-center gap-12 py-24">
                            <div className="lg:w-1/2 space-y-8">
                                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                    Data Storytelling Platform
                                </span>
                                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                    Turn Your Data into <span className="text-emerald-600">Compelling Stories</span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Create presentations that don't just show data – they tell stories that inspire action. Transform complex information into memorable narratives.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/create-story"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition duration-200">
                                        Start Your Story
                                    </Link>
                                    <Link href="/story-examples"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 transition duration-200">
                                        View Examples
                                    </Link>
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden">
                                    <img
                                        src="/storytelling-hero.webp"
                                        alt="Data Storytelling Example"
                                        className="w-full"
                                        width={600}
                                        height={400}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-emerald-200 blur-3xl opacity-30 -z-10"></div>
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* Story Elements Section */}
                <section className="py-24">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold mb-6">Essential Elements of Data Storytelling</h2>
                            <p className="text-xl text-gray-600">
                                Combine powerful storytelling techniques with data visualization to create impactful presentations
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <BookOpen className="w-8 h-8" />,
                                    title: "Narrative Structure",
                                    description: "Build a compelling story arc that guides your audience through the data"
                                },
                                {
                                    icon: <LineChart className="w-8 h-8" />,
                                    title: "Visual Impact",
                                    description: "Transform data into clear, memorable visualizations"
                                },
                                {
                                    icon: <Brain className="w-8 h-8" />,
                                    title: "Emotional Connection",
                                    description: "Create resonance with your audience through storytelling"
                                },
                                {
                                    icon: <Presentation className="w-8 h-8" />,
                                    title: "Clear Message",
                                    description: "Deliver insights that drive action and decision-making"
                                }
                            ].map((element, index) => (
                                <div key={index}
                                    className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition duration-300">
                                    <div className="text-emerald-600 mb-4">{element.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3">{element.title}</h3>
                                    <p className="text-gray-600">{element.description}</p>
                                </div>
                            ))}
                        </div>
                    </Wrapper>
                </section>

                {/* Storytelling Process */}
                <section className="py-24 bg-gradient-to-b from-emerald-50 to-white">
                    <Wrapper>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold">The Art of Data Storytelling</h2>
                                    <p className="text-xl text-gray-600">
                                        Our platform helps you master the four key aspects of data storytelling
                                    </p>
                                </div>
                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: <MessageSquare className="w-6 h-6" />,
                                            title: "Find Your Narrative",
                                            description: "Identify the key story in your data"
                                        },
                                        {
                                            icon: <Share2 className="w-6 h-6" />,
                                            title: "Connect with Audience",
                                            description: "Create emotional connections through storytelling"
                                        },
                                        {
                                            icon: <Lightbulb className="w-6 h-6" />,
                                            title: "Drive Insights",
                                            description: "Transform data into actionable insights"
                                        },
                                        {
                                            icon: <ArrowRight className="w-6 h-6" />,
                                            title: "Inspire Action",
                                            description: "Motivate your audience to take action"
                                        }
                                    ].map((process, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                {process.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">{process.title}</h3>
                                                <p className="text-gray-600">{process.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <img
                                    src="/storytelling-process.webp"
                                    alt="Data Storytelling Process"
                                    className="rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-emerald-600 text-white">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold mb-6">
                                Start Telling Better Data Stories Today
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Join thousands of storytellers who create impactful presentations that move audiences to action
                            </p>
                            <Link href="/signup"
                                className="inline-block px-8 py-4 text-lg font-semibold bg-white text-emerald-600 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200">
                                Begin Your Story
                            </Link>
                        </div>
                    </Wrapper>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default DataStorytellingPresentation
