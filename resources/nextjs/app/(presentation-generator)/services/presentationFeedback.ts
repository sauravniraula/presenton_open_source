import { supabase } from '@/utils/supabase/client';


export interface PresentationFeedbackService  {
      tags: string[],
        rating: string,
        feedback: string,
}

export const PresentationFeedbackService = {
    async saveFeedback(userId:string,userName: string, presentationId: string, feedback: PresentationFeedbackService) {
        const { error } = await supabase
            .from('presentation-feedback')
            .insert({
                'id': userId,
                'user-gmail':userName,
               'presentation-id': presentationId,
                properties: feedback,
            });
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
        },

    }

    