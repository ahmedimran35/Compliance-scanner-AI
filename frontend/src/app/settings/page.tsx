"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Crown,
  Heart,
  Calendar,
  DollarSign,
  Award,
  Settings as SettingsIcon,
  Edit,
  Save,
  X,
  CheckCircle,
  Star,
  Globe,
  BarChart3,
  Activity,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Database
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isSupporter: boolean;
  supporterTier?: string;
  supporterSince?: string;
  totalDonations: number;
  donationHistory: Array<{
    amount: number;
    tierId: string;
    tierName: string;
    date: string;
    status: string;
  }>;
  projects: number;
  scansThisMonth: number;
  maxProjects: number;
  maxScansPerMonth: number;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user && isLoaded) {
      fetchProfile();
      // Set edit form with Clerk user data
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user?.id]);

  // Refresh profile data when the page becomes visible (user navigates to settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isLoaded) {
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isLoaded]);

  // Auto-refresh statistics every 30 seconds
  useEffect(() => {
    if (!user || !isLoaded) return;

    const interval = setInterval(() => {
      fetchProfile();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, isLoaded]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      
      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching user profile...');
      }
      const response = await fetch(`${getApiUrl()}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Response status:', response.status);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', response.status, errorData);
        }
        
        if (response.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else {
          setError(`Failed to fetch profile: ${errorData.error || response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Settings page - Full API response:', data);
      }
      
      if (data.user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('User data received:', data.user);
        }
        setProfile(data.user);
        // setEditForm({ // This line is now handled by the useEffect hook
        //   firstName: data.user.firstName || '',
        //   lastName: data.user.lastName || ''
        // });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('No user data in response:', data);
        }
        setError('Invalid response format from server');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', err);
      }
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${getApiUrl()}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditing(false);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', error);
      }
      alert('Failed to update profile. Please try again.');
    }
  };

  const fixStatistics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${getApiUrl()}/api/user/fix-stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        alert('Statistics fixed successfully! Your counts have been updated.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fix statistics');
      }
    } catch (error) {
      console.error('Error fixing statistics:', error);
      alert(`Failed to fix statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = () => {
    // First try to get name from Clerk user data (like navbar does)
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    
    // Fallback to database data
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile?.firstName) {
      return profile.firstName;
    } else if (profile?.lastName) {
      return profile.lastName;
    } else {
      return 'Set your name';
    }
  };

  const getDisplayEmail = () => {
    // First try to get email from Clerk user data (like navbar does)
    if (user?.emailAddresses && user.emailAddresses.length > 0) {
      return user.emailAddresses[0].emailAddress;
    }
    
    // Fallback to database data
    if (profile?.email && !profile.email.includes('@placeholder.com')) {
      return profile.email;
    }
    
    return 'Email not available';
  };

  const isDataFromClerk = () => {
    return (user?.firstName || user?.lastName || (user?.emailAddresses && user.emailAddresses.length > 0));
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 mb-6">
            <SettingsIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Account Management</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Account Settings
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage your profile, view your supporter status, and track your activity
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-16"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-slate-600 text-lg font-medium">Loading your profile...</span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
                      <p className="text-slate-600">Manage your personal details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                      
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-600">Full Name</label>
                      {isEditing ? (
                        <div className="flex space-x-4 mt-1">
                          <input
                            type="text"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            placeholder="First Name"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            placeholder="Last Name"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <p className="text-lg font-semibold text-slate-900">
                          {getDisplayName()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-600">Email Address</label>
                      <p className="text-lg font-semibold text-slate-900">
                        {getDisplayEmail()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-600">Member Since</label>
                      <p className="text-lg font-semibold text-slate-900">{formatDate(profile.createdAt)}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Usage Statistics</h2>
                      <div className="text-slate-600 flex items-center space-x-2">
                        <span>Your activity and limits</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={fetchProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <span>{loading ? 'Updating...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={fixStatistics}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <div className="w-4 h-4">
                      <div className="w-4 h-4 border-2 border-green-600 rounded-full"></div>
                    </div>
                    <span>Fix Statistics</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Projects Created</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.projects}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Total projects in your account</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Scans This Month</p>
                        <p className="text-2xl font-bold text-slate-900">{profile.scansThisMonth}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Compliance scans performed</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Max Projects</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {profile.maxProjects === -1 ? 'Unlimited' : profile.maxProjects}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Project limit</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Max Scans/Month</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {profile.maxScansPerMonth === -1 ? 'Unlimited' : profile.maxScansPerMonth}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Monthly scan limit</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Supporter Status */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Supporter Badge */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
                <div className="text-center">
                  {profile.isSupporter ? (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Crown className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Supporter</h3>
                      <p className="text-slate-600 mb-4">{profile.supporterTier}</p>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Heart className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">Thank you for your support!</span>
                        </div>
                      </div>
                      {profile.supporterSince && (
                        <p className="text-xs text-slate-500">
                          Supporter since {formatDate(profile.supporterSince)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Free User</h3>
                      <p className="text-slate-600 mb-4">All features are free to use</p>
                      <button
                        onClick={() => router.push('/donation')}
                        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Become a Supporter
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Donation History */}
              {profile.isSupporter && profile.donationHistory && profile.donationHistory.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Donation History</h3>
                      <p className="text-sm text-slate-600">Your support contributions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {profile.donationHistory.slice(0, 3).map((donation, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{donation.tierName}</p>
                            <p className="text-sm text-slate-600">{formatDate(donation.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${donation.amount}</p>
                            <p className="text-xs text-slate-500">{donation.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {profile.totalDonations > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">Total Donations</span>
                        <span className="font-bold text-green-600">${profile.totalDonations}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
} 