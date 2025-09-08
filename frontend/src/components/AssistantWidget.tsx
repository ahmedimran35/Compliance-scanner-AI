"use client";

import React from 'react';
import { useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/config/api';
import { X, Send, Sparkles, User as UserIcon, Loader2, Settings, Smile, Paperclip, Clock, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantWidget() {
  const { getToken, isLoaded } = useAuth();
  const [clerkError, setClerkError] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi, I\'m ScanBot - your compliance copilot. How can I help today?'
    }
  ]);

  // Listen for global open event from sidebar
  React.useEffect(() => {
    const handler = () => setIsOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('scanbot:open', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scanbot:open', handler as EventListener);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages or loading state change
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Scroll-triggered launcher reveal
  const [showLauncher, setShowLauncher] = React.useState(true);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowLauncher(y > 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  const toggle = () => setIsOpen((v) => !v);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Limit user input size to avoid large prompts
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed.slice(0, 500)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let token = null;
      try {
        if (isLoaded) {
          token = await getToken();
        }
      } catch (error) {
        console.warn('Clerk authentication failed, proceeding without token');
        setClerkError(true);
      }
      const baseUrl = getApiUrl();

      // Keep short history to avoid excessive token usage
      const history = [...messages, userMessage].slice(-6);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if we have a valid token
      if (token && token.trim()) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/api/assistant/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        
        try {
          const json = JSON.parse(text);
          
          if (response.status === 401) {
            throw new Error('Authentication required. Please sign in to use ScanBot.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Please check your permissions.');
          } else if (response.status >= 500) {
            // Show more detailed error for server errors
            const errorMsg = json.detail?.error || json.detail || json.error || 'Server error. Please try again in a moment.';
            throw new Error(`Server error: ${errorMsg}`);
          } else {
            throw new Error(json.detail || json.error || 'Request failed');
          }
        } catch (parseError) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please sign in to use ScanBot.');
          } else if (response.status >= 500) {
            throw new Error(`Server error: ${text || 'Please try again in a moment.'}`);
          } else {
            throw new Error(text || 'Request failed');
          }
        }
      }

      const data = await response.json();
      const assistantText: string = data.message || 'Sorry, I could not generate a response.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantText }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message.includes('Authentication')) {
        errorMessage = err.message;
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Enhanced Toggle Button */}
      {!isOpen && (
        <motion.button
          onClick={toggle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: showLauncher ? 1 : 0.8, 
            opacity: showLauncher ? 1 : 0.7,
            y: showLauncher ? 0 : 20
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white rounded-2xl px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-xl border border-white/20"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-6 h-6"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <span className="font-semibold text-lg">ScanBot</span>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        </motion.button>
      )}

      {/* Enhanced Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[450px] max-w-[92vw] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden ring-1 ring-indigo-100/50"
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white">
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">ScanBot</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/80">Compliance Copilot</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  onClick={toggle}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Enhanced Messages Area */}
            <div className="h-96 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50 to-white">
              <AnimatePresence>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[85%] ${m.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                        m.role === 'assistant' 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                          : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
                      }`}>
                        {m.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                        m.role === 'assistant' 
                          ? 'bg-white border border-slate-200/50 text-slate-800' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                          {m.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-2 text-xs ${
                          m.role === 'assistant' ? 'text-slate-500' : 'text-white/70'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Now</span>
                          {m.role === 'user' && <CheckCheck className="w-3 h-3 ml-1" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Enhanced Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white border border-slate-200/50 shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 text-sm">ScanBot is thinking...</span>
                        <div className="flex items-center gap-1">
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-indigo-500 rounded-full"
                          />
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-red-50 border border-red-200 shadow-lg">
                      <div className="text-red-700 text-sm font-medium">Oops! Something went wrong</div>
                      <div className="text-red-600 text-xs mt-1">{error}</div>
                    </div>
                  </div>
                </motion.div>
              )}

            <div ref={messagesEndRef} />
          </div>

            {/* Enhanced Input Area */}
            <div className="p-4 border-t border-slate-200/50 bg-white/95 backdrop-blur-xl">
              {/* Quick Reply Suggestions */}
              {messages.length === 1 && (
                <div className="mb-3">
                  <div className="text-xs text-slate-500 mb-2 font-medium">Quick questions:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "How do I run a security scan?",
                      "What compliance standards do you support?",
                      "Show me recent scan results"
                    ].map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading) sendMessage();
                      }
                    }}
                    placeholder="Ask about reports, scans, or best practices..."
                    className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    aria-label="Message ScanBot"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Uses a lightweight free model. Responses are brief to conserve tokens.
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}