'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Loader2, Trash2, Download, Edit, Eye, Search, TrendingUp, FileText, 
  RefreshCw, AlertTriangle, MessageSquare, Sparkles, Gauge, LayoutDashboard,
  Filter, ArrowUpDown, Calendar, Clock, Globe, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveStatus from '@/components/LiveStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const countryFlags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾'
};

const reportTypes = [
  { id: 'all', label: 'All Reports', icon: LayoutDashboard, color: 'from-indigo-500 to-purple-600' },
  { id: 'seo', label: 'SEO Reports', icon: TrendingUp, color: 'from-blue-500 to-indigo-600' },
  { id: 'product', label: 'Product Reports', icon: FileText, color: 'from-emerald-500 to-green-600' },
  { id: 'technical-seo', label: 'Technical SEO', icon: Gauge, color: 'from-orange-500 to-red-600' },
];

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
  const [newRemark, setNewRemark] = useState('');

  // Delete Modal States
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
    setNewRemark(report.remark || '');
    setEditModal(true);
    try {
      const res = await fetch(`${API_URL}/reports/${report._id}`);
      const fullData = await res.json();
      setNewMarkdown(fullData.markdown || '');
    } catch {
      setNewMarkdown('');
    }
  };

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
      if (filterType === 'technical-seo' && r.type !== 'seo' && !r.data?.subtype) return false;
      if (filterType === 'technical-seo' && r.type === 'seo' && r.data?.subtype !== 'technical') return false;
      if (filterType !== 'all' && filterType !== 'technical-seo' && r.type !== filterType) return false;
      if (searchQuery && !r.niche.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortDate === 'asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalReports = reports.length;
  const seoCount = reports.filter((r) => r.type === 'seo' && !r.data?.subtype).length;
  const productCount = reports.filter((r) => r.type === 'product').length;
  const technicalCount = reports.filter((r) => r.type === 'seo' && r.data?.subtype === 'technical').length;

  if (loading) return (
    <main className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
        <p className="text-neutral-400">Loading reports...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* 🧭 GLOBAL NAVBAR */}
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
            <Link href="/dashboard" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Dashboard</Link>
            <Link href="/seo-report" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">SEO</Link>
            <Link href="/product-research" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Product</Link>
            <Link href="/technical-seo" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Tech SEO</Link>
            <Link href="/history" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg">History</Link>
            <Link href="/agency-settings" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Agency</Link>
          </div>

          <LiveStatus />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Report History
            </h1>
            <p className="text-neutral-400 mt-2 text-sm md:text-base">
              Agency-level intelligence. Track, edit, and export your campaigns.
            </p>
          </div>
          <button 
            onClick={fetchReports} 
            className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 text-neutral-300 hover:text-white"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Reports', value: totalReports, color: 'from-indigo-500 to-purple-600', icon: LayoutDashboard, barColor: 'bg-indigo-500', width: '100%' },
            { label: 'SEO Reports', value: seoCount, color: 'from-blue-500 to-indigo-600', icon: TrendingUp, barColor: 'bg-blue-500', width: '75%' },
            { label: 'Product Reports', value: productCount, color: 'from-emerald-500 to-green-600', icon: FileText, barColor: 'bg-emerald-500', width: '60%' },
            { label: 'Technical SEO', value: technicalCount, color: 'from-orange-500 to-red-600', icon: Gauge, barColor: 'bg-orange-500', width: '45%' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">{item.label}</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                  <item.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-4xl font-black font-mono">{item.value}</p>
              <div className="mt-4 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: item.width }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className={`h-full ${item.barColor} rounded-full`} 
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filterType === type.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex-1 min-w-[250px] relative">
            <Search size={16} className="absolute left-4 top-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder:text-neutral-500 transition-all backdrop-blur-xl"
            />
          </div>
          <select 
            value={sortDate} 
            onChange={(e) => setSortDate(e.target.value)} 
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 outline-none text-white cursor-pointer transition-all backdrop-blur-xl"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          <AnimatePresence>
          {filteredReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-neutral-500"
            >
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold text-neutral-400">No reports found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new report.</p>
            </motion.div>
          ) : (
            filteredReports.map((r, index) => (
              <motion.div 
                key={r._id} 
                layout 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group overflow-hidden"
              >
                {/* Gradient accent */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  r.type === 'product' 
                    ? 'bg-gradient-to-b from-emerald-500 to-green-600' 
                    : r.data?.subtype === 'technical'
                      ? 'bg-gradient-to-b from-orange-500 to-red-600'
                      : 'bg-gradient-to-b from-indigo-500 to-purple-600'
                }`} />
                
                <div className="flex items-center gap-4 pl-3">
                  <div className={`p-3 rounded-xl ${
                    r.type === 'product' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : r.data?.subtype === 'technical'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {r.type === 'product' ? <FileText size={20} /> : r.data?.subtype === 'technical' ? <Gauge size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-white transition-colors">{r.niche}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">
                        {r.type === 'product' ? 'Product' : r.data?.subtype === 'technical' ? 'Technical SEO' : 'SEO'}
                      </p>
                      <span className="text-neutral-700">•</span>
                      <p className="text-xs text-neutral-500">
                        {countryFlags[r.country] || '🌍'} {r.country.toUpperCase()}
                      </p>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(r.createdAt).toLocaleString()}
                      {r.updatedAt && new Date(r.updatedAt).getTime() > new Date(r.createdAt).getTime() + 1000 && (
                        <span className="ml-2 text-indigo-400">| Updated: {new Date(r.updatedAt).toLocaleString()}</span>
                      )}
                    </p>
                    {r.remark && (
                      <p className="text-xs mt-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg px-2 py-1 max-w-lg">
                        <MessageSquare size={12} className="inline mr-1" /> {r.remark}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/dashboard/${r._id}`} 
                    className="p-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all"
                    title="View Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                  <Link 
                    href={`/report/${r._id}`} 
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                    title="View Report"
                  >
                    <Eye size={18} />
                  </Link>
                  <button 
                    onClick={() => handleEdit(r)} 
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleDownload(e, r._id, r.niche)} 
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(r)} 
                    className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
      {editModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="w-full max-w-3xl rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
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
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Update Remarks</label>
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
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </main>
  );
}
