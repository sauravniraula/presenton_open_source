'use client'
import React, { useState } from 'react'
import Wrapper from '@/components/Wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import anime from 'animejs'
import Footer from '@/components/homePage/Footer'
import { supabase } from '@/utils/supabase/client'


const ContactPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Animate the submit button
        anime({
            targets: '#submit-button',
            scale: [1, 0.95, 1],
            duration: 400,
            easing: 'easeInOutQuad'
        })

        try {
            // Add Supabase insert
            const { error } = await supabase
                .from('contacts')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        subject: formData.subject,
                        message: formData.message
                    }
                ])

            if (error) throw error;

            toast({
                title: "Message sent successfully!",
                description: "We'll get back to you soon.",
            })

            // Clear form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            })
        } catch (error) {
            toast({
                title: "Error sending message",
                description: "Please try again later.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const contactInfo = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email",
            value: "suraj@presenton.ai",
            link: "mailto:suraj@presenton.ai"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Address",
            value: "Kathmandu, Nepal",
            link: "https://www.google.com/maps/place/Kathmandu+44600/@27.7089543,85.284933,12539m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39eb198a307baabf:0xb5137c1bf18db1ea!8m2!3d27.7103145!4d85.3221634!16zL20vMDRjeDU?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E9E8F8] to-white pt-16">
            <Wrapper className="pb-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9034EA] to-[#5146E5] text-transparent bg-clip-text">
                            Get in Touch
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Have questions about our services? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="space-y-6">
                            {contactInfo.map((info, index) => (
                                <a
                                    key={index}
                                    href={info.link}
                                    target={info.title === 'Address' ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-[#5146E5]">
                                            {info.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{info.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{info.value}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <Input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <Input
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <Textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full min-h-[150px]"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button
                                        id="submit-button"
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r font-bold font-switzer from-[#9034EA] to-[#5146E5] text-white py-6 rounded-xl hover:opacity-90 transition-all duration-300"
                                    >
                                        {isSubmitting ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>


                </div>
            </Wrapper>
            <Footer />
        </div>
    )
}

export default ContactPage
