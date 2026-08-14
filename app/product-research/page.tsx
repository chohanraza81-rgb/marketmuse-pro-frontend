'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles, ChevronRight, ArrowLeft, Package, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import LiveStatus from '@/components/LiveStatus';

const countries = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
];

export default function ProductResearchPage() {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 90)), 800);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';
      const res = await fetch(`${API_URL}/product-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), country }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to generate report');
      }

      const report = await res.json();
      clearInterval(interval);
      setProgress(100);
      toast.success('Product report generated successfully', { icon: '✅' });
      setTimeout(() => router.push(`/report/${report.id}`), 500);
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || 'Generation failed', { icon: '❌' });
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                Muse<span className="text-indigo-400">PRO</span>
              </span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-emerald-600 text-white font-medium">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">SEO</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 mb-8">
            <ArrowLeft size={14} /> Back
          </Link>

          <AnimatePresence mode="wait">
            {!loading ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Package size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Product Research</h1>
                    <p className="text-sm text-neutral-500">Real-time market intelligence, competitor data, and profit forecasts.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="glass rounded-2xl p-6 space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">Product Niche</label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g. wireless earbuds, yoga mats..."
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="glass rounded-2xl p-6 space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">Target Country</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCountry(c.code)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-xs ${
                            country === c.code
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-neutral-800 hover:border-neutral-700 text-neutral-400'
                          }`}
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-medium">{c.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-lg"
                  >
                    Generate Product Report
                    <ChevronRight size={18} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="glass rounded-3xl p-12 text-center space-y-8">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp size={28} className="text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Analyzing Market Data</h2>
                  <p className="text-neutral-500 text-sm">Scanning products, competitors & trends...</p>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
