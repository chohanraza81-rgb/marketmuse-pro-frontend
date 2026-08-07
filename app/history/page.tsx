'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Search, FileText, TrendingUp, Clock, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';

interface Report {
  _id: string;
  type: string;
  niche: string;
  country: string;
  createdAt: string;
}

const flags: Record<string, string> = {
  us:'🇺🇸', gb:'🇬🇧', ca:'🇨🇦', au:'🇦🇺', de:'🇩🇪', sg:'🇸🇬',
  sa:'🇸🇦', ae:'🇦🇪', pk:'🇵🇰', in:'🇮🇳', tr:'🇹🇷', my:'🇲🇾',
};

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  // ✅ Use environment variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reports?limit=100`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await fetch(`${API_URL}/reports/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      setReports(prev => prev.filter(r => !selected.includes(r._id)));
      setSelected([]);
      toast.success(`${selected.length} reports deleted`);
    } catch {
      toast.error('Bulk delete failed');
    }
  };

  const filtered = reports.filter(r => {
    if (filter === 'product' && r.type !== 'product') return false;
    if (filter === 'seo' && r.type !== 'seo') return false;
    if (search && !r.niche.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getLink = (r: Report) => r.type === 'product' ? `/product-research/${r._id}` : `/seo-report/${r._id}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
              <span className="font-bold text-lg">MarketMuse<span className="text-indigo-400"> PRO</span></span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/product-research" className="text-sm text-neutral-400 hover:text-white transition-colors">Product</Link>
            <Link href="/seo-report" className="text-sm text-neutral-400 hover:text-white transition-colors">SEO</Link>
            <Link href="/history" className="text-sm px-4 py-2 rounded-full bg-indigo-600 text-white font-medium">History</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 mb-6"><ArrowLeft size={14} /> Back</Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Report History</h1>
            <p className="text-neutral-500 text-sm">{reports.length} reports total</p>
          </div>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium"><Trash2 size={14} /> Delete {selected.length} selected</button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {['all', 'product', 'seo'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>{f}</button>
          ))}
          <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 flex-1 max-w-xs">
            <Search size={16} className="text-neutral-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-white placeholder-neutral-600 w-full text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 bg-neutral-900 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center"><FileText size={40} className="text-neutral-700 mx-auto mb-4" /><p className="text-neutral-500">No reports found.</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}
                className="glass rounded-xl p-4 flex items-center justify-between glass-hover group">
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={selected.includes(r._id)} onChange={() => setSelected(prev => prev.includes(r._id) ? prev.filter(id => id !== r._id) : [...prev, r._id])} className="rounded border-neutral-700" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type==='product'?'bg-emerald-500/10':'bg-indigo-500/10'}`}>
                    {r.type==='product' ? <TrendingUp size={18} className="text-emerald-400" /> : <Search size={18} className="text-indigo-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type==='product'?'bg-emerald-500/20 text-emerald-400':'bg-indigo-500/20 text-indigo-400'}`}>{r.type==='product'?'Product':'SEO'}</span>
                      <span>{flags[r.country]}</span>
                    </div>
                    <p className="font-medium mt-1 capitalize">{r.niche}</p>
                    <p className="text-xs text-neutral-600"><Clock size={10} className="inline mr-1" />{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={getLink(r)} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:text-white flex items-center gap-1"><ExternalLink size={12} /> View</Link>
                  <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
