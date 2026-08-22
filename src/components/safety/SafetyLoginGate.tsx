'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

interface Props { onLogin: () => void; }

export default function SafetyLoginGate({ onLogin }: Props) {
  const [email, setEmail] = useState('ayush@vitgroww.edu');
  const [password, setPassword] = useState('student123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      onLogin();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/30 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">VITGROWW SAFE</h2>
          <p className="text-white/40 text-sm mt-1">Campus Safety System</p>
        </div>

        {/* Demo credentials */}
        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => { setEmail('ayush@vitgroww.edu'); setPassword('student123'); }}
              className="text-left p-2 bg-white/[0.04] rounded-lg hover:bg-white/[0.07] transition-colors"
            >
              <p className="text-white/60 font-medium">Student</p>
              <p className="text-white/30 text-[10px]">ayush@vitgroww.edu</p>
              <p className="text-white/30 text-[10px]">student123</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@vitgroww.edu'); setPassword('admin123'); }}
              className="text-left p-2 bg-white/[0.04] rounded-lg hover:bg-white/[0.07] transition-colors"
            >
              <p className="text-white/60 font-medium">Admin</p>
              <p className="text-white/30 text-[10px]">admin@vitgroww.edu</p>
              <p className="text-white/30 text-[10px]">admin123</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={12} /> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In to SAFE'}
          </button>
        </form>
      </div>
    </div>
  );
}
