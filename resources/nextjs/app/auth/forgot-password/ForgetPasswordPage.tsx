'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: error.message,
            });
        } else {
            toast({
                title: "Email Sent",
                description: "Check your email for the password reset link.",
            });
        }

        setLoading(false);
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <h2 className="text-center text-xl font-semibold mb-4">Reset Your Password</h2>
                    <p className="text-center text-gray-600 mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className="rounded-md shadow-sm space-y-4">
                    <div>
                        <Input
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Back to Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
} 