'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/utils/supabase/client';

export default function PaymentSuccess() {
    // const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const success = searchParams.get('success');

    // useEffect(() => {
    //     const checkSubscriptionStatus = async () => {
    //         try {
    //             // Get current user
    //             const { data: { user } } = await supabase.auth.getUser();
    //             if (!user) {
    //                 throw new Error('User not found');
    //             }

    //             // Get latest subscription
    //             const { data: subscription, error } = await supabase
    //                 .from('subscriptions')
    //                 .select('*')
    //                 .eq('user_id', user.id)
    //                 .in('status', ['trialing', 'active'])
    //                 .eq('cancel_at_period_end', false)
    //                 .order('created_at', { ascending: false })
    //                 .limit(1)
    //                 .single();

    //             if (error || !subscription) {
    //                 throw new Error('Subscription not found');
    //             }

    //             // Show success message based on subscription tier
    //             toast({
    //                 title: "Subscription Activated",
    //                 description: `Your ${subscription.tier} plan is now active!`,
    //             });

    //         } catch (error) {
    //             console.error('Error checking subscription:', error);
    //             toast({
    //                 variant: "destructive",
    //                 title: "Error",
    //                 description: "Failed to verify subscription status. Please contact support.",
    //             });
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     if (success) {
    //         checkSubscriptionStatus();
    //     } else {
    //         router.push('/pricing');
    //     }
    // }, [success]);

    const handleContinue = () => {
        router.push('/profile');
    };

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
    //                 <p className="mt-4 text-gray-600">Verifying your subscription...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8">
                <div className="text-center space-y-6">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>

                    {/* Success Message */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600">
                            Thank you for your subscription. Your account has been successfully upgraded.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="bg-gray-50 rounded-lg p-6 text-left">
                        <h3 className="font-medium text-gray-900 mb-3">What's next:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                Access to all premium features
                            </li>
                            <li className="flex items-center text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                Increased usage limits
                            </li>
                            <li className="flex items-center text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                Priority support access
                            </li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
