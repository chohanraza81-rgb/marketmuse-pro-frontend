'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check cookie on mount
  useEffect(() => {
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('site_auth='));
    setAuthed(hasCookie);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        // force reload to ensure middleware/cookie takes effect
        window.location.reload();
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authed === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated – show lock screen
  if (!authed) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 md:p-12 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Lock size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">MarketMuse PRO</h1>
          <p className="text-neutral-500 text-sm mb-8">Enter password to access</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-center text-lg placeholder-neutral-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Unlock'}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  // Authenticated – render children
  return <>{children}</>;
                              }
