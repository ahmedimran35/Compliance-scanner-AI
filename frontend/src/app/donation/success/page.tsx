"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

export default function DonationSuccessPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    const updateUserStatus = async () => {
      try {
        const token = await getToken();
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('No payment session found');
          setIsUpdating(false);
          return;
        }

        // Update user as supporter
        const supporterResponse = await fetch(`${getApiUrl()}/api/user/donate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            tierId: 'supporter',
            tierName: 'Supporter'
          }),
        });

        if (supporterResponse.ok) {
          setIsUpdating(false);
          setShowSuccess(true);
          // Refresh the page to update the sidebar with new supporter status
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          // Try to parse error response
          let errorMessage = 'Failed to update supporter status';
          let errorDetails = '';
          try {
            const errorData = await supporterResponse.json();
            errorMessage = errorData.error || errorMessage;
            errorDetails = JSON.stringify(errorData);
          } catch (parseError) {
            // If JSON parsing fails, use status text
            errorMessage = supporterResponse.statusText || errorMessage;
            errorDetails = `Status: ${supporterResponse.status}, StatusText: ${supporterResponse.statusText}`;
          }
            status: supporterResponse.status,
            statusText: supporterResponse.statusText,
            errorMessage,
            errorDetails,
            sessionId
          });
          throw new Error(errorMessage);
        }

        // Check if response has content
        const contentType = supporterResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response from server');
        }

      } catch (error) {
        
        // Handle specific error cases
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Unable to connect to server. Your payment was successful, but we could not update your status. Please contact support.');
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to update your supporter status. Please contact support.');
        }
        setIsUpdating(false);
      }
    };

    if (isLoaded && user) {
      updateUserStatus();
    }
  }, [isLoaded, user, router, getToken, searchParams]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-600 text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg font-medium">Redirecting to sign in...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto"
        >
          {isUpdating ? (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Processing Your Donation</h1>
              <p className="text-lg text-slate-600 mb-8">
                Please wait while we update your account status...
              </p>
            </>
          ) : showSuccess ? (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Thank You!</h1>
              <p className="text-xl text-slate-600 mb-8">
                Your donation has been processed successfully. You are now a Supporter! 🎉
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => router.push('/donation')}
                  className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Make Another Donation</span>
                </button>
              </div>
            </>
          ) : error ? (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-white text-4xl">⚠️</div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
              <p className="text-lg text-slate-600 mb-8">
                Your donation was processed successfully, but we encountered an issue updating your account status. Please contact support to get your Supporter badge.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => router.push('/donation')}
                  className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Make Another Donation</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Thank You!</h1>
              <p className="text-xl text-slate-600 mb-8">
                Your donation has been processed successfully. You are now a Supporter! 🎉
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => router.push('/donation')}
                  className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Make Another Donation</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 