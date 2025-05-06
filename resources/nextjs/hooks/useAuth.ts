'use client';
import { useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import {supabase} from '@/utils/supabase/client'
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, clearUser, setLoading } from '@/store/slices/authSlice';

export function useAuth() {
  const [loading, setLocalLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
 

  useEffect(() => {
   
    if (typeof window === 'undefined') return;
    dispatch(setLoading(true));

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null));
      setLocalLoading(false);
      dispatch(setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
      localStorage.setItem('supabase_jwt', session?.access_token ?? '');
      setLocalLoading(false);
      dispatch(setLoading(false));
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
          }
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) {
        dispatch(setUser(data.session.user));
        
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch(clearUser());
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      
      console.log('Attempting password reset for:', email);
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        console.error('Supabase reset password error:', error);
        throw error;
      }
      
      console.log('Reset password request successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error details:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
     
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  return {
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
  };
} 