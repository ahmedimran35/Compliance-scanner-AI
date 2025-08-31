"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart3, Shield, Globe, Users, Server, Lock, Target, Code, Database, Activity, FileText, Mail, MapPin, Hash, Link, File, Sparkles, CheckCircle, ArrowRight, Heart } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Compliance Scanner',
    description: 'Advanced AI algorithms scan your website for compliance issues, accessibility problems, and security vulnerabilities with 99.9% accuracy.',
    color: 'primary',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['WCAG 2.1 Compliance', 'GDPR & Privacy', 'HIPAA Standards', 'Real-time Analysis']
  },
  {
    icon: Server,
    title: 'Security Engine Suite',
    description: '5+ free security tools for comprehensive vulnerability assessment, port scanning, SSL analysis, DNS security, password analysis, and hash identification.',
    color: 'secondary',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Port Scanner', 'SSL Certificate Checker', 'DNS Analyzer', 'Password Strength Analyzer', 'Hash Identifier & Analyzer']
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get comprehensive compliance and security reports in under 30 seconds. Real-time scanning with detailed insights.',
    color: 'success',
    gradient: 'from-purple-500 to-pink-500',
    features: ['< 30s Scan Time', 'Real-time Reports', 'Actionable Insights', 'Priority Recommendations']
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Comprehensive dashboards with compliance scores, security metrics, and trend analysis for continuous improvement.',
    color: 'primary',
    gradient: 'from-orange-500 to-red-500',
    features: ['Compliance Scores', 'Security Metrics', 'Trend Analysis', 'Progress Tracking']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Enterprise-grade security with SOC 2 compliance, data encryption, and secure API endpoints for your peace of mind.',
    color: 'secondary',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['SOC 2 Compliant', 'Data Encryption', 'Secure APIs', 'Privacy First']
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members, assign tasks, track progress, and collaborate seamlessly with role-based access controls.',
    color: 'success',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Role-based Access', 'Task Assignment', 'Progress Tracking', 'Team Reports']
  }
];

const securityTools = [
  { icon: Server, name: 'Port Scanner', description: 'Scan open ports and services', status: 'Active' },
  { icon: Lock, name: 'SSL Checker', description: 'Analyze SSL certificates', status: 'Active' },
  { icon: Globe, name: 'DNS Analyzer', description: 'Comprehensive DNS analysis', status: 'Active' },
  { icon: Lock, name: 'Password Strength Analyzer', description: 'Analyze password security', status: 'Active' },
  { icon: Hash, name: 'Hash Identifier & Analyzer', description: 'Identify hash types and security', status: 'Active' },
  { icon: Code, name: 'Header Analyzer', description: 'HTTP security headers', status: 'Coming Soon' },
  { icon: Target, name: 'Subdomain Finder', description: 'Discover subdomains', status: 'Coming Soon' },
  { icon: FileText, name: 'WHOIS Lookup', description: 'Domain registration info', status: 'Coming Soon' },
  { icon: FileText, name: 'Robots Analyzer', description: 'Robots.txt analysis', status: 'Coming Soon' },
  { icon: Mail, name: 'Email Validator', description: 'Email validation & security', status: 'Coming Soon' },
  { icon: MapPin, name: 'IP Geolocation', description: 'IP location & threat intel', status: 'Coming Soon' },
  { icon: Link, name: 'URL Analyzer', description: 'Phishing & threat detection', status: 'Coming Soon' },
  { icon: File, name: 'File Analyzer', description: 'Malware detection', status: 'Coming Soon' }
];

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            WebShield AI - Complete Security Suite
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              stay secure & compliant
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Our comprehensive platform combines cutting-edge AI technology with real security tools to deliver unmatched compliance scanning and vulnerability assessment capabilities.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-slate-200/50 relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
                     style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                     data-gradient={feature.gradient} />
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${feature.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 mb-6">
                    {feature.description}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Engine Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Security Engine Tools
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              12+ Free Security Tools
            </span>
          </h3>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-12">
            Our Security Engine provides real security scanning tools with actual results. No simulations, no API keys required.
          </p>
        </motion.div>

        {/* Security Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
          {securityTools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`bg-white rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200/50 ${
                tool.status === 'Active' ? 'hover:border-green-300' : 'hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tool.status === 'Active' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  } shadow-sm`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tool.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                  {tool.name}
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why Free Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-12 border border-blue-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-900 mb-6">
              Why We Give It All Away Free
            </h3>
            
            <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed mb-8">
              We believe that security and compliance tools should be accessible to everyone, not just enterprises with big budgets. 
              Our mission is to democratize cybersecurity and help protect the entire web.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Democratize Security</h4>
                <p className="text-slate-600 text-sm">Make enterprise-grade security tools available to everyone, regardless of budget.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Protect the Web</h4>
                <p className="text-slate-600 text-sm">Help secure websites globally by providing free, accessible security tools.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Community Driven</h4>
                <p className="text-slate-600 text-sm">Built by the community, for the community. Your support keeps it free.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to secure your website?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust WebShield AI to keep their websites compliant, secure, and protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg flex items-center justify-center">
                <Zap className="w-5 h-5 mr-2" />
                Start Scanning Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300 flex items-center justify-center">
                <Heart className="w-4 h-4 mr-2" />
                Support Our Mission
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 