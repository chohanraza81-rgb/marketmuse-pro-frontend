'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Trash2, Download, Edit, Eye, Search, TrendingUp, FileText, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

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

  // ✅ FETCH REPORTS
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

  // ✅ FIX: Robust .txt Download
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('TXT downloaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Download failed');
    }
  };

  // ✅ FIX: Robust Edit Modal Open
  const handleEdit = async (report: any) => {
    setEditingReportId(report._id);
    setNewClientName(report.clientName || '');
    setEditModal(true);
    try {
      const res = await fetch(`${API_URL}/reports/${report._id}`);
      const fullData = await res.json();
      setNewMarkdown(fullData.markdown || '');
    } catch {
      setNewMarkdown('');
    }
  };

  // ✅ FIX: Robust Edit Save
  const handleSaveChanges = async () => {
    if (!editingReportId) return;
    try {
      const res = await fetch(`${API_URL}/reports/${editingReportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: newClientName, markdown: newMarkdown })
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Report updated successfully');
      setEditModal(false);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`${API_URL}/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Report deleted');
      fetchReports();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ✅ FILTERING LOGIC
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
    <main className="min-h-screen bg-[#0A0A0A] text-white p-6 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Report History</h1>
          <button onClick={fetchReports} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400">TOTAL REPORTS</p>
            <p className="text-2xl font-bold font-mono mt-1">{totalReports}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400">SEO REPORTS</p>
            <p className="text-2xl font-bold font-mono mt-1 text-indigo-400">{seoCount}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400">PRODUCT REPORTS</p>
            <p className="text-2xl font-bold font-mono mt-1 text-emerald-400">{productCount}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <Search size={16} className="absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by niche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 rounded-xl bg-[#0F0F14] border border-neutral-800 focus:border-indigo-500 outline-none text-white"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 rounded-xl bg-[#0F0F14] border border-neutral-800 focus:border-indigo-500 outline-none text-white"
          >
            <option value="all">All Types</option>
            <option value="seo">SEO Reports</option>
            <option value="product">Product Reports</option>
          </select>
          <select
            value={sortDate}
            onChange={(e) => setSortDate(e.target.value)}
            className="p-3 rounded-xl bg-[#0F0F14] border border-neutral-800 focus:border-indigo-500 outline-none text-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">No reports found.</div>
          ) : (
            filteredReports.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-[#0F0F14] border border-neutral-800 hover:border-neutral-700 transition-all">
                <div className="flex items-center gap-3">
                  {r.type === 'seo' ? <TrendingUp size={18} className="text-indigo-400" /> : <FileText size={18} className="text-emerald-400" />}
                  <div>
                    <h3 className="font-semibold capitalize">{r.niche}</h3>
                    <p className="text-xs text-neutral-500">
                      {r.type === 'seo' ? 'SEO' : 'Product'} • {r.country.toUpperCase()} • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/report/${r._id}`} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"><Eye size={16} /></Link>
                  <button onClick={() => handleEdit(r)} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"><Edit size={16} /></button>
                  <button onClick={(e) => handleDownload(e, r._id, r.niche)} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"><Download size={16} /></button>
                  <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-[#0F0F14] border border-neutral-800 p-6">
            <h2 className="text-xl font-bold mb-4">Edit Report</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400">Agency / Client Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400">Report Content (Markdown)</label>
                <textarea
                  value={newMarkdown}
                  onChange={(e) => setNewMarkdown(e.target.value)}
                  rows={15}
                  className="w-full mt-1 p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditModal(false)} className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm">Cancel</button>
              <button onClick={handleSaveChanges} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
