'use client';

import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';

export default function VerifyEmailPage() {
    return (
        <AuthLayout>
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Check your email</h2>
                    <p className="text-gray-600">
                        We've sent you a verification link. Please check your email and click the link to verify your account.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Didn't receive the email? Check your spam folder or{' '}
                        <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500">
                            try again
                        </Link>
                    </p>

                    <p className="text-sm text-gray-500">
                        Already verified?{' '}
                        <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
} 