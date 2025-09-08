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
  Zap,
  ExternalLink
} from 'lucide-react';
import Layout from '@/components/Layout';

// Ko-fi configuration
const KO_FI_URL = 'https://ko-fi.com/scanmore';

export default function DonationPage() {
  const { user, isLoaded } = useUser();
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
    
    try {
      // Redirect to Ko-fi with suggested amount
      const koFiUrl = `${KO_FI_URL}?amount=${Math.round(amount)}`;
      window.open(koFiUrl, '_blank');
    } catch (error) {
      setError('Failed to redirect to Ko-fi. Please try again.');
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
            Support Scan More
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
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">Secure Payment via Ko-fi</h2>
              <p className="text-slate-600">You'll be redirected to Ko-fi for secure payment</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Ko-fi Ready</span>
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
                Suggested Donation Amount (USD)
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
              <p className="text-sm text-slate-500 mt-2">
                This amount will be suggested on Ko-fi. You can adjust it on their platform.
              </p>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <Lock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Your payment will be processed securely by Ko-fi. You'll be redirected to their secure payment page.
              </p>
            </div>

            {/* Ko-fi Info */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Ko-fi Payment Platform</p>
                <p className="text-xs text-blue-600">Trusted by creators worldwide for secure donations</p>
              </div>
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
                  <span>Redirecting to Ko-fi...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Donate via Ko-fi</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
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