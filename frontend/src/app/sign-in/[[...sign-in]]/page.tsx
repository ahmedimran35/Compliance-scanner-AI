"use client";

import { SignIn } from '@clerk/nextjs';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignUpClick = (e: any) => {
    e.preventDefault();
    router.push('/sign-up');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-black/40 backdrop-blur-sm border-r border-gray-700">
          <div className="flex flex-col justify-center items-center w-full p-16">
            {/* Logo */}
            <div className="mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Brand Text */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                WebShield AI
              </h1>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Advanced AI-powered compliance scanning for modern businesses. 
                Stay compliant with confidence.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6 w-full max-w-md">
              {[
                { title: "Lightning Fast", desc: "Complete scans in under 30 seconds" },
                { title: "Enterprise Security", desc: "SOC 2 compliant with bank-level encryption" },
                { title: "Global Standards", desc: "50+ compliance frameworks supported" }
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-16 flex space-x-12">
              {[
                { value: "99.9%", label: "Accuracy" },
                { value: "10K+", label: "Businesses" },
                { value: "50+", label: "Standards" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-400 hover:text-white transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium">Back to home</span>
              </Link>
            </div>

            {/* Sign In Card */}
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-gray-800/50 via-gray-900/80 to-gray-800/50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-3">
                    Welcome back
                  </h2>
                  <p className="text-gray-300 text-base">
                    Sign in to your account to continue
                  </p>
                </div>
              </div>

              {/* Sign In Form */}
              <div className="px-8 pb-8 bg-gradient-to-br from-gray-900/90 via-gray-800/20 to-gray-900/30">
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none border-none p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      formButtonPrimary: "w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-xl font-bold py-3 px-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm relative overflow-hidden group",
                      formFieldInput: "w-full bg-gray-800/90 backdrop-blur-sm border-2 border-gray-600/80 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl py-3 px-4 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md hover:border-gray-500 !important",
                      formFieldLabel: "text-gray-200 font-bold mb-2 text-xs uppercase tracking-wide",
                      footerActionLink: "text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 hover:underline text-sm",
                      dividerLine: "bg-gradient-to-r from-transparent via-gray-600 to-transparent h-px",
                      dividerText: "text-gray-400 font-bold text-xs bg-gray-900/90 backdrop-blur-sm px-4 rounded-lg border border-gray-600/80 shadow-sm",
                      socialButtonsBlockButton: "w-full bg-gray-800/90 backdrop-blur-sm border-2 border-gray-600/80 text-gray-200 hover:bg-gray-700/90 rounded-xl py-3 px-4 transition-all duration-300 font-bold text-sm shadow-sm hover:shadow-md group",
                      socialButtonsBlockButtonText: "text-gray-200 font-bold text-sm",
                      socialButtonsBlockButtonArrow: "text-gray-200 group-hover:translate-x-1 transition-transform duration-300",
                      formFieldLabelRow: "text-gray-200 font-bold",
                      formResendCodeLink: "text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 text-center block hover:underline text-sm",
                      formFieldAction: "text-blue-400 hover:text-blue-300 font-bold text-center block hover:underline text-sm",
                      footerAction: "text-gray-400 text-center text-xs font-medium",
                      formFieldErrorText: "text-red-400 font-bold text-xs text-center flex items-center justify-center bg-red-900/90 backdrop-blur-sm border border-red-700/80 rounded-lg p-2",
                      alertText: "text-red-400 font-bold text-xs flex items-center",
                      alert: "bg-red-900/90 backdrop-blur-sm border border-red-700/80 rounded-xl p-3 shadow-sm",
                      headerBackRow: "text-gray-400",
                      headerBackIcon: "text-gray-400",
                      identityPreviewText: "text-gray-200 font-medium text-sm",
                      identityPreviewEditButton: "text-blue-400 hover:text-blue-300 font-bold hover:underline transition-all duration-300 text-sm",
                      modalBackdrop: "bg-black/80 backdrop-blur-sm",
                      modalContent: "bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl",
                      modalCloseButton: "text-gray-400 hover:text-white transition-all duration-300",
                      modalCloseButtonIcon: "text-gray-400",
                      formButtonReset: "bg-gray-800/90 backdrop-blur-sm border border-gray-600/80 text-gray-200 hover:bg-gray-700/90 rounded-xl py-3 px-4 transition-all duration-300 font-bold shadow-sm text-sm",
                      formButtonSecondary: "bg-gray-800/90 backdrop-blur-sm border border-gray-600/80 text-gray-200 hover:bg-gray-700/90 rounded-xl py-3 px-4 transition-all duration-300 font-bold shadow-sm text-sm",
                      formFieldRow: "mb-4",
                      formFieldInputRow: "mb-4",
                      formFieldActionRow: "mb-4",
                      formButtonRow: "mb-4",
                      footerActionRow: "mb-4",
                      socialButtonsBlock: "mb-4",
                      dividerRow: "mb-4",
                      formHeaderRow: "mb-4",
                      formHeaderTitle: "text-white text-lg font-bold mb-2",
                      formHeaderSubtitle: "text-gray-300 text-xs",
                      formFieldInputShowPasswordButtonRow: "absolute right-3 top-1/2 transform -translate-y-1/2",
                      formFieldInputShowPasswordButtonIcon: "w-4 h-4 text-gray-400 hover:text-gray-200 transition-colors duration-300",
                      formFieldInputShowPasswordButton: "p-1.5 rounded-lg hover:bg-gray-700/80 transition-all duration-300",
                    },
                    variables: {
                      colorPrimary: '#3B82F6',
                      colorBackground: 'transparent',
                      colorText: '#FFFFFF',
                      colorTextSecondary: '#9CA3AF',
                      colorSuccess: '#10B981',
                      colorDanger: '#EF4444',
                      colorWarning: '#F59E0B',
                      colorTextOnPrimaryBackground: '#FFFFFF',
                      borderRadius: '0.5rem',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: {
                        normal: '400',
                        medium: '500',
                        semibold: '600',
                        bold: '700',
                      },
                      spacingUnit: '0.25rem',
                    },
                  }}
                  redirectUrl="/dashboard"
                />
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 text-center bg-gradient-to-br from-gray-800/30 via-gray-900/80 to-gray-800/30">
                <div className="bg-gradient-to-r from-gray-800/80 via-gray-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-sm">
                  <p className="text-gray-300 text-sm mb-4">
                    Don't have an account?{' '}
                    <button 
                      onClick={handleSignUpClick}
                      className="text-blue-400 hover:text-blue-300 font-bold transition-colors hover:underline"
                    >
                      Sign up for free
                    </button>
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400 font-medium">Enterprise-grade security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 