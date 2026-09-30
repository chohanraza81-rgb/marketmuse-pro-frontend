'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  Search, TrendingUp, Package, Gauge, Shield,
  ArrowRight, Loader2, LayoutDashboard, ArrowLeft,
  Sparkles, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

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

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const isTechnicalSEO = (r: any) =>
  r.type === 'technical_seo' ||
  r.type === 'technical' ||
  (r.type === 'seo' && (r.data?.subtype === 'technical' || r.data?.subtype === 'technical-business'));

const isBrandProtection = (r: any) =>
  r.type === 'brand_protection' || r.type === 'brand';

const getTypeInfo = (r: any) => {
  if (isBrandProtection(r)) {
    return {
      label: 'Brand Protection',
      icon: Shield,
      accent: '#F85149',
      badge: 'critical' as const,
      bg: 'rgba(248,81,73,0.1)',
    };
  }
  if (isTechnicalSEO(r)) {
    return {
      label: 'Technical SEO',
      icon: Gauge,
      accent: '#A855F7',
      badge: 'purple' as const,
      bg: 'rgba(168,85,247,0.1)',
    };
  }
  if (r.type === 'product') {
    return {
      label: 'Product Intelligence',
      icon: Package,
      accent: '#10B981',
      badge: 'emerald' as const,
      bg: 'rgba(16,185,129,0.1)',
    };
  }
  return {
    label: 'SEO Research',
    icon: TrendingUp,
    accent: '#533AFD',
    badge: 'indigo' as const,
    bg: 'rgba(83,58,253,0.1)',
  };
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch Reports ──
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_URL}/reports?limit=50`);
        const data = await res.json();
        setReports(data.reports || []);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // ── Filtered Reports ──
  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    return reports.filter((r) =>
      r.niche.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

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

        <div className="relative mx-auto max-w-7xl px-6 py-10">
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
            className="mb-8"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3 py-1.5">
              <LayoutDashboard size={12} className="text-[var(--accent-indigo)]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Client Dashboards
              </span>
            </div>
            <h1 className="text-[32px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[40px]">
              Visual Reports
            </h1>
            <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
              Interactive charts, PDF export, and shareable links for your clients.
            </p>
          </motion.div>

          {/* ── Stats Row ── */}
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
                <Card padding="md">
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

          {/* ── Search ── */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search reports by niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
              />
            </div>
          </div>

          {/* ── Reports Grid ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--accent-indigo)]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] py-20 text-center"
            >
              <div className="mb-4 text-5xl">📊</div>
              <p className="text-[16px] font-medium text-[var(--text-primary)]">
                {searchQuery ? 'No matching reports' : 'No reports yet'}
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first intelligence report to get started'}
              </p>
              {!searchQuery && (
                <Link href="/seo-report">
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-6"
                    icon={<Sparkles size={14} />}
                  >
                    Create First Report
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((r, i) => {
                const info = getTypeInfo(r);
                const Icon = info.icon;
                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={`/dashboard/${r._id}`} className="block h-full">
                      <Card
                        padding="lg"
                        className="group relative h-full overflow-hidden transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]"
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 h-full w-[3px] opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ background: info.accent }}
                        />

                        {/* Icon + Arrow */}
                        <div className="mb-4 flex items-start justify-between">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-[4px]"
                            style={{ background: info.bg }}
                          >
                            <Icon size={18} style={{ color: info.accent }} />
                          </div>
                          <ArrowRight
                            size={14}
                            className="text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
                          />
                        </div>

                        {/* Badge */}
                        <div className="mb-3">
                          <Badge variant={info.badge} size="sm">
                            {info.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="mb-3 text-[15px] font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-white">
                          {r.niche}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                          <span>{countryFlags[r.country] || '🌍'}</span>
                          <span>{(r.country || '').toUpperCase()}</span>
                          <span>·</span>
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </>
  );
}
