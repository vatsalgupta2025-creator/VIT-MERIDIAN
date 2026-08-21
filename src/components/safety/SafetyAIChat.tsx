'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Send, Loader2, Shield } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

interface Message { id: string; role: 'user' | 'ai'; text: string; }
interface Props { user: SafeUser; }

const QUICK_PROMPTS = [
  'Where is the nearest medical center?',
  'What are active campus alerts?',
  'How do I report an incident?',
  "There's a fire near my building",
];

export default function SafetyAIChat({ user }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'ai',
    text: "Hello! I'm the VITGROWW SAFE AI assistant. I can help you with campus safety, emergency guidance, and location information. How can I help you?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/safety/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai',
        text: data.reply || 'Sorry, I encountered an error.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai',
        text: 'AI unavailable. For emergencies: VIT Security +91-416-220-2000, Medical +91-416-220-2020.',
      }]);
    } finally { setLoading(false); }
  }, [loading]);

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: '60vh' }}>
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 flex items-center justify-center">
          <Shield size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white/90">Safety AI Assistant</h2>
          <p className="text-xs text-white/40">Powered by real campus data · Server-side AI</p>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => sendMessage(p)}
            className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.07] rounded-full text-white/50 hover:text-white/80 hover:border-cyan-500/30 transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none'
                : 'bg-white/[0.05] border border-white/10 text-white/80 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 mt-4 flex-shrink-0">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask about campus safety..."
          disabled={loading}
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-all"
        />
        <button type="submit" disabled={!input.trim() || loading}
          className="p-3 bg-cyan-500 rounded-xl text-white shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 disabled:opacity-50 transition-all">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
