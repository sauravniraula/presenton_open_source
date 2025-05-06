'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/utils/supabase/client'
import { Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from('contacts')
                .insert([
                    {
                        email,
                        subject: 'Newsletter Subscription',
                        name: 'Newsletter Subscriber',
                        message: 'New newsletter subscription request'
                    }
                ])

            if (error) throw error

            toast({
                title: "Subscribed successfully!",
                description: "Thank you for subscribing to our newsletter.",
            })
            setEmail('')
        } catch (error) {
            toast({
                title: "Subscription failed",
                description: "Please try again later.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mt-16 pt-16">
            <div>
                <h3 className="text-xl font-switzer font-bold mb-6">Newsletter</h3>
                <p className="text-white font-normal font-satoshi">
                    Subscribe to our newsletter and stay updated.
                </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center mt-4 gap-2 border-b border-gray-700">
                <Mail className="text-gray-400" />
                <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className='border-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />
                <Button
                    type="submit"
                    variant="ghost"
                    disabled={isSubmitting}
                    className="text-[#5141e5] px-8 py-2 rounded-lg font-medium transition-colors"
                >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </form>
        </div>
    )
}

export default Newsletter