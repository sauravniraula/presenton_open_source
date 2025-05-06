'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords don't match",
                description: "Please make sure your passwords match.",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
            });
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message,
            });
        } else {
            toast({
                title: "Password Updated",
                description: "Your password has been successfully updated.",
            });
            router.push('/auth/login');
        }

        setLoading(false);
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <h2 className="text-center text-xl font-semibold mb-4">Reset Your Password</h2>
                    <p className="text-center text-gray-600 mb-6">
                        Please enter your new password below.
                    </p>
                </div>

                <div className="rounded-md shadow-sm space-y-4">
                    <div>
                        <Input
                            type="password"
                            required
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            required
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
        </AuthLayout>
    );
}
