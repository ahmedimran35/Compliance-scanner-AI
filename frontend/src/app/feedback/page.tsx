"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Star, MessageSquare, Bug, Lightbulb, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/config/api';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface FeedbackForm {
  type: 'general' | 'bug' | 'feature' | 'improvement';
  rating: number;
  title: string;
  description: string;
  email: string;
  category: string;
}

export default function FeedbackPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FeedbackForm>({
    type: 'general',
    rating: 0,
    title: '',
    description: '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'blue' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'yellow' },
    { id: 'improvement', label: 'Improvement', icon: Heart, color: 'green' }
  ];

  const categories = [
    'General',
    'User Interface',
    'Performance',
    'Security',
    'Scanning',
    'Monitoring',
    'Reports',
    'Notifications',
    'API',
    'Documentation',
    'Other'
  ];

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const apiUrl = getApiUrl();
      const endpoint = user ? '/api/feedback/authenticated' : '/api/feedback';
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${await getToken()}` })
        },
        body: JSON.stringify({
          type: formData.type,
          rating: formData.rating,
          title: formData.title,
          description: formData.description,
          email: formData.email,
          category: formData.category
        })
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to submit feedback: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      setSubmitStatus('success');
      setFormData({
        type: 'general',
        rating: 0,
        title: '',
        description: '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        category: 'General'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const feedbackType = feedbackTypes.find(t => t.id === type);
    if (feedbackType) {
      const Icon = feedbackType.icon;
      return <Icon className={`w-5 h-5 text-${feedbackType.color}-600`} />;
    }
    return <MessageSquare className="w-5 h-5 text-blue-600" />;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            We'd Love Your Feedback
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us improve Scan More by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>
        </motion.div>



        {/* Success/Error Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Thank you! Your feedback has been submitted successfully.
              </p>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">
                Something went wrong. Please try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {feedbackTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 ${
                      formData.type === type.id
                        ? `border-${type.color}-500 bg-${type.color}-50 shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 ${
                      formData.type === type.id ? `text-${type.color}-600` : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.type === type.id ? `text-${type.color}-700` : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-200 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </motion.button>
                ))}
                <span className="ml-3 text-sm text-gray-600">
                  {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Click to rate'}
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your feedback"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your feedback, including any steps to reproduce if reporting a bug..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com (required for follow-up)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to follow up on your feedback and send you updates.
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                isSubmitting || !formData.title || !formData.description || !formData.email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Immediate Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you need urgent assistance, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Documentation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </Layout>
  );
}
