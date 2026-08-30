'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Loader2, LayoutDashboard, TrendingUp, FileText, Gauge, 
  Search, ArrowRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const countryFlags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾'
};

export default function DashboardPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_URL}/reports?limit=50`);
        const data = await res.json();
        setReports(data.reports || []);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => 
    !searchQuery || r.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
        <p className="text-neutral-400">Loading dashboards...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Home</Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg">Dashboard</Link>
            <Link href="/history" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">History</Link>
            <Link href="/seo-report" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">SEO</Link>
            <Link href="/product-research" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Product</Link>
            <Link href="/technical-seo" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Tech SEO</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <LayoutDashboard size={14} className="text-indigo-400" />
            <span className="text-xs uppercase tracking-widest text-neutral-300">Client Dashboards</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Visual Reports
          </h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Interactive charts, PDF export, email sharing, and shareable links for your clients.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder:text-neutral-500 transition-all backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold text-neutral-400">No dashboards available</p>
            <p className="text-neutral-500 mt-2">Create a report first to view its dashboard.</p>
            <Link href="/seo-report" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold transition-all">
              Create Report <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReports.map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={`/dashboard/${r._id}`}
                    className="block p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        r.type === 'product' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : r.data?.subtype === 'technical'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {r.type === 'product' ? <FileText size={20} /> : r.data?.subtype === 'technical' ? <Gauge size={20} /> : <TrendingUp size={20} />}
                      </div>
                      <ArrowRight size={18} className="text-neutral-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors">{r.niche}</h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>{countryFlags[r.country] || '🌍'}</span>
                      <span>{r.country?.toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
