"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Repeat, AlertCircle, CheckCircle } from 'lucide-react';

interface ScheduleScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: ScheduleData) => void;
  urlId: string;
  urlName: string;
}

interface ScheduleData {
  urlId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  scanOptions: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
    customRules: string[];
  };
}

export default function ScheduleScanModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  urlId, 
  urlName 
}: ScheduleScanModalProps) {
  const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [time, setTime] = React.useState('09:00');
  const [dayOfWeek, setDayOfWeek] = React.useState(1); // Monday
  const [dayOfMonth, setDayOfMonth] = React.useState(1);
  const [isScheduling, setIsScheduling] = React.useState(false);
  const [scanOptions, setScanOptions] = React.useState({
    gdpr: true,
    accessibility: true,
    security: true,
    performance: false,
    seo: false,
    customRules: []
  });

  const handleSchedule = async () => {
    setIsScheduling(true);
    try {
      const scheduleData: ScheduleData = {
        urlId,
        frequency,
        time,
        scanOptions,
        ...(frequency === 'weekly' && { dayOfWeek }),
        ...(frequency === 'monthly' && { dayOfMonth })
      };
      
      await onSchedule(scheduleData);
      onClose();
    } catch (error) {
      console.error('Error scheduling scan:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const getNextScanDate = () => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextScan = new Date(now);
    nextScan.setHours(hours, minutes, 0, 0);
    
    if (nextScan <= now) {
      nextScan.setDate(nextScan.getDate() + 1);
    }
    
    if (frequency === 'weekly') {
      const currentDay = nextScan.getDay();
      const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
      nextScan.setDate(nextScan.getDate() + daysToAdd);
    } else if (frequency === 'monthly') {
      nextScan.setDate(dayOfMonth);
      if (nextScan <= now) {
        nextScan.setMonth(nextScan.getMonth() + 1);
      }
    }
    
    return nextScan;
  };

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const getFrequencyDescription = () => {
    const nextDate = getNextScanDate();
    const dateStr = nextDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = nextDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    switch (frequency) {
      case 'daily':
        return `Every day at ${timeStr}`;
      case 'weekly':
        return `Every ${daysOfWeek[dayOfWeek]} at ${timeStr}`;
      case 'monthly':
        return `Every ${dayOfMonth}${getDaySuffix(dayOfMonth)} of the month at ${timeStr}`;
      default:
        return '';
    }
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Schedule Scan</h3>
                  <p className="text-sm text-slate-600">Set up recurring scans for {urlName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Multiple Schedules Allowed</h4>
                    <p className="text-sm text-blue-700">
                      You can create multiple scheduled scans for the same URL with different frequencies, times, and scan options. Each schedule will run independently.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scan Options */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Scan Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={scanOptions.gdpr}
                      onChange={(e) => setScanOptions(prev => ({ ...prev, gdpr: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">GDPR Compliance</span>
                      <p className="text-sm text-slate-600">Privacy and data protection</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={scanOptions.accessibility}
                      onChange={(e) => setScanOptions(prev => ({ ...prev, accessibility: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Accessibility</span>
                      <p className="text-sm text-slate-600">WCAG compliance</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={scanOptions.security}
                      onChange={(e) => setScanOptions(prev => ({ ...prev, security: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Security</span>
                      <p className="text-sm text-slate-600">Vulnerability assessment</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={scanOptions.performance}
                      onChange={(e) => setScanOptions(prev => ({ ...prev, performance: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">Performance</span>
                      <p className="text-sm text-slate-600">Speed optimization</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Schedule Settings */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Schedule Settings</h4>
                
                {/* Frequency */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'daily', label: 'Daily', icon: '🌅' },
                      { value: 'weekly', label: 'Weekly', icon: '📅' },
                      { value: 'monthly', label: 'Monthly', icon: '📆' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFrequency(option.value as any)}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          frequency === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  />
                </div>

                {/* Day Selection */}
                {frequency === 'weekly' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Day of Week</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      {daysOfWeek.map((day, index) => (
                        <option key={index} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {frequency === 'monthly' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Day of Month</label>
                    <select
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}{getDaySuffix(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-1">Schedule Preview</h5>
                    <p className="text-sm text-blue-700">{getFrequencyDescription()}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Next scan: {getNextScanDate().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={isScheduling}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isScheduling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Scan</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 