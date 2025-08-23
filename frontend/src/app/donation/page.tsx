"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart, 
  CreditCard,
  Lock,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RJhja4TM9GOGK5BJ9nk1D5lbVvAQeacXaHsgonke6DwT8p8OpjVIFpUUxPO5Eueqbkclwn9tiPcZL1DBiISR8xa00lBNdatuD';

export default function DonationPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (amount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      const token = await getToken();
      
      // Create Stripe Checkout session
      const response = await fetch(`${getApiUrl()}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents for Stripe
          currency: 'usd',
          successUrl: `${window.location.origin}/donation/success`,
          cancelUrl: `${window.location.origin}/donation`,
        }),
      });

      // Check if response is ok and has content
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = 'Failed to create payment session';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();
      
      if (!data.sessionUrl) {
        throw new Error('No session URL received from server');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl;
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Handle specific error cases
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to payment server. Please try again later.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warm Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-red-50 px-4 py-2 rounded-full border border-pink-200/50 mb-6">
            <Heart className="w-4 h-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-700">Support the Project</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Support ComplianceScanner AI
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Your support means the world to us! Every contribution helps us continue building the most advanced compliance scanning platform and keeping it free for everyone. Thank you for being part of our journey! 💙
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-900">Become a Supporter</h3>
                <p className="text-slate-600">Get the Supporter badge and help us grow!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simple Donation Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Secure Payment</h2>
              <p className="text-slate-600">You'll be redirected to Stripe for secure payment</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleDonation} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Donation Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min="1"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10.00"
                  required
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <Lock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Your payment will be processed securely by Stripe. You'll be redirected to their secure payment page.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Redirecting to Stripe...</span>
                </div>
              ) : (
                `Donate $${amount.toFixed(2)}`
              )}
            </button>
          </form>
        </motion.div>

        {/* Why Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Support Us?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Advanced Features</h4>
                <p className="text-slate-600 text-sm">Help us develop cutting-edge compliance scanning capabilities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Keep It Free</h4>
                <p className="text-slate-600 text-sm">Your support helps us keep the service free for everyone</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Enhanced Security</h4>
                <p className="text-slate-600 text-sm">Support better security features and compliance monitoring</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 