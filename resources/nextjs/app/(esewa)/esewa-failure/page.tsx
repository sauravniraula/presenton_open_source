import React from "react";
import Link from "next/link";
import {
  XCircle,
  AlertTriangle,
  MessageSquare,
  HomeIcon,
  RefreshCcw,
} from "lucide-react";

const EsewaFailure = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 relative">
          <XCircle
            className="text-red-500 w-16 h-16 mx-auto animate-bounce"
            strokeWidth={1.5}
          />
          <AlertTriangle
            className="text-red-400 w-6 h-6 absolute top-1 right-1/3 animate-pulse"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Don't worry.
        </p>

        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            If you continue to experience issues, please contact our support
            team for assistance.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full"
          >
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors w-full"
          >
            <HomeIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure;
