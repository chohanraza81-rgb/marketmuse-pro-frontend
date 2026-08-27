'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Trash2, Download, Edit, Eye, Search, TrendingUp, FileText, RefreshCw, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveStatus from '@/components/LiveStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const countryFlags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾'
};

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDate, setSortDate] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  
  // Edit Modal States
  const [editModal, setEditModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [newClientName, setNewClientName] = useState('');
  const [newMarkdown, setNewMarkdown] = useState('');
  const [newRemark, setNewRemark] = useState(''); // ✅ Remark State

  // Advanced Delete Modal States
  const [deleteModalReport, setDeleteModalReport] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reports?limit=100`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDownload = async (e: React.MouseEvent, id: string, niche: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/reports/${id}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      const blob = new Blob([data.markdown], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MusePRO_Report_${niche}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('TXT downloaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Download failed');
    }
  };

  const handleEdit = async (report: any) => {
    setEditingReportId(report._id);
    setNewClientName(report.clientName || '');
    setNewRemark(report.remark || ''); // ✅ Load previous remark
    setEditModal(true);
    try {
      const res = await fetch(`${API_URL}/reports/${report._id}`);
      const fullData = await res.json();
      setNewMarkdown(fullData.markdown || '');
    } catch {
      setNewMarkdown('');
    }
  };

  // ✅ Save Changes with Remark
  const handleSaveChanges = async () => {
    if (!editingReportId) return;
    try {
      const res = await fetch(`${API_URL}/reports/${editingReportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: newClientName, markdown: newMarkdown, remark: newRemark })
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Report updated successfully');
      setEditModal(false);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDeleteModal = (report: any) => { setDeleteModalReport(report); };
  const confirmDelete = async () => {
    if (!deleteModalReport) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/reports/${deleteModalReport._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Report deleted successfully');
      setDeleteModalReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setIsDeleting(false); }
  };

  const filteredReports = reports
    .filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (searchQuery && !r.niche.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortDate === 'asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalReports = reports.length;
  const seoCount = reports.filter((r) => r.type === 'seo').length;
  const productCount = reports.filter((r) => r.type === 'product').length;

  if (loading) return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-400" /></main>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 blur-3xl pointer-events-none" />

      {/* 🧭 GLOBAL NAVBAR */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Home</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO Report</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Product Report</Link>
            <Link href="/technical-seo" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Tech SEO</Link>
            <Link href="/history" className="text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">History</Link>
            <Link href="/agency-settings" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Agency</Link>
            <LiveStatus />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Report History</h1>
            <p className="text-neutral-400 mt-1 text-sm">Agency-level intelligence. Track, edit, and export your campaigns.</p>
          </div>
          <button onClick={fetchReports} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 text-neutral-300">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a24] to-[#0F0F14] border border-white/10 backdrop-blur-xl shadow-xl">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Total Reports</p>
            <p className="text-4xl font-bold font-mono mt-2">{totalReports}</p>
            <div className="mt-3 h-1 w-full bg-neutral-800 rounded-full"><div className="h-1 w-full bg-indigo-500 rounded-full" /></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a24] to-[#0F0F14] border border-white/10 backdrop-blur-xl shadow-xl">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">SEO Reports</p>
            <p className="text-4xl font-bold font-mono mt-2 text-indigo-400">{seoCount}</p>
            <div className="mt-3 h-1 w-full bg-neutral-800 rounded-full"><div className="h-1 w-2/3 bg-indigo-500 rounded-full" /></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a24] to-[#0F0F14] border border-white/10 backdrop-blur-xl shadow-xl">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Product Reports</p>
            <p className="text-4xl font-bold font-mono mt-2 text-emerald-400">{productCount}</p>
            <div className="mt-3 h-1 w-full bg-neutral-800 rounded-full"><div className="h-1 w-1/2 bg-emerald-500 rounded-full" /></div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex-1 min-w-[250px] relative">
            <Search size={16} className="absolute left-4 top-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F0F14]/80 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder:text-neutral-500 transition-all backdrop-blur-xl"
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-3 rounded-xl bg-[#0F0F14]/80 border border-white/10 focus:border-indigo-500/50 outline-none text-white cursor-pointer transition-all backdrop-blur-xl">
            <option value="all">All Types</option>
            <option value="seo">SEO Reports</option>
            <option value="product">Product Reports</option>
          </select>
          <select value={sortDate} onChange={(e) => setSortDate(e.target.value)} className="p-3 rounded-xl bg-[#0F0F14]/80 border border-white/10 focus:border-indigo-500/50 outline-none text-white cursor-pointer transition-all backdrop-blur-xl">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <AnimatePresence>
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">No reports found.</div>
          ) : (
            filteredReports.map((r) => (
              <motion.div key={r._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between p-5 rounded-2xl bg-[#0F0F14]/60 border border-white/5 backdrop-blur-xl hover:bg-[#0F0F14] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group">
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${r.type === 'seo' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                
                <div className="flex items-center gap-4 pl-2">
                  <div className={`p-3 rounded-xl ${r.type === 'seo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {r.type === 'seo' ? <TrendingUp size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-white transition-colors">{r.niche}</h3>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
                      {r.type === 'seo' ? 'SEO' : 'Product'} 
                      <span className="mx-2 text-neutral-700">•</span> 
                      {countryFlags[r.country] || '🌍'} <span className="ml-1">{r.country.toUpperCase()}</span>
                    </p>
                    {/* ✅ DATE AND TIME DISPLAY */}
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Created: {new Date(r.createdAt).toLocaleString()} 
                      {r.updatedAt && new Date(r.updatedAt).getTime() > new Date(r.createdAt).getTime() + 1000 && (
                        <span className="ml-2 text-indigo-400">| Updated: {new Date(r.updatedAt).toLocaleString()}</span>
                      )}
                    </p>
                    {/* ✅ REMARK DISPLAY */}
                    {r.remark && (
                      <p className="text-xs mt-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg px-2 py-1 max-w-lg">
                        <MessageSquare size={12} className="inline mr-1" /> {r.remark}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Link href={`/report/${r._id}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"><Eye size={18} /></Link>
                  <button onClick={() => handleEdit(r)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"><Edit size={18} /></button>
                  <button onClick={(e) => handleDownload(e, r._id, r.niche)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"><Download size={18} /></button>
                  <button onClick={() => openDeleteModal(r)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal with Remark */}
      <AnimatePresence>
      {editModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="w-full max-w-3xl rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Edit Report</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Agency / Client Name</label>
                <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-white/10 focus:border-indigo-500 outline-none text-white transition-all" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Report Content (Markdown)</label>
                <textarea value={newMarkdown} onChange={(e) => setNewMarkdown(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-white/10 focus:border-indigo-500 outline-none text-white font-mono text-sm transition-all resize-none" />
              </div>
              {/* ✅ REMARK INPUT */}
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Update Remarks (Why are you updating this?)</label>
                <input type="text" value={newRemark} onChange={(e) => setNewRemark(e.target.value)} placeholder="e.g. Updated keywords for 2026" className="w-full p-3 rounded-xl bg-[#0A0A0A] border border-white/10 focus:border-indigo-500 outline-none text-white transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-all">Cancel</button>
              <button onClick={handleSaveChanges} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">Save Changes</button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
      {deleteModalReport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#1a1a24] to-[#0F0F14] border border-red-500/20 p-8 shadow-2xl shadow-red-500/10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Delete Report?</h2>
            <p className="text-neutral-400 mb-8">
              Are you sure you want to permanently delete <br />
              <span className="font-bold text-white capitalize">"{deleteModalReport.niche}"</span>? 
              <br />This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteModalReport(null)} disabled={isDeleting} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </main>
  );
}
