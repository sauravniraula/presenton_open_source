import React from 'react'
import { Metadata } from 'next'
import LandingHeader from '../components/LandingHeader'
import Wrapper from '@/components/Wrapper'
import Footer from '@/components/homePage/Footer'
import Link from 'next/link'
import { BarChart2, Clock, Award, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
    title: 'AI-Powered Data Presentation Tool | Create Professional Presentations | Presenton.ai',
    description: 'Transform your data into stunning presentations with our AI-powered tool. Create professional, engaging presentations in minutes. Features smart data analysis, beautiful charts, and automated insights.',
    keywords: ['AI Data Presentation', 'Data Visualization Tool', 'Automated Presentation Maker', 'Business Intelligence Presentations', 'Data Storytelling Software', 'AI Presentation Generator', 'Professional Presentation Tool'],
    openGraph: {
        title: 'AI-Powered Data Presentation Tool | Presenton.ai',
        description: 'Transform complex data into stunning presentations automatically. Save hours of work with our AI-powered presentation tool.',
        url: 'https://presenton.ai/ai-data-presentation',
        siteName: 'Presenton.ai',
        images: [
            {
                url: 'https://presenton.ai/og-ai-presentation.png',
                width: 1200,
                height: 630,
                alt: 'AI Data Presentation Tool',
            },
        ],
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI-Powered Data Presentation Tool | Presenton.ai',
        description: 'Transform complex data into stunning presentations automatically. Save hours of work with our AI-powered presentation tool.',
        images: ['https://presenton.ai/og-ai-presentation.png'],
    },
    alternates: {
        canonical: 'https://presenton.ai/ai-data-presentation',
    }
}

const Page = () => {
    return (
        <div className="bg-gradient-to-b from-slate-50 to-white">
            <LandingHeader />
            <main>
                {/* Hero Section with Animation */}
                <section className="relative overflow-hidden">
                    <Wrapper>
                        <div className="flex flex-col lg:flex-row items-center gap-12 py-24">
                            <div className="lg:w-1/2 space-y-8">
                                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    AI-Powered Presentations
                                </span>
                                <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Create Stunning Data Stories with AI
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Transform your raw data into compelling presentations in minutes. Our AI analyzes your data, creates beautiful visualizations, and generates insights automatically.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/signup"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200">
                                        Start Free Trial
                                    </Link>
                                    <Link href="/demo"
                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition duration-200">
                                        Watch Demo
                                    </Link>
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden">
                                    <img
                                        src="/ai-presentation-hero.webp"
                                        alt="AI Presentation Demo"
                                        className="w-full"
                                        width={600}
                                        height={400}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 blur-3xl opacity-30 -z-10"></div>
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* Social Proof Section */}
                <section className="py-12 bg-gray-50">
                    <Wrapper>
                        <div className="text-center space-y-6">
                            <p className="text-gray-600">Trusted by 10,000+ professionals from</p>
                            <div className="flex justify-center items-center gap-12 grayscale opacity-60">
                                {/* Add company logos here */}
                            </div>
                        </div>
                    </Wrapper>
                </section>

                {/* Features Section */}
                <section className="py-24">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold mb-6">
                                Transform Your Data Presentation Process
                            </h2>
                            <p className="text-xl text-gray-600">
                                Our AI-powered platform streamlines your workflow and helps you create professional presentations in minutes, not hours.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <BarChart2 className="w-8 h-8" />,
                                    title: "Smart Data Analysis",
                                    description: "AI automatically identifies trends and insights from your data"
                                },
                                {
                                    icon: <Clock className="w-8 h-8" />,
                                    title: "Save 80% Time",
                                    description: "Create presentations in minutes instead of hours"
                                },
                                {
                                    icon: <Award className="w-8 h-8" />,
                                    title: "Professional Design",
                                    description: "Beautiful templates and automatic styling"
                                },
                                {
                                    icon: <TrendingUp className="w-8 h-8" />,
                                    title: "Dynamic Charts",
                                    description: "Interactive visualizations that bring data to life"
                                }
                            ].map((feature, index) => (
                                <div key={index}
                                    className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition duration-300">
                                    <div className="text-purple-600 mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </Wrapper>
                </section>

                {/* How It Works Section */}
                <section className="py-24 bg-gradient-to-b from-purple-50 to-white">
                    <Wrapper>
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="text-4xl font-bold mb-6">How It Works</h2>
                            <p className="text-xl text-gray-600">
                                Three simple steps to transform your data into compelling presentations
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    step: "01",
                                    title: "Upload Your Data",
                                    description: "Import data from Excel, CSV, or connect your data source directly"
                                },
                                {
                                    step: "02",
                                    title: "AI Analysis",
                                    description: "Our AI analyzes your data and suggests the best visualizations"
                                },
                                {
                                    step: "03",
                                    title: "Customize & Present",
                                    description: "Fine-tune your presentation and share it with your audience"
                                }
                            ].map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="text-7xl font-bold text-purple-100 absolute -top-8 -left-4">
                                        {item.step}
                                    </div>
                                    <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg">
                                        <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Wrapper>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <Wrapper>
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold mb-6">
                                Start Creating Amazing Presentations Today
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Join thousands of professionals who are saving time and creating better presentations with AI
                            </p>
                            <Link href="/signup"
                                className="inline-block px-8 py-4 text-lg font-semibold bg-white text-purple-600 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200">
                                Get Started for Free
                            </Link>
                        </div>
                    </Wrapper>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default Page
