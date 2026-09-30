'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  Loader2, Trash2, Download, Edit, Eye, Search, TrendingUp, FileText,
  RefreshCw, AlertTriangle, MessageSquare, Gauge, LayoutDashboard,
  Clock, Shield, ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://marketmuse-pro-backend-production-fd01.up.railway.app/api';

const countryFlags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

const reportTypes = [
  { id: 'all', label: 'All', icon: LayoutDashboard },
  { id: 'seo', label: 'SEO', icon: TrendingUp },
  { id: 'product', label: 'Product', icon: FileText },
  { id: 'technical-seo', label: 'Tech SEO', icon: Gauge },
  { id: 'brand-protection', label: 'Brand', icon: Shield },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const isTechnicalSEO = (r: any) =>
  r.type === 'technical_seo' ||
  r.type === 'technical' ||
  (r.type === 'seo' && (r.data?.subtype === 'technical' || r.data?.subtype === 'technical-business'));

const isBrandProtection = (r: any) =>
  r.type === 'brand_protection' || r.type === 'brand';

const getReportTypeInfo = (r: any) => {
  if (isBrandProtection(r)) {
    return {
      label: 'Brand Protection',
      icon: Shield,
      accent: 'var(--accent-red)',
      bg: 'bg-[var(--accent-red)]/10',
      text: 'text-[var(--accent-red)]',
      badge: 'critical' as const,
    };
  }
  if (isTechnicalSEO(r)) {
    return {
      label: 'Technical SEO',
      icon: Gauge,
      accent: 'var(--accent-purple)',
      bg: 'bg-[var(--accent-purple)]/10',
      text: 'text-[var(--accent-purple)]',
      badge: 'purple' as const,
    };
  }
  if (r.type === 'product') {
    return {
      label: 'Product',
      icon: FileText,
      accent: 'var(--accent-emerald)',
      bg: 'bg-[var(--accent-emerald)]/10',
      text: 'text-[var(--accent-emerald)]',
      badge: 'emerald' as const,
    };
  }
  return {
    label: 'SEO',
    icon: TrendingUp,
    accent: 'var(--accent-indigo)',
    bg: 'bg-[var(--accent-indigo)]/10',
    text: 'text-[var(--accent-indigo)]',
    badge: 'indigo' as const,
  };
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDate, setSortDate] = useState('desc');
  const [filterType, setFilterType] = useState('all');

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newMarkdown, setNewMarkdown] = useState('');
  const [newRemark, setNewRemark] = useState('');

  // Delete Modal
  const [deleteModalReport, setDeleteModalReport] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch Reports ──
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reports?limit=100`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ── Handlers ──
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
      a.download = `MusePRO_${niche.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('TXT downloaded');
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
        body: JSON.stringify({
          clientName: newClientName,
          markdown: newMarkdown,
          remark: newRemark,
        }),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Report updated');
      setEditModal(false);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalReport) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/reports/${deleteModalReport._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Report deleted');
      setDeleteModalReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filtered Reports ──
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (filterType === 'technical-seo') return isTechnicalSEO(r);
        if (filterType === 'brand-protection') return isBrandProtection(r);
        if (filterType !== 'all' && r.type !== filterType) return false;
        if (searchQuery && !r.niche.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortDate === 'asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [reports, filterType, searchQuery, sortDate]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = reports.length;
    const seo = reports.filter((r) => r.type === 'seo' && !isTechnicalSEO(r)).length;
    const product = reports.filter((r) => r.type === 'product').length;
    const tech = reports.filter(isTechnicalSEO).length;
    const brand = reports.filter(isBrandProtection).length;
    return { total, seo, product, tech, brand };
  }, [reports]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* Subtle top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[var(--accent-indigo)]/5 to-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 py-10">
          {/* ── Exit Nav ── */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={13} />
            Back to Home
          </Link>

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-[32px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[40px]">
                Report History
              </h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Track, edit, and export your intelligence reports.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={fetchReports}
              icon={<RefreshCw size={14} className="transition-transform group-hover:rotate-180" />}
            >
              Refresh
            </Button>
          </motion.div>

          {/* ── Stats Cards ── */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: 'Total', value: stats.total, accent: 'var(--text-primary)' },
              { label: 'SEO', value: stats.seo, accent: 'var(--accent-indigo)' },
              { label: 'Product', value: stats.product, accent: 'var(--accent-emerald)' },
              { label: 'Tech SEO', value: stats.tech, accent: 'var(--accent-purple)' },
              { label: 'Brand', value: stats.brand, accent: 'var(--accent-red)' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card padding="md" variant="default">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p
                    className="mt-2 font-mono text-[24px] font-medium leading-none"
                    style={{ color: stat.accent }}
                  >
                    {stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Filter Tabs ── */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {reportTypes.map((type) => {
              const isActive = filterType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-[12px] font-medium transition-all ${
                    isActive
                      ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-base)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <type.icon size={12} />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* ── Search & Sort ── */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search by niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
              />
            </div>
            <select
              value={sortDate}
              onChange={(e) => setSortDate(e.target.value)}
              className="rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* ── Reports List ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--accent-indigo)]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] py-16 text-center"
            >
              <div className="mb-4 text-5xl">📭</div>
              <p className="text-[16px] font-medium text-[var(--text-primary)]">No reports found</p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                Try adjusting filters or create a new report.
              </p>
              <Link href="/seo-report">
                <Button variant="primary" size="md" className="mt-6">
                  Create Report
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredReports.map((r, index) => {
                  const info = getReportTypeInfo(r);
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={r._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.02 }}
                      className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] p-4 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]"
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 h-full w-[3px]"
                        style={{ background: info.accent }}
                      />

                      {/* Left: Info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3 pl-2">
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] ${info.bg}`}
                        >
                          <Icon size={16} className={info.text} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-[14px] font-medium text-[var(--text-primary)]">
                              {r.niche}
                            </h3>
                            <Badge variant={info.badge} size="sm">
                              {info.label}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                            <span>
                              {countryFlags[r.country] || '🌍'} {(r.country || '').toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                            {r.updatedAt &&
                              new Date(r.updatedAt).getTime() >
                                new Date(r.createdAt).getTime() + 1000 && (
                                <span className="text-[var(--accent-indigo)]">
                                  Edited {new Date(r.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                          </div>
                          {r.remark && (
                            <div className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-[4px] border border-[var(--accent-indigo)]/20 bg-[var(--accent-indigo)]/5 px-2 py-1">
                              <MessageSquare size={10} className="mt-0.5 flex-shrink-0 text-[var(--accent-indigo)]" />
                              <span className="text-[11px] text-[var(--text-secondary)]">
                                {r.remark}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link href={`/dashboard/${r._id}`} title="View">
                          <Button variant="ghost" size="icon-sm">
                            <Eye size={13} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(r)}
                          title="Edit"
                        >
                          <Edit size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e: any) => handleDownload(e, r._id, r.niche)}
                          title="Download"
                        >
                          <Download size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteModalReport(r)}
                          title="Delete"
                          className="text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] p-6"
            >
              <h2 className="mb-5 text-[18px] font-medium text-[var(--text-primary)]">
                Edit Report
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Report Content (Markdown)
                  </label>
                  <textarea
                    value={newMarkdown}
                    onChange={(e) => setNewMarkdown(e.target.value)}
                    rows={10}
                    className="w-full resize-none rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 font-mono text-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="e.g. Updated keywords for 2026"
                    className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" size="md" onClick={() => setEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteModalReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setDeleteModalReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-red)]/10">
                <AlertTriangle size={28} className="text-[var(--accent-red)]" />
              </div>
              <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
                Delete Report?
              </h2>
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  {deleteModalReport.niche}
                </span>{' '}
                will be permanently deleted. This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setDeleteModalReport(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={confirmDelete}
                  loading={isDeleting}
                  icon={!isDeleting ? <Trash2 size={13} /> : undefined}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}
