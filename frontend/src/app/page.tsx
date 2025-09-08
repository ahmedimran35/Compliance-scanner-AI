"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  Globe, 
  MessageSquare,
  Star,
  Play,
  Shield
} from 'lucide-react';
import Header from '@/components/sections/Header';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Footer from '@/components/sections/Footer';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [clerkError, setClerkError] = useState(false);

  useEffect(() => {
    // Handle Clerk loading timeout
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        setClerkError(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated
    if (isLoaded && user && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/dashboard');
    }
  }, [isLoaded, user, router, isRedirecting]);

  // Show redirect message if user is authenticated and redirecting
  if (user && isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-8 h-8 text-green-600" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Welcome back!</h1>
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while Clerk is loading
  if (!isLoaded && !clerkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
                          <h1 className="text-2xl font-bold text-slate-900 mb-4">Loading Scan More</h1>
          <p className="text-slate-600">Initializing security tools...</p>
        </div>
      </div>
    );
  }

  // Show full landing page for everyone (including when Clerk fails to load)
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <Hero />
        
        {/* Trust Indicators & Social Proof */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Trusted by Security Professionals Worldwide
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Join thousands of developers, security teams, and businesses who rely on Scan More
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '50K+', label: 'Websites Scanned', icon: '🌐' },
                { number: '10K+', label: 'Active Users', icon: '👥' },
                { number: '99.9%', label: 'Uptime', icon: '⚡' },
                { number: '24/7', label: 'Support', icon: '🛡️' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works - 3 Simple Steps */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mb-6">
                <Sparkles className="w-6 h-6 mr-3" />
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Secure Your Website in
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  3 Simple Steps
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Get comprehensive security analysis and compliance reports in under 30 seconds
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1: Enter URL */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Enter Your Website URL</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Simply paste your website URL into our scanner. No signup required, no credit card needed.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-slate-500 mb-2">Example:</div>
                  <div className="font-mono text-slate-700">https://yourwebsite.com</div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    No registration required
                  </li>
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Instant scanning
                  </li>
                </ul>
              </motion.div>

              {/* Step 2: AI Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Analysis</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Our advanced AI scans your website for security vulnerabilities, accessibility issues, and compliance violations.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-slate-500 mb-2">Scanning:</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    99.9% accuracy rate
                  </li>
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    &lt; 30 second scan time
                  </li>
                </ul>
              </motion.div>

              {/* Step 3: Get Report */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Your Security Report</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Receive a comprehensive report with detailed findings, compliance scores, and actionable recommendations.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-slate-500 mb-2">Report includes:</div>
                  <div className="text-sm text-slate-700">• Security vulnerabilities<br/>• Compliance issues<br/>• Accessibility problems<br/>• Fix recommendations</div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Detailed analysis
                  </li>
                  <li className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Actionable insights
                  </li>
                </ul>
              </motion.div>
            </div>
            
          </div>
        </section>
        
        {/* Security Tools Showcase */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mb-6">
                <Shield className="w-6 h-6 mr-3" />
                Security Tools Suite
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  12+ Professional Security Tools
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Access our complete suite of security tools designed for professionals. All tools provide real results, no simulations.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: '🔍', name: 'Port Scanner', description: 'Scan open ports and services', status: 'Active', color: 'green' },
                { icon: '🔒', name: 'SSL Checker', description: 'Analyze SSL certificates', status: 'Active', color: 'green' },
                { icon: '🌐', name: 'DNS Analyzer', description: 'Comprehensive DNS analysis', status: 'Active', color: 'green' },
                { icon: '🔑', name: 'Password Analyzer', description: 'Analyze password security', status: 'Active', color: 'green' },
                { icon: '🔐', name: 'Hash Identifier', description: 'Identify hash types', status: 'Active', color: 'green' },
                { icon: '📋', name: 'Header Analyzer', description: 'HTTP security headers', status: 'Coming Soon', color: 'orange' },
                { icon: '🎯', name: 'Subdomain Finder', description: 'Discover subdomains', status: 'Coming Soon', color: 'orange' },
                { icon: '📄', name: 'WHOIS Lookup', description: 'Domain registration info', status: 'Coming Soon', color: 'orange' },
                { icon: '🤖', name: 'Robots Analyzer', description: 'Robots.txt analysis', status: 'Coming Soon', color: 'orange' },
                { icon: '📧', name: 'Email Validator', description: 'Email validation & security', status: 'Coming Soon', color: 'orange' },
                { icon: '📍', name: 'IP Geolocation', description: 'IP location & threat intel', status: 'Coming Soon', color: 'orange' },
                { icon: '🔗', name: 'URL Analyzer', description: 'Phishing & threat detection', status: 'Coming Soon', color: 'orange' }
              ].map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-4">{tool.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{tool.description}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    tool.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {tool.status}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Ready to Access All Security Tools?
                </h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Sign up now to access all active tools and get notified when new tools are released.
                </p>
                <button 
                  onClick={() => router.push('/sign-up')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg"
                >
                  <Shield className="w-5 h-5 mr-2 inline" />
                  Sign Up to Access Tools
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Customer Testimonials & Social Proof */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-green-100 text-green-700 px-6 py-3 rounded-full text-lg font-medium mb-6">
                <Star className="w-6 h-6 mr-3" />
                Trusted by Security Teams
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Real Results from Real Users
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                See how security professionals and developers are protecting their websites with Scan More
              </p>
            </motion.div>
            
            {/* Security Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center items-center gap-8 mb-16"
            >
              <div className="bg-slate-100 rounded-xl px-6 py-4 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-semibold text-slate-900">SOC 2 Compliant</div>
                  <div className="text-sm text-slate-600">Enterprise Security</div>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl px-6 py-4 flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="font-semibold text-slate-900">99.9% Uptime</div>
                  <div className="text-sm text-slate-600">Reliable Service</div>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl px-6 py-4 flex items-center">
                <Globe className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="font-semibold text-slate-900">50K+ Scans</div>
                  <div className="text-sm text-slate-600">Monthly Volume</div>
                </div>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Thompson",
                  role: "Senior Security Engineer",
                  company: "Fortune 500 Company",
                  avatar: "AT",
                  content: "We've reduced our security audit time by 80% using Scan More. The AI detection is incredibly accurate and the reports are comprehensive.",
                  rating: 5,
                  result: "80% time reduction"
                },
                {
                  name: "Maria Garcia",
                  role: "DevOps Manager",
                  company: "Tech Startup",
                  avatar: "MG",
                  content: "The automated compliance scanning has been a game-changer. We caught 15 critical issues in our first scan that would have cost us thousands.",
                  rating: 5,
                  result: "15 critical issues found"
                },
                {
                  name: "David Kim",
                  role: "Compliance Officer",
                  company: "Financial Services",
                  avatar: "DK",
                  content: "Finally, a tool that makes compliance accessible. The detailed reports help us stay ahead of regulations and avoid costly penalties.",
                  rating: 5,
                  result: "Zero compliance violations"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                      <div className="text-sm text-slate-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    ✓ {testimonial.result}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Interactive Demo Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-white/10 text-white px-6 py-3 rounded-full text-lg font-medium mb-6">
                <Play className="w-6 h-6 mr-3" />
                See It In Action
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Experience the Power of
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AI-Powered Security
                </span>
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Watch how Scan More transforms your security workflow in just minutes
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6">Live Demo Features</h3>
                  <div className="space-y-4">
                    {[
                      { icon: '🚀', text: 'Real-time scanning demonstration' },
                      { icon: '📊', text: 'Live compliance score updates' },
                      { icon: '🔍', text: 'Interactive vulnerability detection' },
                      { icon: '⚡', text: 'Instant report generation' }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <span className="text-blue-100">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => router.push('/docs')}
                    className="mt-8 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2 inline" />
                    Start Free Trial
                  </button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-8 border border-blue-500/30">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">No Setup Required</h3>
                    <p className="text-blue-100 mb-6">
                      Get started in under 2 minutes. No credit card, no complex configuration.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-blue-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Instant Access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>100% Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        
        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mb-6">
                <MessageSquare className="w-6 h-6 mr-3" />
                Frequently Asked Questions
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Everything You Need to Know
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Quick answers to common questions about Scan More
              </p>
            </motion.div>
            
            <div className="space-y-6">
              {[
                {
                  question: "Is Scan More really free forever?",
                  answer: "Yes! All our security tools including AI-powered scanning, compliance reports, and the complete security suite are completely free. We believe security should be accessible to everyone."
                },
                {
                  question: "How accurate is the AI scanning?",
                  answer: "Our AI achieves 95%+ accuracy in detecting security vulnerabilities and compliance issues. It's trained on millions of real-world examples and continuously improves."
                },
                {
                  question: "Can I use this for commercial projects?",
                  answer: "Absolutely! Scan More is designed for both personal and commercial use. There are no restrictions on the number of projects or websites you can scan."
                },
                {
                  question: "How long does it take to get started?",
                  answer: "You can start using our security tools in under 2 minutes. Simply sign up, and you'll have access to all 12+ security tools immediately."
                },
                {
                  question: "What security standards do you support?",
                  answer: "We support major compliance frameworks including WCAG accessibility, GDPR privacy, OWASP security, and industry-specific regulations."
                },
                {
                  question: "Do you offer customer support?",
                  answer: "Yes! We provide 24/7 support through our Discord community, documentation, and feedback system. Premium support is available for enterprise users."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <Footer />
    </main>
  );
}
