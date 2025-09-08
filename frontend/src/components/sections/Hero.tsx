"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, CheckCircle, ArrowRight, Play, Star, Heart, Globe, Lock, Server, Brain, Users, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();

  const handleStartScanning = () => {
    router.push('/sign-up');
  };

  const handleWatchDemo = () => {
    // Open demo video or modal
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 5
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-white">
              Scan More - Complete Security Suite - 100% Free
            </span>
          </motion.div>
          
          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Find & Fix Website
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Vulnerabilities in 30 Seconds
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            AI-powered compliance scanner that detects security issues, accessibility problems, and regulatory violations before they become costly problems.
          </motion.p>

          {/* Live Scanner Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  placeholder="Enter your website URL (e.g., example.com)"
                  className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-xl bg-white/90 text-slate-900 placeholder-slate-500 border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base md:text-lg"
                />
                <button 
                  onClick={handleStartScanning}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center min-h-[44px]"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Scan Free
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-3 text-center">
                ✓ Sign up to access • ✓ Instant results • ✓ 100% free
              </p>
            </div>
          </motion.div>
          
          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-6xl mx-auto"
          >
            {[
              { icon: Shield, text: 'AI Compliance Scanner', color: 'text-blue-400', delay: 0.1 },
              { icon: Server, text: 'Security Engine Tools', color: 'text-green-400', delay: 0.2 },
              { icon: Brain, text: 'Real-time Analysis', color: 'text-purple-400', delay: 0.3 },
              { icon: Users, text: 'Team Collaboration', color: 'text-orange-400', delay: 0.4 }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 + feature.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center justify-center space-x-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span className="text-sm text-white font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Button 
              size="lg" 
              onClick={handleStartScanning}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-2xl shadow-blue-500/25 hover:scale-105 transition-transform duration-200 text-base md:text-lg px-6 py-3 md:px-8 md:py-4 min-h-[44px]"
            >
              <Shield className="w-5 h-5 mr-2" />
              Get Your Security Report
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleWatchDemo}
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform duration-200 text-base md:text-lg px-6 py-3 md:px-8 md:py-4 min-h-[44px]"
            >
              <Play className="w-4 h-4 mr-2" />
              See Live Demo
            </Button>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-blue-200"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>50,000+ Websites Scanned</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>99.9% Accuracy Rate</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>Quick Signup Required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>Enterprise Grade Security</span>
            </div>
          </motion.div>
          

        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          {[
            { number: '99.9%', label: 'Accuracy Rate', icon: Brain },
            { number: '< 30s', label: 'Scan Time', icon: Zap },
            { number: '12+', label: 'Security Tools', icon: Shield },
            { number: '50+', label: 'Compliance Standards', icon: Globe }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-3">
                <stat.icon className="w-8 h-8 text-blue-400 mr-2" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-blue-200 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero; 