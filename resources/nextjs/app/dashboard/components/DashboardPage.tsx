'use client';

import React, { useState, useEffect } from 'react';

import Wrapper from '@/components/Wrapper';

import { DashboardApi } from '../api/dashboard';
import { PresentationGrid } from './PresentationGrid';

import Header from './Header'
import { getUser } from '@/utils/supabase/queries';
import { supabase } from '@/utils/supabase/client';
import { MixpanelEventName } from '@/utils/mixpanel/enums';
import { sendMpEvent } from '@/utils/mixpanel/services';

const DashboardPage: React.FC = () => {


    const [presentations, setPresentations] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        //? Mixpanel User Tracking
        sendMpEvent(MixpanelEventName.pageOpened, {
            page_name: "Dashboard Page"
        });

        const loadData = async () => {

            const user = await getUser(supabase);
            if (user?.id) {
                await fetchPresentations(user.id);
            }
        };
        loadData();
    }, []);

    const fetchPresentations = async (userId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await DashboardApi.getPresentations(userId);
            setPresentations(data);
        } catch (err) {
            setError(null);
            setPresentations([]);
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <div className="min-h-screen bg-[#E9E8F8]">
            <Header />
            <Wrapper>
                <main className="container mx-auto px-4 py-8">
                    <section>
                        <h2 className="text-2xl font-switzer font-medium mb-6">Slide Presentation</h2>
                        <PresentationGrid
                            presentations={presentations}
                            type='slide'
                            isLoading={isLoading}
                            error={error}
                        />
                    </section>
                    {/* <section className='mt-10'>
            <h2 className="text-2xl font-switzer font-medium mb-6">Video Presentation</h2>
            <PresentationGrid
              presentations={presentations}
              type='video'
            />
          </section> */}
                </main>
            </Wrapper>
        </div>
    );
};

export default DashboardPage;