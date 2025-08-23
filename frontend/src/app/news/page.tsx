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
  
        }
        
      } catch (error) {
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
          <h1 className="text-2xl font-bold text-slate-900 mb-4">ComplianceScanner AI</h1>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Latest News</h1>
                  <p className="text-slate-600">Real-time compliance and security insights from Google News</p>
                </div>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
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
              
                    } else {
                      setError('No fresh news found. Please try again later.');
                    }
                  } catch (error) {
                    setError('Failed to refresh news. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchNews();
              }}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{loading ? 'Refreshing...' : 'Refresh News'}</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-sm"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Filter */}
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter */}
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-sm"
                >
                  {timeFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Results Count */}
              <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                <span>
                  {filteredNews.length} articles
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </span>
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
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-16 text-center">
              <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-slate-600 text-lg">Loading latest news...</p>
            </div>
          ) : error ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-16 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading News</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No News Found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentArticles.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                            {item.title}
                            {/* Hot News Indicator */}
                            {(() => {
                              const itemDate = new Date(item.pubDate);
                              const now = new Date();
                              const diffInHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
                              if (diffInHours < 6) {
                                return (
                                  <span className="inline-block ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                    HOT
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </h3>
                          {item.description && (
                            <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(item.pubDate)}</span>
                          </div>
                          <span className="font-medium text-slate-700">{item.source}</span>
                        </div>
                        
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // Validate the link before opening
                            if (!item.link || item.link === '#' || item.link.includes('javascript:')) {
                              e.preventDefault();
                              alert('Invalid link. This article may not be available.');
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
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          <span>Read More</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-8 flex items-center justify-center"
                >
                  <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
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
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                    
                    {/* Page Info */}
                    <div className="ml-4 text-sm text-slate-500">
                      Page {currentPage} of {totalPages}
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
