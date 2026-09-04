'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, Globe, Sparkles, Loader2, ArrowRight,
  LayoutDashboard, History, Settings, BarChart3, TrendingUp, Zap
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

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

const progressMessages = [
  'Connecting to data sources...',
  'Fetching product data...',
  'Analyzing competitors...',
  'Generating financial models...',
  'Finalizing report...',
];

export default function ProductResearchPage() {
  const router = useRouter();
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgressStep(prev => (prev < progressMessages.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) {
      toast.error('Please enter a product or niche.');
      return;
    }
    setLoading(true);
    setProgressStep(0);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), country }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      toast.success('Report generated successfully!');
      setTimeout(() => router.push(`/dashboard/${data.id}`), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-emerald-600/20 blur-[130px] pointer-events-none" />
      
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Home</Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link href="/history" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <History size={14} /> History
            </Link>
            <Link href="/product-research" className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-lg flex items-center gap-1.5">
              <BarChart3 size={14} /> Product
            </Link>
            <Link href="/seo-report" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <TrendingUp size={14} /> SEO Report
            </Link>
            <Link href="/technical-seo" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Zap size={14} /> Tech SEO
            </Link>
            <Link href="/agency-settings" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Settings size={14} /> Agency
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Package size={14} className="text-emerald-400" />
            <span className="text-xs uppercase tracking-widest text-neutral-300">Product Research Report</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Find Winning Products
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-xl mx-auto">
            Enter a product niche and target market. Get competitor analysis, sourcing insights, and financial projections.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Product / Niche <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package size={18} className="absolute left-4 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., home decor, pet supplies, tech gadgets"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white placeholder:text-neutral-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Target Market <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      country === c.code
                        ? 'bg-emerald-600/30 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 font-bold text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Generate Report <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </motion.form>
      </section>

      {/* Premium Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0F0F14] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-emerald-500/20"
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-t-4 border-emerald-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <Package size={40} className="absolute inset-0 m-auto text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Generating Report</h3>
            <p className="text-neutral-400 text-sm mb-6">{progressMessages[progressStep]}</p>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${((progressStep + 1) / progressMessages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <Toaster richColors position="top-right" />
    </main>
  );
}
