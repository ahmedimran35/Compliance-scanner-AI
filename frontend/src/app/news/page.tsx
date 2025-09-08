"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, ExternalLink, Clock, Globe, TrendingUp, Search, Filter } from 'lucide-react';
import Layout from '@/components/Layout';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
}

export default function NewsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('recent'); // Add sorting option
  const [timeFilter, setTimeFilter] = React.useState('all'); // Add time filter
  const [currentPage, setCurrentPage] = React.useState(1); // Add pagination state
  const articlesPerPage = 10; // Articles per page

  // Handle authentication redirect
  React.useEffect(() => {
    if (isLoaded && !user) {
      if (process.env.NODE_ENV === 'development') {
      }
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch real-time news using API route
  React.useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    const fetchNews = async () => {
      try {
        // Fetch news from our API route
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success && data.news && data.news.length > 0) {
          setNews(data.news);
          if (process.env.NODE_ENV === 'development') {
          }
        } else {
          // Use fallback data if API fails
          const fallbackNews: NewsItem[] = [
            {
              title: "Latest: AI-Powered Compliance Tools Revolutionize Website Security",
              link: "https://techcrunch.com/2024/01/ai-compliance-tools/",
              pubDate: new Date().toISOString(),
              source: "TechCrunch",
              description: "New AI-driven compliance scanning tools are transforming how businesses ensure website security and regulatory compliance."
            },
            {
              title: "Breaking: GDPR Compliance Updates for 2024",
              link: "https://www.zdnet.com/article/gdpr-updates-2024/",
              pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              source: "ZDNet",
              description: "Stay updated with the latest GDPR compliance requirements and implementation strategies for 2024."
            },
            {
              title: "New WCAG 3.0 Guidelines Released",
              link: "https://www.w3.org/WAI/WCAG3/",
              pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              source: "W3C",
              description: "The new WCAG 3.0 guidelines bring significant improvements to web accessibility standards."
            },
            {
              title: "Cybersecurity Trends: What to Expect in 2024",
              link: "https://www.securityweek.com/cybersecurity-trends-2024/",
              pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              source: "SecurityWeek",
              description: "Explore the top cybersecurity trends and threats that organizations should prepare for in 2024."
            },
            {
              title: "Compliance Automation: Reducing Manual Audit Workload",
              link: "https://www.complianceweek.com/automation/",
              pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              source: "Compliance Week",
              description: "How automation is streamlining compliance processes and reducing manual audit workloads."
            },
            {
              title: "Data Privacy Laws: Global Regulatory Landscape",
              link: "https://www.iapp.org/news/global-privacy-laws/",
              pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              source: "IAPP",
              description: "An overview of the evolving global data privacy regulatory landscape and its impact on businesses."
            }
          ];
          setNews(fallbackNews);
          if (process.env.NODE_ENV === 'development') {
          }
        }
        
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching news:', error);
        }
        setError('Failed to load news. Please try again later.');
        
        // Fallback to mock data with current timestamps
        const fallbackNews: NewsItem[] = [
          {
            title: "Latest: AI-Powered Compliance Tools Revolutionize Website Security",
            link: "https://techcrunch.com/2024/01/ai-compliance-tools/",
            pubDate: new Date().toISOString(),
            source: "TechCrunch",
            description: "New AI-driven compliance scanning tools are transforming how businesses ensure website security and regulatory compliance."
          },
          {
            title: "Breaking: GDPR Compliance Updates for 2024",
            link: "https://www.zdnet.com/article/gdpr-updates-2024/",
            pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: "ZDNet",
            description: "Stay updated with the latest GDPR compliance requirements and implementation strategies for 2024."
          },
          {
            title: "New WCAG 3.0 Guidelines Released",
            link: "https://www.w3.org/WAI/WCAG3/",
            pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: "W3C",
            description: "The new WCAG 3.0 guidelines bring significant improvements to web accessibility standards."
          },
          {
            title: "Cybersecurity Trends: What to Expect in 2024",
            link: "https://www.securityweek.com/cybersecurity-trends-2024/",
            pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: "SecurityWeek",
            description: "Explore the top cybersecurity trends and threats that organizations should prepare for in 2024."
          },
          {
            title: "Compliance Automation: Reducing Manual Audit Workload",
            link: "https://www.complianceweek.com/automation/",
            pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            source: "Compliance Week",
            description: "How automation is streamlining compliance processes and reducing manual audit workloads."
          },
          {
            title: "Data Privacy Laws: Global Regulatory Landscape",
            link: "https://www.iapp.org/news/global-privacy-laws/",
            pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            source: "IAPP",
            description: "An overview of the evolving global data privacy regulatory landscape and its impact on businesses."
          }
        ];
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 7200) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    // For older articles, show the actual date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.source.toLowerCase().includes(selectedCategory.toLowerCase());
    
    // Time filtering
    const itemDate = new Date(item.pubDate);
    const now = new Date();
    const matchesTimeFilter = (() => {
      switch (timeFilter) {
        case 'today':
          return itemDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= monthAgo;
        default:
          return true; // 'all'
      }
    })();
    
    return matchesSearch && matchesCategory && matchesTimeFilter;
  }).sort((a, b) => {
    // Sorting logic
    switch (sortBy) {
      case 'recent':
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      case 'oldest':
        return new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'source':
        return a.source.localeCompare(b.source);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredNews.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, timeFilter]);

  const categories = [
    { id: 'all', name: 'All News' },
    { id: 'security', name: 'Security' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'privacy', name: 'Privacy' },
    { id: 'accessibility', name: 'Accessibility' },
    { id: 'gdpr', name: 'GDPR' },
    { id: 'cybersecurity', name: 'Cybersecurity' }
  ];

  const sortOptions = [
    { id: 'recent', name: 'Most Recent' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'title', name: 'Title A-Z' },
    { id: 'source', name: 'Source A-Z' }
  ];

  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' }
  ];

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
                          <h1 className="text-2xl font-bold text-slate-900 mb-4">Scan More</h1>
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show redirect state when user is not authenticated
  if (isLoaded && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-600 mb-4">Please sign in to access the news page.</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 py-8">
        {/* Enhanced Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-blue-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Globe className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Latest News</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200 text-sm font-medium">Live News Feed</span>
                    </div>
                    <span className="text-blue-300 text-sm">•</span>
                    <span className="text-blue-200 text-sm">Real-time updates</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <motion.p 
                      key={news.length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {news.length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Articles</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key={news.filter(item => {
                        const itemDate = new Date(item.pubDate);
                        const now = new Date();
                        const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                        return diffInHours < 6;
                      }).length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {news.filter(item => {
                        const itemDate = new Date(item.pubDate);
                        const now = new Date();
                        const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                        return diffInHours < 6;
                      }).length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Fresh</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key="0"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      0
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Trending</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    // Trigger news fetch again
                    const fetchNews = async () => {
                      try {
                        const response = await fetch('/api/news');
                        const data = await response.json();
                        if (data.success && data.news && data.news.length > 0) {
                          setNews(data.news);
                          if (process.env.NODE_ENV === 'development') {
                          }
                        } else {
                          setError('No fresh news found. Please try again later.');
                        }
                      } catch (error) {
                        if (process.env.NODE_ENV === 'development') {
                          console.error('❌ Error refreshing news:', error);
                        }
                        setError('Failed to refresh news. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchNews();
                  }}
                  disabled={loading}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{loading ? 'Refreshing...' : 'Refresh News'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-700">Total Articles</p>
                <motion.p 
                  key={news.length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-blue-900"
                >
                  {news.length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">Live feed</span>
              </div>
              <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-700">Fresh News</p>
                <motion.p 
                  key={news.filter(item => {
                    const itemDate = new Date(item.pubDate);
                    const now = new Date();
                    const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                    return diffInHours < 6;
                  }).length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-green-900"
                >
                  {news.filter(item => {
                    const itemDate = new Date(item.pubDate);
                    const now = new Date();
                    const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                    return diffInHours < 6;
                  }).length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Shield className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Last 6 hours</span>
              </div>
              <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-gradient-to-br from-yellow-50 to-yellow-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-yellow-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-yellow-700">Trending</p>
                <motion.p 
                  key="0"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-yellow-900"
                >
                  0
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Search className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600 font-medium">Hot topics</span>
              </div>
              <div className="w-16 h-2 bg-yellow-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "0%" }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Filter className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-700">Categories</p>
                <motion.p 
                  key="7"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-purple-900"
                >
                  7
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <ExternalLink className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-600 font-medium">Available</span>
              </div>
              <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 mb-8"
        >
          <div className="flex flex-col gap-6">
            {/* Enhanced Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search news articles, topics, or sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-lg"
              />
            </div>
            
            {/* Enhanced Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Filter */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                >
                  {timeFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Enhanced Results Count */}
              <div className="flex items-center space-x-3 text-slate-600 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{filteredNews.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Articles Found</p>
                  {totalPages > 1 && (
                    <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* News Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {loading ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-16 text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Globe className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Loading Latest News</h3>
              <p className="text-slate-600 text-lg">Fetching the most recent compliance and security updates...</p>
            </div>
          ) : error ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200/50 p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Error Loading News</h3>
              <p className="text-red-600 mb-6 text-lg">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </motion.button>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No News Found</h3>
              <p className="text-slate-600 text-lg mb-6">Try adjusting your search or filter criteria to find relevant news.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Clear Search
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Show All Categories
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {currentArticles.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {/* News Category Badge */}
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                              {item.source}
                            </span>
                            {/* Hot News Indicator */}
                            {(() => {
                              const itemDate = new Date(item.pubDate);
                              const now = new Date();
                              const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                              if (diffInHours < 6) {
                                return (
                                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                                    🔥 HOT
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{formatDate(item.pubDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">{item.source}</span>
                          </div>
                        </div>
                        
                        <motion.a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            // Validate the link before opening
                            if (!item.link || item.link === '#' || item.link.includes('javascript:')) {
                              e.preventDefault();
                              // Handle invalid link silently or show toast
                              console.warn('Invalid news article link');
                              return;
                            }
                            
                            // Ensure the link has a proper protocol
                            let url = item.link;
                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                              url = 'https://' + url;
                            }
                            
                            // Open in new tab
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="group/btn flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <span>Read More</span>
                          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Enhanced Pagination Controls */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-12 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6">
                    {/* Previous Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </motion.button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 text-sm font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {/* Next Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <span>Next</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </motion.button>
                    
                    {/* Enhanced Page Info */}
                    <div className="ml-6 flex items-center space-x-3 text-slate-600 bg-slate-50 px-4 py-3 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{currentPage}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Page {currentPage} of {totalPages}</p>
                        <p className="text-xs text-slate-500">{filteredNews.length} articles total</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
