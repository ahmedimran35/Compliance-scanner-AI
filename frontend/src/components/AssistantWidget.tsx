"use client";

import React from 'react';
import { useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/config/api';
import { MessageCircle, X, Send, Sparkles, User as UserIcon, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantWidget() {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi, I’m Astra — your compliance copilot. How can I help today?'
    }
  ]);

  // Listen for global open event from sidebar
  React.useEffect(() => {
    const handler = () => setIsOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('astra:open', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('astra:open', handler as EventListener);
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
      const token = await getToken();
      const baseUrl = getApiUrl();

      // Keep short history to avoid excessive token usage
      const history = [...messages, userMessage].slice(-6);

      const response = await fetch(`${baseUrl}/api/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: history })
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.detail || json.error || 'Request failed');
        } catch {
          throw new Error(text || 'Request failed');
        }
      }

      const data = await response.json();
      const assistantText: string = data.message || 'Sorry, I could not generate a response.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantText }
      ]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggle}
          className={`flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full px-4 py-3 shadow-xl hover:shadow-2xl transition-all transform ${showLauncher ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
          style={{ transitionDuration: '300ms' }}
        >
          <Sparkles className="w-5 h-5" />
          <span>Astra</span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="w-[380px] max-w-[92vw] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden ring-1 ring-indigo-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold">Astra — Compliance Copilot</span>
            </div>
            <button onClick={toggle} className="p-1 rounded-full hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-80 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${m.role === 'assistant' ? 'bg-white border border-slate-200 text-slate-800' : 'bg-indigo-600 text-white'}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${m.role === 'assistant' ? 'text-indigo-600' : 'text-white/80'}`}>
                      {m.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white border border-slate-200 text-slate-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white/90 backdrop-blur">
            <div className="flex items-center gap-2">
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
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                aria-label="Message Astra"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-3 py-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Uses a lightweight free model. Responses are brief to conserve tokens.
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 