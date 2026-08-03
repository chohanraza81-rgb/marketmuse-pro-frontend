'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Search, FileText, TrendingUp, Clock, Globe, Trash2, ExternalLink } from 'lucide-react';

interface Report {
  _id: string;
  type: string;
  niche: string;
  country: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const flags: Record<string, string> = { us: '🇺🇸', pk: '🇵🇰', gb: '🇬🇧', ae: '🇦🇪', sa: '🇸🇦' };

  useEffect(() => {
    fetch('https://marketmuse-pro-backend-production.up.railway.app/api/reports?limit=50')
      .then(r => r.json())
      .then(data => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r => {
    if (filter === 'product' && r.type !== 'product') return false;
    if (filter === 'seo' && r.type !== 'seo') return false;
    if (search && !r.niche.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">MarketMuse<span className="text-indigo-400"> PRO</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/product-research" className="text-sm text-neutral-400 hover:text-white transition-colors">Product</Link>
            <Link href="/seo-report" className="text-sm text-neutral-400 hover:text-white transition-colors">SEO</Link>
            <Link href="/history" className="text-sm px-4 py-2 rounded-full bg-indigo-600 text-white font-medium">History</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Report History</h1>
            <p className="text-neutral-500 text-sm">{reports.length} reports generated</p>
          </div>
          <div className="flex items-center gap-3">
            {['all', 'product', 'seo'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Search size={16} className="text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by niche..."
            className="bg-transparent outline-none text-white placeholder-neutral-600 w-full text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <FileText size={40} className="text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">No reports yet.</p>
            <Link href="/seo-report" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">Generate your first report →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((report, i) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-4 flex items-center justify-between glass-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    report.type === 'product' ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
                  }`}>
                    {report.type === 'product' ? (
                      <TrendingUp size={18} className="text-emerald-400" />
                    ) : (
                      <Search size={18} className="text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        report.type === 'product' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {report.type === 'product' ? 'Product' : 'SEO'}
                      </span>
                      <span className="text-sm">{flags[report.country]}</span>
                    </div>
                    <p className="font-medium mt-1 capitalize">{report.niche}</p>
                    <p className="text-xs text-neutral-600 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${report.type}-research/${report._id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:text-white flex items-center gap-1"
                >
                  View <ExternalLink size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
