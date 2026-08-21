'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  Pencil,
  X,
  AlertTriangle,
  Save,
  Download,
} from 'lucide-react';
import LiveStatus from '@/components/LiveStatus';

interface Report {
  _id: string;
  type: 'product' | 'seo';
  niche: string;
  country: string;
  createdAt: string;
  clientName?: string;
  markdown?: string;
}

const flags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

const BACKEND_URL = 'https://marketmuse-pro-backend-production.up.railway.app/api';
const PER_PAGE = 20;

type SortKey = 'date' | 'niche' | 'type';
type SortDir = 'asc' | 'desc';

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  // Modal States
  const [editModal, setEditModal] = useState<Report | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editMarkdown, setEditMarkdown] = useState('');
  const [deleteModal, setDeleteModal] = useState<Report | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/reports?limit=500`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Sorting
  const sortedReports = [...reports].sort((a, b) => {
    let valA: string | number = 0;
    let valB: string | number = 0;
    if (sortKey === 'date') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    } else if (sortKey === 'niche') {
      valA = a.niche.toLowerCase();
      valB = b.niche.toLowerCase();
    } else if (sortKey === 'type') {
      valA = a.type;
      valB = b.type;
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter
  const filtered = sortedReports.filter((r) => {
    if (filter === 'product' && r.type !== 'product') return false;
    if (filter === 'seo' && r.type !== 'seo') return false;
    if (search && !r.niche.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(0, page * PER_PAGE);

  // Handlers
  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await fetch(`${BACKEND_URL}/reports/${deleteModal._id}`, { method: 'DELETE' });
      setReports((prev) => prev.filter((r) => r._id !== deleteModal._id));
      setSelected((prev) => prev.filter((sid) => sid !== deleteModal._id));
      setDeleteModal(null);
    } catch {}
    finally { setIsDeleting(false); }
  };

  const openEditModal = (report: Report) => {
    setEditModal(report);
    setEditClientName(report.clientName || '');
    setEditMarkdown(report.markdown || '');
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setIsSaving(true);
    try {
      // ✅ PATCH request updates the SAME report (No Duplicate)
      const res = await fetch(`${BACKEND_URL}/reports/${editModal._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: editClientName, markdown: editMarkdown }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      
      // Update in local state
      setReports((prev) => prev.map((r) => r._id === updated._id ? updated : r));
      setEditModal(null);
    } catch {}
    finally { setIsSaving(false); }
  };

  const handleExportTxt = (report: Report) => {
    const clientPrefix = report.clientName ? `${report.clientName.replace(/\s+/g, '_')}_` : '';
    const blob = new Blob([report.markdown || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MusePRO_Report_${clientPrefix}${report.niche}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await fetch(`${BACKEND_URL}/reports/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      setReports((prev) => prev.filter((r) => !selected.includes(r._id)));
      setSelected([]);
    } catch {}
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const productCount = reports.filter((r) => r.type === 'product').length;
  const seoCount = reports.filter((r) => r.type === 'seo').length;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
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

      {/* Content */}
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        {/* Header & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Report History</h1>
            <p className="text-sm text-neutral-400 mt-1">{reports.length} reports total</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#171717] border border-neutral-800 rounded-xl px-5 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold font-mono">{productCount}</p>
              <p className="text-xs text-neutral-400 mt-1">Product</p>
            </div>
            <div className="bg-[#171717] border border-neutral-800 rounded-xl px-5 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold font-mono">{seoCount}</p>
              <p className="text-xs text-neutral-400 mt-1">SEO</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Filter buttons */}
          <div className="flex rounded-lg overflow-hidden border border-neutral-800">
            {['all', 'product', 'seo'].map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[#171717] border border-neutral-800 rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search size={16} className="text-neutral-500" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search niche..." className="bg-transparent outline-none text-white placeholder-neutral-600 w-full text-sm" />
          </div>

          {/* Sort */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#171717] border border-neutral-800 text-sm text-neutral-300 hover:text-white transition-colors">
              <ArrowUpDown size={14} /> Sort: {sortKey} {sortDir === 'asc' ? '↑' : '↓'}
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-[#171717] border border-neutral-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {(['date', 'niche', 'type'] as SortKey[]).map((key) => (
                <button key={key} onClick={() => toggleSort(key)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 first:rounded-t-xl last:rounded-b-xl capitalize">
                  {key} {sortKey === key && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh */}
          <button onClick={fetchReports} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>

          {/* Bulk delete */}
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
              <Trash2 size={14} /> Delete {selected.length}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#171717] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchReports} className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No reports found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-[#171717] border border-neutral-800 hover:border-neutral-700 transition-colors group">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={selected.includes(r._id)}
                      onChange={() => setSelected((prev) => prev.includes(r._id) ? prev.filter((id) => id !== r._id) : [...prev, r._id])}
                      className="rounded border-neutral-700 bg-transparent" />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type === 'product' ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
                      {r.type === 'product' ? <TrendingUp size={18} className="text-emerald-400" /> : <Search size={18} className="text-indigo-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === 'product' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          {r.type === 'product' ? 'Product' : 'SEO'}
                        </span>
                        <span className="text-sm">{flags[r.country]}</span>
                        {r.clientName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 font-medium">
                            {r.clientName}
                          </span>
                        )}
                      </div>
                      <p className="font-medium mt-1 capitalize">{r.niche}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/report/${r._id}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:text-white flex items-center gap-1">
                      <ExternalLink size={12} /> View
                    </Link>
                    <button onClick={() => openEditModal(r)} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:text-white flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleExportTxt(r)} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:text-white flex items-center gap-1">
                      <Download size={12} /> .txt
                    </button>
                    <button onClick={() => setDeleteModal(r)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div className="text-center mt-6">
                <button onClick={() => setPage((p) => p + 1)} className="px-6 py-2 rounded-lg bg-[#171717] border border-neutral-800 text-white text-sm hover:bg-neutral-800 transition-colors">
                  Load More ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== PREMIUM MODALS ==================== */}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0F0F14] border border-neutral-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h3 className="text-lg font-bold">Edit Report</h3>
                <button onClick={() => setEditModal(null)} className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Agency / Client Name</label>
                  <input type="text" value={editClientName} onChange={(e) => setEditClientName(e.target.value)} placeholder="e.g. Tech Solutions Agency" className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Report Content (Markdown)</label>
                  <textarea value={editMarkdown} onChange={(e) => setEditMarkdown(e.target.value)} rows={15} className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white font-mono text-sm" />
                </div>
                <p className="text-xs text-neutral-500">Saving updates the existing file (no duplicate created).</p>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-neutral-800">
                <button onClick={() => setEditModal(null)} className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50">
                  {isSaving ? <span className="animate-spin"><RefreshCw size={14} /></span> : <Save size={14} />} Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0F0F14] border border-neutral-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={30} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold">Are you sure?</h3>
                <p className="text-neutral-400 text-sm">This action cannot be undone. This will permanently delete the "<span className="text-white font-bold">{deleteModal.niche}</span>" report.</p>
                <div className="flex justify-center gap-3 pt-4">
                  <button onClick={() => setDeleteModal(null)} className="px-6 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-medium">Cancel</button>
                  <button onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50">
                    {isDeleting ? <span className="animate-spin"><RefreshCw size={14} /></span> : <Trash2 size={14} />} Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
