"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Button from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isLoaded } = useUser();

  const navigation = [
    { name: 'Product', href: '#features', hasDropdown: true },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Documentation', href: '#docs' },
    { name: 'About', href: '#about' },
  ];

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
            <Shield className="w-8 h-8 text-primary-500 mr-3" />
            <span className="text-xl font-bold text-neutral-800">ComplianceScanner AI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div
                    className="flex items-center text-neutral-600 hover:text-primary-500 cursor-pointer transition-colors"
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
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2"
                      >
                        <a href="#features" className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-500">
                          Features
                        </a>
                        <a href="#api" className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-500">
                          API
                        </a>
                        <a href="#integrations" className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-500">
                          Integrations
                        </a>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors"
                  >
                    {item.name}
                  </a>
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
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
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
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2"
                  >
                    <a href="/dashboard" className="flex items-center px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </a>
                    <SignOutButton>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </SignOutButton>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                  <a href="/sign-in">Sign In</a>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg">
                  <a href="/sign-up">Start Free</a>
                </Button>
              </>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-600 hover:text-primary-500 transition-colors"
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
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                {isLoaded && user ? (
                  <>
                    <a href="/dashboard" className="block text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">
                      Dashboard
                    </a>
                    <SignOutButton>
                      <button className="w-full text-left text-sm font-medium text-neutral-600 hover:text-primary-500 transition-colors">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                      <a href="/sign-in">Sign In</a>
                    </Button>
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg">
                      <a href="/sign-up">Start Free</a>
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