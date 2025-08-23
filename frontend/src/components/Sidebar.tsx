"use client";

import React from 'react';
import { useUser, SignOutButton, useAuth } from '@clerk/nextjs';
import { Shield, LogOut, Menu, X, ChevronDown, Bell, Settings, User, Crown, Calendar, Activity, BarChart3, FolderOpen, Zap, CreditCard, HelpCircle, CheckCircle, AlertTriangle, Info, Clock, Heart, PanelLeftClose, Newspaper } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/config/api';

interface Notification {
  _id: string;
  type: 'scan_completed' | 'scan_failed' | 'monitoring_alert' | 'website_offline' | 'website_online' | 'system_maintenance' | 'new_feature' | 'security_alert';
  title: string;
  message: string;
  read: boolean;
  data?: {
    scanId?: string;
    websiteId?: string;
    projectId?: string;
    url?: string;
    errorMessage?: string;
    scanResults?: any;
  };
  action?: {
    label: string;
    href: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onToggleVisibility?: () => void;
  isHidden?: boolean;
}

export default function Sidebar({ isOpen, onToggle, onToggleVisibility, isHidden = false }: SidebarProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        return;
      }

      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/notifications?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = await getToken();
      
      if (!token) {
        return;
      }

      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } else {
      }
    } catch (error) {
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        // Refresh unread count
        fetchUnreadCount();
      }
    } catch (error) {
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = await getToken();
      
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        // Refresh unread count
        fetchUnreadCount();
      }
    } catch (error) {
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const token = await getToken();
      
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setIsNotificationDropdownOpen(false);
      }
    } catch (error) {
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoadingProfile(true);
      const token = await getToken();
      
      if (!token) return;

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch user profile when user changes
  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user?.id]); // Only depend on user ID, not entire user object

  // Initial fetch and periodic refresh - optimized
  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
    }
  }, [user?.id]); // Only depend on user ID

  // Refresh notifications every 30 seconds - optimized
  React.useEffect(() => {
    if (!user) {
      return;
    }

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]); // Only depend on user ID

  // Navigation debouncing to prevent double-clicks
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleNavigation = React.useCallback((href: string) => {
    if (isNavigating) return; // Prevent double navigation
    
    setIsNavigating(true);
    router.push(href);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  }, [router, onToggle, isNavigating]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'scan_completed':
      case 'website_online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'monitoring_alert':
      case 'website_offline':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'scan_failed':
      case 'security_alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'system_maintenance':
      case 'new_feature':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'scan_completed':
      case 'website_online':
        return 'border-l-green-500 bg-green-50';
      case 'monitoring_alert':
      case 'website_offline':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'scan_failed':
      case 'security_alert':
        return 'border-l-red-500 bg-red-50';
      case 'system_maintenance':
      case 'new_feature':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      current: pathname === '/dashboard',
      icon: Shield,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      current: pathname === '/projects',
      icon: FolderOpen,
      description: 'Manage Projects'
    },
    { 
      name: 'Monitoring', 
      href: '/monitoring', 
      current: pathname === '/monitoring',
      icon: Activity,
      description: 'Website Monitoring'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      current: pathname === '/reports',
      icon: BarChart3,
      description: 'View Reports'
    },
    { 
      name: 'Scheduled Scans', 
      href: '/scheduled-scans', 
      current: pathname === '/scheduled-scans',
      icon: Calendar,
      description: 'Automated Scans'
    },
    { 
      name: 'News', 
      href: '/news', 
      current: pathname === '/news',
      icon: Newspaper,
      description: 'Latest Updates'
    },
    { 
      name: 'Donate', 
      href: '/donation', 
      current: pathname === '/donation',
      icon: Heart,
      description: 'Support the Project'
    },
  ];

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isHidden ? -280 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen w-70 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-50 flex flex-col ${
          isHidden ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/30">
          <motion.button
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500 ring-1 ring-blue-200 group-hover:ring-blue-300 transform group-hover:rotate-3">
                <Shield className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                className="text-base font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 cursor-pointer drop-shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-2">
                  <span>ComplianceScanner AI</span>
                  <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                    Alpha
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.button>
          
          {/* Sidebar toggle button for desktop */}
          <motion.button
            onClick={onToggleVisibility || onToggle}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
            title="Toggle Sidebar"
          >
            <PanelLeftClose className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          {/* Close button for mobile */}
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
          >
            <X className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 min-h-0">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm ${
                  item.current
                    ? 'text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-300 ${item.current ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                <span className="flex-1 text-left">{item.name}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Section - Fixed at bottom */}
        <div className="p-3 border-t border-gray-200/30 space-y-2 mt-auto">
          {/* Chat with Astra */}
          <motion.button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('astra:open'));
              }
            }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Chat with Astra</span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 rounded-lg transition-all duration-300 hover:shadow-sm flex items-center space-x-3"
            >
              <Bell className="w-4 h-4" />
              <span className="flex-1 text-left text-sm">Notifications</span>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-md"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute bottom-full left-0 mb-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50 max-h-96 overflow-y-auto"
                >
                  {/* Notification Header */}
                  <div className="p-3 border-b border-gray-100/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <motion.button
                            onClick={markAllAsRead}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-100 px-2 py-1 rounded-lg transition-all duration-200"
                          >
                            Mark all read
                          </motion.button>
                        )}
                        <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                          {unreadCount} unread
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="py-2">
                    {loading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 text-xs mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center">
                        <Bell className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01 }}
                          className={`p-2.5 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 transition-all duration-200 ${
                            !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                          }`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={`text-xs font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-400">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  {!notification.read && (
                                    <motion.div 
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                                    />
                                  )}
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification._id);
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              {notification.action && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(notification.action!.href);
                                    setIsNotificationDropdownOpen(false);
                                  }}
                                  whileHover={{ scale: 1.02, x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-100 px-2 py-1 rounded-lg transition-all duration-200"
                                >
                                  {notification.action.label} →
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Notification Footer */}
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                      <motion.button
                        onClick={() => {
                          deleteAllNotifications();
                          setIsNotificationDropdownOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 text-center hover:bg-white/50 px-2 py-1.5 rounded-lg transition-all duration-200"
                      >
                        Clear all notifications
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center space-x-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg px-3 py-2 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 transition-all duration-300 shadow-sm border border-blue-200/30 hover:shadow-md hover:border-blue-300"
            >
              <div className="relative">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm ring-1 ring-white">
                  <span className="text-white text-xs font-bold">
                    {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border border-white flex items-center justify-center shadow-sm">
                  <div className="w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 px-1 py-0.5 rounded-full border border-purple-200">
                    <Crown className="w-2.5 h-2.5 text-purple-600" />
                    <span className="text-xs text-purple-700 font-medium">
                      {userProfile?.isSupporter ? 'Supporter' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute bottom-full left-0 mb-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                >
                  {/* User Info Header */}
                  <div className="p-3 border-b border-gray-100/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                          <span className="text-white text-sm font-bold">
                            {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.firstName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user.emailAddresses[0]?.emailAddress}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 px-1.5 py-0.5 rounded-full border border-purple-200">
                            <Crown className="w-2.5 h-2.5 text-purple-600" />
                            <span className="text-xs text-purple-700 font-medium">
                              {userProfile?.isSupporter ? 'Supporter Plan' : 'Free Plan'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-100 to-emerald-100 px-1 py-0.5 rounded-full border border-green-200">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-700 font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <motion.button
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => {
                        router.push('/settings');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200 shadow-sm">
                        <Settings className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">Settings</span>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => {
                        router.push('/profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200 shadow-sm">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">Profile</span>
                        <p className="text-xs text-gray-500">View your profile</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => {
                        router.push('/billing');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-200 shadow-sm">
                        <CreditCard className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">Billing</span>
                        <p className="text-xs text-gray-500">Manage subscription</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => {
                        router.push('/help');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-200 shadow-sm">
                        <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">Help & Support</span>
                        <p className="text-xs text-gray-500">Get help and support</p>
                      </div>
                    </motion.button>
                    
                    <div className="border-t border-gray-100 my-2 mx-3"></div>
                    
                    <div className="px-3">
                      <SignOutButton>
                        <motion.button 
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
                        >
                          <div className="w-7 h-7 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-red-200 group-hover:to-pink-200 transition-all duration-200 shadow-sm">
                            <LogOut className="w-3.5 h-3.5 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium text-sm">Sign Out</span>
                            <p className="text-xs text-red-500">Sign out of your account</p>
                          </div>
                        </motion.button>
                      </SignOutButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
} 