"use client";

import React from 'react';
import { Menu, PanelLeftClose } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import dynamic from 'next/dynamic';

interface LayoutProps {
  children: React.ReactNode;
}

const AssistantWidget = dynamic(() => import('@/components/AssistantWidget'), { ssr: false });

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarHidden, setSidebarHidden] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarVisibility = () => {
    setSidebarHidden(!sidebarHidden);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                ComplianceScanner AI
              </span>
              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                Alpha
              </span>
            </div>
          </div>
          
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        onToggleVisibility={toggleSidebarVisibility}
        isHidden={sidebarHidden} 
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarHidden ? 'lg:ml-0' : 'lg:ml-70'} ${sidebarOpen ? 'ml-70' : 'ml-0'} pt-16 lg:pt-0 h-screen overflow-y-auto`}>
        {children}
      </main>

      {/* Global Assistant Widget */}
      <AssistantWidget />
    </div>
  );
} 