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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';
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
      toast.success('Product report generated successfully', { icon: '✅' });
      setTimeout(() => router.push(`/report/${report._id}`), 500);
    } catch (err: any) {
      toast.error(err.message || 'Generation failed', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar - Unified with SEO Page */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-600 text-white">Product</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Package size={24} className="text-emerald-400" />
          <h1 className="text-2xl font-bold">Product Research Report</h1>
        </div>
        <p className="text-neutral-400 text-sm mb-8">
          Real-time market analysis, opportunity scoring, and competitive intelligence for your next winning product.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Niche Input */}
          <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800/50">
            <label className="block text-sm font-medium mb-2">Niche / Topic</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. organic skincare, smart home devices"
              className="w-full p-4 rounded-xl bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white transition-colors placeholder:text-neutral-500"
              disabled={loading}
            />
          </div>

          {/* Country Selection - 12 Countries Grid */}
          <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800/50">
            <label className="block text-sm font-medium mb-3">Target Country</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${
                    country === c.code
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-neutral-800 bg-[#0A0A0A] hover:bg-neutral-800 text-neutral-400'
                  }`}
                  disabled={loading}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-[10px] font-medium uppercase">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading || !niche.trim()}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating Product Report...
              </>
            ) : (
              <>
                Generate Product Report <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
