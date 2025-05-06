'use client';

import React, { useState } from 'react'

import { createStripePortal } from '@/utils/stripe/server';
import { Button } from './ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { sendMpEvent } from '@/utils/mixpanel/services';
import { MixpanelEventName, ToastType } from '@/utils/mixpanel/enums';

const ManagePlan = ({ tier }: { tier: string }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleBillingPortal = async () => {
        try {
            sendMpEvent(MixpanelEventName.openingBillingPortal);
            setLoading(true);
            const url = await createStripePortal('/profile');
            if (typeof url === 'string') {
                router.push(url);
            } else {
                sendMpEvent(MixpanelEventName.error, {
                    error_message: 'Failed to get portal URL'
                });
                throw new Error('Failed to get portal URL');
            }
        } catch (error) {
            sendMpEvent(MixpanelEventName.error, {
                error_message: 'Failed to open billing portal'
            });
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to open billing portal. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Button
            onClick={handleBillingPortal}
            disabled={loading || tier === 'free'}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                </>
            )}
        </Button>
    )
}
export default ManagePlan

