"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ExternalLink, Heart, Users, Sparkles } from 'lucide-react';
import Header from '@/components/sections/Header';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header with Navigation */}
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mb-6">
            <MessageCircle className="w-6 h-6 mr-3" />
            Connect With Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Let's Stay Connected! 💙
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join our vibrant community and stay updated with the latest security insights, 
            compliance tips, and exclusive content. We'd love to hear from you!
          </p>
        </motion.div>

        {/* Warm Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-6 text-white text-center mb-8 shadow-xl"
        >
          <Heart className="w-12 h-12 mx-auto mb-3 text-pink-200" />
          <h2 className="text-xl font-bold mb-3">We're Here for You!</h2>
          <p className="text-base text-blue-50 max-w-2xl mx-auto">
            Whether you need technical support, want to share feedback, or just want to say hello, 
            we're always excited to connect with our amazing community members!
          </p>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Discord */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Join Our Discord</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Connect with our community, get real-time support, and share your experiences!
              </p>
              <a
                href="https://discord.gg/6Z8eGNaCY3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </a>
            </div>
          </div>

          {/* Facebook */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Follow on Facebook</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Stay updated with our latest news, security tips, and community highlights!
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Follow Us
              </a>
            </div>
          </div>

          {/* Twitter/X */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Follow on X (Twitter)</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Get instant updates, security alerts, and industry insights in real-time!
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Follow Us
              </a>
            </div>
          </div>

          {/* YouTube */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Subscribe on YouTube</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Watch tutorials, security demos, and expert interviews on our channel!
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Subscribe
              </a>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-50 rounded-2xl p-6 text-center"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">Need Direct Contact?</h3>
          <p className="text-sm text-gray-600 mb-4">
            For personalized support, feedback, or detailed inquiries, please 
            <span className="font-semibold text-blue-600"> log in to your account</span> or 
            <span className="font-semibold text-blue-600"> join our Discord community</span> for immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = 'https://discord.gg/6Z8eGNaCY3'}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Join Discord Community
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
