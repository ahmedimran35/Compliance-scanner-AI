"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Menu, X, ChevronDown, User, LogOut, Zap, Sparkles } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const navigation = [
    { name: 'Features', href: '/#features', hasDropdown: true },
    { name: 'Security Tools', href: '/security-engine' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About', href: '/about' },
  ];

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownToggle = () => {
    setIsProductDropdownOpen(!isProductDropdownOpen);
  };

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProductDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleNavigation = (href: string) => {
    closeAllMenus();
    
    // Routes that require authentication
    const protectedRoutes = ['/dashboard', '/security-engine'];
    
    // Check if the route requires authentication and user is not logged in
    if (protectedRoutes.includes(href) && (!isLoaded || !user)) {
      router.push('/sign-in');
      return;
    }
    
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                WebShield
              </span>
              <span className="ml-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-medium">
                AI
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div
                    className="flex items-center text-neutral-600 hover:text-blue-600 cursor-pointer transition-colors"
                    onMouseEnter={() => setIsProductDropdownOpen(true)}
                    onMouseLeave={() => setIsProductDropdownOpen(false)}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                    
                    {/* Dropdown */}
                    {isProductDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-3"
                      >
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Compliance Scanner</h3>
                          <p className="text-xs text-neutral-500">AI-powered compliance analysis</p>
                        </div>
                        <button onClick={() => handleNavigation('/dashboard')} className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-600">
                          <Zap className="w-4 h-4 mr-3 text-blue-500" />
                          <div>
                            <div className="font-medium">AI Compliance</div>
                            <div className="text-xs text-neutral-500">WCAG, GDPR, HIPAA</div>
                          </div>
                        </button>
                        <div className="px-4 py-2 border-b border-neutral-100 mt-2">
                          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Security Engine</h3>
                          <p className="text-xs text-neutral-500">Real security scanning tools</p>
                        </div>
                        <button onClick={() => handleNavigation('/security-engine')} className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-green-50 hover:text-green-600">
                          <Shield className="w-4 h-4 mr-3 text-green-500" />
                          <div>
                            <div className="font-medium">Security Tools</div>
                            <div className="text-xs text-neutral-500">Port Scanner, SSL, DNS</div>
                          </div>
                        </button>
                        <button onClick={() => handleNavigation('/dashboard')} className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-purple-50 hover:text-purple-600">
                          <Sparkles className="w-4 h-4 mr-3 text-purple-500" />
                          <div>
                            <div className="font-medium">Analytics</div>
                            <div className="text-xs text-neutral-500">Reports & insights</div>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors"
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons / User Menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-4"
          >
            {isLoaded && user ? (
              <div className="relative">
                <button
                  onClick={handleUserDropdownToggle}
                  className="flex items-center space-x-2 text-neutral-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-2"
                  >
                    <button onClick={() => handleNavigation('/dashboard')} className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-blue-50 hover:text-blue-600">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </button>
                    <SignOutButton>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </SignOutButton>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50" onClick={() => handleNavigation('/sign-in')}>
                  Sign In
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg" onClick={() => handleNavigation('/sign-up')}>
                  Start Free
                </Button>
              </>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={handleMenuToggle}
              className="text-neutral-600 hover:text-blue-600 transition-colors p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 py-4"
          >
            <div className="space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <a
                    href={item.href}
                    className="block text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors py-2"
                    onClick={closeAllMenus}
                  >
                    {item.name}
                  </a>
                                     {item.hasDropdown && (
                     <div className="ml-4 mt-2 space-y-2 border-l border-neutral-200 pl-4">
                       <button onClick={() => handleNavigation('/dashboard')} className="block text-sm text-neutral-500 hover:text-blue-600 py-1 w-full text-left">
                         AI Compliance Scanner
                       </button>
                       <button onClick={() => handleNavigation('/security-engine')} className="block text-sm text-neutral-500 hover:text-blue-600 py-1 w-full text-left">
                         Security Engine Tools
                       </button>
                       <button onClick={() => handleNavigation('/dashboard')} className="block text-sm text-neutral-500 hover:text-blue-600 py-1 w-full text-left">
                         Analytics & Reports
                       </button>
                     </div>
                   )}
                </div>
              ))}
              <div className="pt-4 space-y-3 border-t border-neutral-200">
                {isLoaded && user ? (
                  <>
                    <button onClick={() => handleNavigation('/dashboard')} className="block text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors py-2 w-full text-left">
                      Dashboard
                    </button>
                    <SignOutButton>
                      <button className="w-full text-left text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors py-2" onClick={closeAllMenus}>
                        Sign Out
                      </button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                                          <Button variant="outline" size="sm" className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50" onClick={() => handleNavigation('/sign-in')}>
                        Sign In
                      </Button>
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg" onClick={() => handleNavigation('/sign-up')}>
                        Start Free
                      </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 