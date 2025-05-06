import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">

            <div>
                <a href="/" className="flex items-center gap-2 pb-2 text-sm text-gray-600"><ArrowLeftIcon className="w-4 h-4" />Back to Home</a>
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome to Presenton
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Your AI-Powered Presentation Generator
                        </p>
                    </div>
                    {children}
                </div>
            </div>

        </div>
    );
} 