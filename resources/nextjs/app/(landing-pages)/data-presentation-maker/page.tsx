import React from 'react'
import { Metadata } from 'next'
import LandingHeader from '../components/LandingHeader'
import Wrapper from '@/components/Wrapper'
import Footer from '@/components/homePage/Footer'
import Link from 'next/link'
import { ChartNoAxesCombined, Palette, SquareLibrary, FileOutput, Layout, Sparkles, Target, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Data Presentation Maker | Professional Presentation Platform | Presenton.ai',
    description: 'Create professional data presentations with ease. Our intuitive presentation maker helps you transform complex data into compelling visual stories.',
    keywords: ['Data Presentation Maker', 'Data Presentation', 'Data Visualization Tool', 'Business Presentation Maker', 'Professional Presentation Tool', 'Presentation AI', 'Data Presentation Maker AI'],
    openGraph: {
        title: 'Data Presentation Maker | Professional Presentation Software',
        description: 'Create professional data presentations with ease. Transform complex data into compelling visual stories.',
        url: 'https://presenton.ai/data-presentation-maker',
        siteName: 'Presenton.ai',
        images: [
            {
                url: 'https://presenton.ai/og-presentation-maker.png',
                width: 1200,
                height: 630,
                alt: 'Data Presentation Maker',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Data Presentation Maker | Professional Presentation Software',
        description: 'Create professional data presentations with ease. Transform complex data into compelling visual stories.',
        images: ['https://presenton.ai/og-presentation-maker.png'],
    },
    alternates: {
        canonical: 'https://presenton.ai/data-presentation-maker',
    }
}

const DataPresentationMaker = () => {
    return (
        <div className="bg-gradient-to-b from-indigo-50 to-white">
            <LandingHeader />
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <Wrapper>
                        <div className="flex flex-col lg:flex-row items-center gap-12 py-24">
                            <div className="lg:w-1/2 space-y-8">
                                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                    Professional Presentation Maker
                                </span>
                                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                    Create Impactful Data <span className="text-indigo-600">Presentations</span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Transform your data into visually stunning presentations that engage and inspire your audience. No design skills needed.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/auth/login"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-200">
                                        Try For Free
                                    </Link>

                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden">
                                    <img
                                        src="/onw.webp"
                                        alt="Presentation Maker Interface"
                                        className="w-full"
                                        width={600}
                                        height={400}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-indigo-200 blur-3xl opacity-30 -z-10"></div>
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* Features Grid */}
                <section className="py-24">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold mb-6">Everything You Need for Perfect Presentations</h2>
                            <p className="text-xl text-gray-600">
                                Powerful features that make creating professional presentations a breeze
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <ChartNoAxesCombined className="w-8 h-8" />,
                                    title: "Different Chart Types",
                                    description: "Choose from a wide variety of charts to visualize your data"
                                },
                                {
                                    icon: <Palette className="w-8 h-8" />,
                                    title: "Highly Customizable",
                                    description: "Customize your presentation as you want, with a wide range of options"
                                },
                                {
                                    icon: <SquareLibrary className="w-8 h-8" />,
                                    title: "High Quality Infographics",
                                    description: "Highlight your data with high quality infographics."
                                },
                                {
                                    icon: <FileOutput className="w-8 h-8" />,
                                    title: "Multiple Exports",
                                    description: "Export to PowerPoint, PDF, or present online"
                                }
                            ].map((feature, index) => (
                                <div key={index}
                                    className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition duration-300">
                                    <div className="text-indigo-600 mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </Wrapper>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-gradient-to-b from-indigo-50 to-white">
                    <Wrapper>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold">Why Choose Our Presentation Maker?</h2>
                                    <p className="text-xl text-gray-600">
                                        Create professional presentations faster and easier than ever before
                                    </p>
                                </div>
                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: <Layout className="w-6 h-6" />,
                                            title: "Professional Templates",
                                            description: "Start with beautiful, ready-to-use templates"
                                        },
                                        {
                                            icon: <Sparkles className="w-6 h-6" />,
                                            title: "Smart Features",
                                            description: "Automated layout suggestions and design assistance"
                                        },
                                        {
                                            icon: <Target className="w-6 h-6" />,
                                            title: "Data-Driven",
                                            description: "Automatically create charts from your data"
                                        },
                                        {
                                            icon: <Zap className="w-6 h-6" />,
                                            title: "Time-Saving",
                                            description: "Create presentations in minutes, not hours"
                                        }
                                    ].map((benefit, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                                <p className="text-gray-600">{benefit.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <img
                                    src="/presentation-features.webp"
                                    alt="Presentation Features"
                                    className="rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-indigo-600 text-white">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold mb-6">
                                Start Creating Professional Presentations Today
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Join thousands of professionals who create better presentations with our tools
                            </p>
                            <Link href="/auth/login"
                                className="inline-block px-8 py-4 text-lg font-semibold bg-white text-indigo-600 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200">
                                Start Free Trial
                            </Link>
                        </div>
                    </Wrapper>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default DataPresentationMaker
