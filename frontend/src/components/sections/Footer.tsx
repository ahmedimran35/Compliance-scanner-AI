import React from 'react';
import { Shield, Mail, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-primary-400 mr-3" />
              <span className="text-2xl font-bold">Scan More</span>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md">
              AI-powered website compliance scanner that helps businesses stay compliant with accessibility, security, and regulatory requirements.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Features</a></li>
  
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Careers</a></li>
                              <li><a href="/feedback" className="text-neutral-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-neutral-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0">
              © 2024 Scan More. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">GDPR</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 