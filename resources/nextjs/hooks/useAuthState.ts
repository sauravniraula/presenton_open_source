'use client'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { getUser } from '@/utils/supabase/queries';
import { setUser } from '@/store/slices/authSlice';
    import { supabase } from '@/utils/supabase/client';
export function useAuthState() {
    const dispatch = useDispatch();
    const { user, isLoading, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );
    useEffect(() => {
        if (!user) {
            getUser(supabase).then((user) => {
                dispatch(setUser(user));
            });
        }
    }, [user]);

    return {
        user,
        isLoading,
        isAuthenticated,
    };
} 