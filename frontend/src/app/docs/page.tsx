"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Cog, Globe, Lock, Server, Shield, Zap, BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/sections/Header';

export default function DocumentationPage() {
  const [backendOnline, setBackendOnline] = useState<'unknown' | 'online' | 'offline'>('unknown');

  useEffect(() => {
    const check = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${url}/health`).catch(() => null);
        setBackendOnline(res && res.ok ? 'online' : 'offline');
      } catch {
        setBackendOnline('offline');
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header with Navigation */}
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-start justify-between flex-col md:flex-row md:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium shadow">
                <BookOpen className="w-3.5 h-3.5"/>
                <span>Product Guide</span>
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">Documentation</h1>
              <p className="text-gray-600 mt-2">Step-by-step guide to get started. No secrets or private data included.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm">
                <span className={`inline-block w-2 h-2 rounded-full ${backendOnline === 'online' ? 'bg-green-500' : backendOnline === 'offline' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                <span className="font-medium">Service status:</span>
                <span>{backendOnline === 'unknown' ? 'Checking…' : backendOnline === 'online' ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-blue-600"/>Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Sign up / Sign in', desc: 'Create an account or log in to get started.' },
              { step: '2', title: 'Create a Project', desc: 'Open the dashboard and add your first project.' },
              { step: '3', title: 'Add a Website/URL', desc: 'Connect the site you want to scan and monitor.' },
              { step: '4', title: 'Run a Scan', desc: 'Use quick scan or choose specific checks.' },
              { step: '5', title: 'Schedule Scans', desc: 'Automate daily/weekly runs for continuous coverage.' },
              { step: '6', title: 'View Reports', desc: 'See scores, issues, and recommended fixes.' },
            ].map((card) => (
              <div key={card.step} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-600">STEP {card.step}</span>
                  <Sparkles className="w-4 h-4 text-blue-400"/>
                </div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-gray-700 text-sm mt-1">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Setup Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Cog className="w-5 h-5 mr-2 text-indigo-600"/>Setup Guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">1) Create a Project</h3>
              <p className="text-gray-700 text-sm">From the dashboard, click “Create Project”, name it clearly, and save.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">2) Add Websites/URLs</h3>
              <p className="text-gray-700 text-sm">Add one or more websites/URLs to monitor and scan for compliance and security.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">3) Run Scans</h3>
              <p className="text-gray-700 text-sm">Run a quick scan or open “Scan Options” to target the checks you need.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">4) Schedule Scans</h3>
              <p className="text-gray-700 text-sm">Use the scheduler for daily/weekly automation and continuous coverage.</p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-emerald-600"/>Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Compliance Scanner</h3>
              <p className="text-gray-700 text-sm">Evaluate accessibility and privacy areas to help align with common guidelines.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Security Tools</h3>
              <p className="text-gray-700 text-sm">Built‑in utilities such as SSL checker, basic port scan, and DNS insights.</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Reports</h3>
              <p className="text-gray-700 text-sm">Concise summaries with scores, key issues, and practical next steps.</p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Globe className="w-5 h-5 mr-2 text-purple-600"/>Best Practices</h2>
          <ul className="space-y-2 text-gray-800 list-disc pl-5">
            <li>Scan regularly and track improvements over time.</li>
            <li>Prioritize high‑impact issues first.</li>
            <li>Share reports with your team to speed up fixes.</li>
          </ul>
        </section>

        {/* How It Works (Visualization) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Globe className="w-5 h-5 mr-2 text-purple-600"/>How It Works</h2>
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-blue-600"/>
                </div>
                <div className="text-sm font-medium text-gray-900">You</div>
                <div className="text-xs text-gray-600">Start a scan</div>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-400">→</div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-2">
                  <Server className="w-6 h-6 text-indigo-600"/>
                </div>
                <div className="text-sm font-medium text-gray-900">API</div>
                <div className="text-xs text-gray-600">Receives the request</div>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-400">→</div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-emerald-600"/>
                </div>
                <div className="text-sm font-medium text-gray-900">Scanner</div>
                <div className="text-xs text-gray-600">Analyses the site</div>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-5 gap-4 items-center">
              <div className="hidden md:flex items-center justify-center text-gray-400 md:col-start-2">↓</div>
              <div className="flex flex-col items-center text-center md:col-span-3">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="text-xs text-gray-600 mt-2">Processing checks (example progress)</div>
              </div>
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-1">Accessibility</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: '82%' }} />
                </div>
                <div className="mt-1 text-xs text-gray-700">82% OK</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-1">Security</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-emerald-500 rounded" style={{ width: '76%' }} />
                </div>
                <div className="mt-1 text-xs text-gray-700">76% OK</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="text-xs text-gray-500 mb-1">Performance</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-indigo-500 rounded" style={{ width: '68%' }} />
                </div>
                <div className="mt-1 text-xs text-gray-700">68% OK</div>
              </div>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><Server className="w-5 h-5 mr-2 text-gray-700"/>System Requirements</h2>
          <ul className="space-y-2 text-gray-800 list-disc pl-5">
            <li>Modern browser (Chrome, Firefox, Edge, Safari).</li>
            <li>Stable internet connection for scanning and fetching results.</li>
          </ul>
        </section>

        {/* Done */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center text-emerald-700">
            <CheckCircle className="w-5 h-5 mr-2"/>
            <span className="text-sm">You’re set. Explore tools from the header or start a project.</span>
          </div>
          <a href="/dashboard" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}


