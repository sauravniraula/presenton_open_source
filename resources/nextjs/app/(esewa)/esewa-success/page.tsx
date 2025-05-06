import React from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquare, SparklesIcon } from "lucide-react";

const EsewaSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 relative">
          <CheckCircle2
            className="text-green-500 w-16 h-16 mx-auto animate-bounce"
            strokeWidth={1.5}
          />
          <SparklesIcon
            className="text-green-400 w-6 h-6 absolute top-1 right-1/3 animate-pulse"
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your transaction has been completed successfully. Thank you for your
          payment!
        </p>
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            Your account have been updated to standard. If you face any issue
            contact support.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full"
          >
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors w-full"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaSuccess;
