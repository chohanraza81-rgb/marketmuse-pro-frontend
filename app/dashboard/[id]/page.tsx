'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  // Icons
  ArrowLeft, Home, Download, Share2, Printer, Copy, Check,
  FileDown, FileText, ChevronDown, X, Loader2, Lock, Clock,
  TrendingUp, Package, Gauge, Shield, AlertTriangle, CheckCircle2,
  // Chart icons
  BarChart3,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { toast, Toaster } from 'sonner';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://marketmuse-pro-backend-production-fd01.up.railway.app/api';

const CHART_COLORS = ['#533AFD', '#10B981', '#F59E0B', '#F85149', '#A855F7', '#06B6D4', '#EC4899', '#84CC16'];

// Report type configs
const REPORT_CONFIG = {
  seo: {
    label: 'SEO Research Report',
    icon: TrendingUp,
    accent: 'var(--accent-indigo)',
    layout: 'magazine' as const,
    badge: 'indigo' as const,
  },
  product: {
    label: 'Product Intelligence Report',
    icon: Package,
    accent: 'var(--accent-emerald)',
    layout: 'magazine' as const,
    badge: 'success' as const,
  },
  technical_seo: {
    label: 'Technical SEO Audit',
    icon: Gauge,
    accent: 'var(--accent-purple)',
    layout: 'command' as const,
    badge: 'warning' as const,
  },
  technical: {
    label: 'Technical SEO Audit',
    icon: Gauge,
    accent: 'var(--accent-purple)',
    layout: 'command' as const,
    badge: 'warning' as const,
  },
  brand_protection: {
    label: 'Counterfeit Intelligence Report',
    icon: Shield,
    accent: 'var(--accent-red)',
    layout: 'command' as const,
    badge: 'critical' as const,
  },
  brand: {
    label: 'Counterfeit Intelligence Report',
    icon: Shield,
    accent: 'var(--accent-red)',
    layout: 'command' as const,
    badge: 'critical' as const,
  },
};

const getReportConfig = (type: string) => {
  return REPORT_CONFIG[type as keyof typeof REPORT_CONFIG] || REPORT_CONFIG.seo;
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const safeString = (val: any, fallback: string = 'N/A'): string => {
  if (!val || val === 'undefined' || val === 'null') return fallback;
  return String(val).trim() || fallback;
};

const safeArray = (val: any): any[] => (Array.isArray(val) ? val : []);

const formatCurrency = (num: number, symbol: string = '$'): string => {
  return `${symbol}${num.toLocaleString('en-US')}`;
};

// Extract section from markdown
const extractSection = (markdown: string, sectionTitle: string): string => {
  if (!markdown) return '';
  const safeTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(${safeTitle})([\\s\\S]*?)(?=(\\n\\d+\\.\\s+[A-Z]|\\Z))`,
    'i'
  );
  const match = markdown.match(regex);
  return match ? `${match[1]}${match[2]}`.trim() : '';
};

// Get section list based on report type
const getSections = (type: string): Array<{ id: string; label: string; keyword: string }> => {
  if (type === 'product') {
    return [
      { id: 'overview', label: 'Overview', keyword: '1. CLIENT VALUE' },
      { id: 'trend', label: 'Trend', keyword: '3. TREND' },
      { id: 'market', label: 'Market Intel', keyword: '4. LOCAL' },
      { id: 'persona', label: 'Personas', keyword: '5. CONSUMER' },
      { id: 'competitor', label: 'Competitors', keyword: '6. COMPETITOR' },
      { id: 'financial', label: 'Financial', keyword: '22. ROI' },
      { id: 'case', label: 'Case Studies', keyword: '25. CASE' },
    ];
  }
  if (type === 'brand_protection' || type === 'brand') {
    return [
      { id: 'threat', label: 'Threat Dashboard', keyword: '1. THREAT' },
      { id: 'summary', label: 'Executive Brief', keyword: '2. EXECUTIVE' },
      { id: 'vulnerability', label: 'Vulnerability', keyword: '3. BRAND' },
      { id: 'osint', label: 'OSINT Profile', keyword: '4. COUNTERFEITER' },
      { id: 'platforms', label: 'Platforms', keyword: '5. PLATFORM' },
      { id: 'impact', label: 'Economic Impact', keyword: '7. ECONOMIC' },
      { id: 'evidence', label: 'Evidence', keyword: '9. OSINT' },
      { id: 'actions', label: 'Actions', keyword: '10. COUNTERMEASURE' },
    ];
  }
  if (type === 'technical_seo' || type === 'technical') {
    return [
      { id: 'summary', label: 'Executive Summary', keyword: '1. EXECUTIVE' },
      { id: 'breakdown', label: 'Score Breakdown', keyword: '2. SCORE' },
      { id: 'checks', label: 'Detailed Checks', keyword: '3. DETAILED' },
      { id: 'actions', label: 'Priority Actions', keyword: '4. PRIORITY' },
      { id: 'impact', label: 'Business Impact', keyword: '5. BUSINESS' },
    ];
  }
  // SEO (default)
  return [
    { id: 'summary', label: 'Executive Summary', keyword: '1. EXECUTIVE' },
    { id: 'current', label: 'Current State', keyword: '2. CURRENT' },
    { id: 'keywords', label: 'Keywords', keyword: '2.5 KEYWORD' },
    { id: 'ground', label: 'Ground Intel', keyword: '3. GROUND' },
    { id: 'opportunity', label: 'Opportunity', keyword: '4. STRATEGIC' },
    { id: 'competitor', label: 'Competitor Edge', keyword: '5. COMPETITIVE' },
    { id: 'findings', label: 'Key Findings', keyword: '6. KEY' },
    { id: 'financial', label: 'Financial', keyword: '9. FINANCIAL' },
    { id: 'case', label: 'Case Studies', keyword: '10. CASE' },
  ];
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function UnifiedReportDashboard() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  // ── State ──
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  // Dropdowns
  const [exportOpen, setExportOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Share modal state
  const [shareLink, setShareLink] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [shareExpiry, setShareExpiry] = useState(24);
  const [shareGenerated, setShareGenerated] = useState(false);
  const [copied, setCopied] = useState('');

  // Refs
  const exportRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Config ──
  const config = useMemo(() => getReportConfig(report?.type || 'seo'), [report?.type]);
  const sections = useMemo(() => getSections(report?.type || 'seo'), [report?.type]);

  // ── Fetch Report ──
  useEffect(() => {
    if (!reportId) return;
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/reports/${reportId}`);
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setReport(data);
        setActiveSection(sections[0]?.id || 'overview');
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, sections]);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
      if (copyRef.current && !copyRef.current.contains(event.target as Node)) {
        setCopyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Smooth scroll to section ──
  const scrollToSection = (keyword: string, id: string) => {
    setActiveSection(id);
    const markdown = report?.markdown || '';
    const sectionContent = extractSection(markdown, keyword);
    if (!sectionContent) {
      toast.info('Section not found in report');
      return;
    }
    // Find the markdown element and scroll
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ── Copy helpers ──
  const copyText = async (text: string, label: string) => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Export handlers ──
  const handleExportTxt = () => {
    if (!report) return;
    const blob = new Blob([report.markdown || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MusePRO_${report.niche?.replace(/\s+/g, '_') || 'Report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT downloaded');
    setExportOpen(false);
  };

  const handleExportCSV = () => {
    if (!report) return;
    let rows: any[] = [];
    if (report.keywords?.length > 0) {
      rows = report.keywords.map((k: any) => ({
        Keyword: k.keyword,
        Volume: k.volume,
        CPC: k.cpc,
        KD: k.kd,
        Intent: k.intent,
      }));
    }
    if (rows.length === 0) {
      toast.error('No exportable data');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).join(',')).join('\n');
    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MusePRO_${report.niche?.replace(/\s+/g, '_') || 'Report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
    setExportOpen(false);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) {
      toast.error('Allow pop-ups for PDF');
      return;
    }
    w.document.write(`
      <html>
        <head>
          <title>MusePRO Report — ${report.niche}</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { font-size: 28px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 30px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${report.niche}</h1>
          <div class="meta">
            ${config.label} • ${report.country?.toUpperCase() || ''} • ${new Date(report.createdAt).toLocaleDateString()}
          </div>
          <pre>${(report.markdown || '').replace(/</g, '&lt;')}</pre>
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 500);
    setExportOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Share handler ──
  const handleShare = async () => {
    if (!report) return;
    try {
      const res = await fetch(`${API_URL}/reports/${report._id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInHours: shareExpiry,
          password: sharePassword || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create share link');
      const data = await res.json();
      const fullLink = `${window.location.origin}/dashboard/${report._id}`;
      setShareLink(fullLink);
      setShareGenerated(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate share link');
    }
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    toast.success('Link copied');
  };

  // ═══════════════════════════════════════════════════════════════
  // LOADING & ERROR STATES
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-[var(--bg-base)]">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-[var(--accent-indigo)]" />
            <p className="mt-3 text-[13px] text-[var(--text-secondary)]">Loading report...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-[var(--bg-base)]">
          <div className="max-w-md text-center">
            <AlertTriangle size={40} className="mx-auto text-[var(--accent-red)]" />
            <h2 className="mt-4 text-[20px] font-medium text-[var(--text-primary)]">Report not found</h2>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
              {error || 'The report you are looking for does not exist.'}
            </p>
            <Link href="/dashboard">
              <Button variant="primary" size="md" className="mt-6" icon={<ArrowLeft size={14} />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const isCommand = config.layout === 'command';
  const reportData = report.data || {};
  const keywords = report.keywords || [];
  const chartData = report.chart_data || {};
  const trendData = chartData.trend_12m || [];
  const trafficForecast = chartData.traffic_forecast_6m || [];
  const platformDistribution = chartData.platform_distribution || [];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* ── Sticky Action Header ── */}
        <div className="sticky top-14 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={14} />
                <span>Dashboard</span>
              </Link>
              <div className="h-4 w-px bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <config.icon size={14} style={{ color: config.accent }} />
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  {report.niche}
                </span>
                <Badge variant={config.badge} size="sm">
                  {config.label}
                </Badge>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <div className="relative" ref={exportRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportOpen(!exportOpen)}
                  icon={<Download size={13} />}
                >
                  Export
                  <ChevronDown size={12} className={exportOpen ? 'rotate-180' : ''} />
                </Button>
                {exportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-10 z-50 mt-1 w-52 overflow-hidden rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] shadow-2xl"
                  >
                    <button
                      onClick={handleExportPDF}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-3)]"
                    >
                      <FileDown size={14} /> Export PDF
                    </button>
                    <button
                      onClick={handleExportTxt}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-3)]"
                    >
                      <FileText size={14} /> Download .txt
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-3)]"
                    >
                      <BarChart3 size={14} /> Export CSV
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Copy Dropdown */}
              <div className="relative" ref={copyRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCopyOpen(!copyOpen)}
                  icon={<Copy size={13} />}
                >
                  Copy
                  <ChevronDown size={12} className={copyOpen ? 'rotate-180' : ''} />
                </Button>
                {copyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-10 z-50 mt-1 w-56 overflow-hidden rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] shadow-2xl"
                  >
                    <button
                      onClick={() => {
                        copyText(report.markdown, 'Full Report');
                        setCopyOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-3)]"
                    >
                      <Copy size={14} /> Copy Full Report
                    </button>
                    <button
                      onClick={() => {
                        const kwText = keywords
                          .slice(0, 50)
                          .map((k: any) => `${k.keyword}\t${k.volume}\t${k.cpc}\t${k.kd}`)
                          .join('\n');
                        copyText(kwText, 'Keywords');
                        setCopyOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-3)]"
                    >
                      <Copy size={14} /> Copy Keywords
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Print */}
              <Button variant="ghost" size="icon" onClick={handlePrint} title="Print">
                <Printer size={14} />
              </Button>

              {/* Share */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowShareModal(true)}
                icon={<Share2 size={13} />}
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-8">
          {/* ── Sidebar ── */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-32 space-y-6">
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Sections
                </p>
                <nav className="space-y-0.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.keyword, section.id)}
                      className={`flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                        activeSection === section.id
                          ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-1)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Exit Navigation */}
              <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-1)] hover:text-[var(--text-primary)]"
                >
                  <LayoutDashboard size={12} />
                  Dashboard
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-1)] hover:text-[var(--text-primary)]"
                >
                  <Home size={12} />
                  Home
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            {/* ── Report Title Header ── */}
            <div className="mb-6">
              <h1 className="text-[24px] font-normal tracking-[-0.02em] text-[var(--text-primary)] md:text-[32px]">
                {report.niche}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-secondary)]">
                <span>{report.country?.toUpperCase()}</span>
                <span>•</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                {report._id && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{report._id.slice(-8).toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>

            {/* ── KPI Strip ── */}
            <KPICards report={report} config={config} />

            {/* ── Charts ── */}
            <ChartsSection
              report={report}
              config={config}
              trendData={trendData}
              trafficForecast={trafficForecast}
              platformDistribution={platformDistribution}
            />

            {/* ── Keywords Table (SEO only) ── */}
            {report.type === 'seo' && keywords.length > 0 && (
              <Card padding="md" className="mb-6">
                <h3 className="mb-4 text-[14px] font-medium text-[var(--text-primary)]">
                  Keyword Portfolio ({keywords.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="pb-2 pr-3">#</th>
                        <th className="pb-2 pr-3">Keyword</th>
                        <th className="pb-2 pr-3 text-right">Volume</th>
                        <th className="pb-2 pr-3 text-right">KD</th>
                        <th className="pb-2 pr-3 text-right">CPC</th>
                        <th className="pb-2">Intent</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {keywords.slice(0, 50).map((k: any, i: number) => (
                        <tr
                          key={i}
                          className="border-b border-[var(--border-subtle)]/50 transition-colors hover:bg-[var(--bg-surface-1)]"
                        >
                          <td className="py-2 pr-3 text-[var(--text-muted)]">{i + 1}</td>
                          <td className="py-2 pr-3 font-sans text-[var(--text-primary)]">
                            {k.keyword}
                          </td>
                          <td className="py-2 pr-3 text-right">{k.volume?.toLocaleString() || 'N/A'}</td>
                          <td className="py-2 pr-3 text-right">{k.kd || 'N/A'}</td>
                          <td className="py-2 pr-3 text-right">
                            {k.cpc ? `$${Number(k.cpc).toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="py-2 font-sans text-[var(--text-secondary)]">
                            {k.intent || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── Full Report (Markdown) ── */}
            <Card padding="lg" className="mb-6">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-[16px] font-medium text-[var(--text-primary)]">
                  Full Report
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(report.markdown, 'Full Report')}
                  icon={<Copy size={12} />}
                >
                  Copy
                </Button>
              </div>
              <article className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-headings:font-normal prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--accent-indigo)] prose-code:text-[var(--accent-emerald)] prose-table:text-[12px]">
                <ReactMarkdown>{report.markdown || ''}</ReactMarkdown>
              </article>
            </Card>

            {/* ── Bottom Padding for Sticky Bar ── */}
            <div className="h-20" />
          </div>
        </div>

        {/* ── Sticky Bottom Bar ── */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
            <p className="hidden text-[11px] text-[var(--text-muted)] md:block">
              Generated by MusePRO · {new Date(report.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF} icon={<FileDown size={13} />}>
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                icon={<Share2 size={13} />}
              >
                Share
              </Button>
              <Link href="/seo-report">
                <Button variant="primary" size="sm">
                  New Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[16px] font-medium text-[var(--text-primary)]">
                  <Share2 size={16} className="text-[var(--accent-indigo)]" />
                  Share Report
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="rounded-[4px] p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-3)] hover:text-[var(--text-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              {!shareGenerated ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      <Lock size={10} className="mr-1 inline" /> Password (optional)
                    </label>
                    <input
                      type="text"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      <Clock size={10} className="mr-1 inline" /> Expiry
                    </label>
                    <select
                      value={shareExpiry}
                      onChange={(e) => setShareExpiry(Number(e.target.value))}
                      className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                    >
                      <option value={24}>24 hours</option>
                      <option value={168}>7 days</option>
                      <option value={720}>30 days</option>
                      <option value={8760}>1 year</option>
                    </select>
                  </div>
                  <Button variant="primary" size="md" className="w-full" onClick={handleShare}>
                    Generate Share Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] p-3">
                    <p className="mb-2 text-[11px] text-[var(--text-muted)]">Shareable link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={copyShareLink}
                        icon={copied === 'link' ? <Check size={12} /> : <Copy size={12} />}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => {
                        setShareGenerated(false);
                        setShareLink('');
                      }}
                    >
                      Change Settings
                    </Button>
                    <Button variant="primary" size="md" className="flex-1" onClick={copyShareLink}>
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI CARDS COMPONENT
// ═══════════════════════════════════════════════════════════════
function KPICards({ report, config }: { report: any; config: any }) {
  const data = report.data || {};
  const keywords = report.keywords || [];

  const kpis = useMemo(() => {
    const base = [
      {
        label: 'Report Type',
        value: config.label.split(' ')[0],
        accent: config.accent,
      },
    ];

    if (report.type === 'seo') {
      base.push(
        { label: 'Keywords', value: String(keywords.length), accent: 'var(--accent-indigo)' },
        { label: 'Traffic Est.', value: (report.traffic_estimate || 0).toLocaleString(), accent: 'var(--accent-emerald)' },
        { label: 'Competitors', value: String(report.serp_landscape?.length || 0), accent: 'var(--accent-purple)' }
      );
    } else if (report.type === 'product') {
      base.push(
        { label: 'Tiers', value: String(data.financial_model?.length || 0), accent: 'var(--accent-emerald)' },
        { label: 'Personas', value: String(data.consumer_persona?.length || 0), accent: 'var(--accent-purple)' },
        { label: 'Competitors', value: String(data.competitor_benchmark?.length || 0), accent: 'var(--accent-indigo)' }
      );
    } else if (report.type === 'technical_seo' || report.type === 'technical') {
      const score = data.score || 0;
      base.push(
        { label: 'Overall Score', value: `${score}/100`, accent: 'var(--accent-purple)' },
        { label: 'Issues', value: String(data.issues_count || 0), accent: 'var(--accent-amber)' },
        { label: 'Passed', value: String(data.passed_count || 0), accent: 'var(--accent-emerald)' }
      );
    } else if (report.type === 'brand_protection' || report.type === 'brand') {
      const riskScore = data.riskProfile?.riskScore || 0;
      base.push(
        { label: 'Threat Score', value: `${riskScore}/100`, accent: 'var(--accent-red)' },
        { label: 'Findings', value: String(data.osintFindings?.length || 0), accent: 'var(--accent-amber)' },
        { label: 'Platforms', value: String(data.platformDistribution?.length || 0), accent: 'var(--accent-purple)' }
      );
    }
    return base;
  }, [report, config, keywords, data]);

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card padding="sm">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {kpi.label}
            </p>
            <p
              className="mt-2 font-mono text-[20px] font-medium"
              style={{ color: kpi.accent }}
            >
              {kpi.value}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHARTS SECTION
// ═══════════════════════════════════════════════════════════════
function ChartsSection({
  report,
  config,
  trendData,
  trafficForecast,
  platformDistribution,
}: any) {
  const isCommand = config.layout === 'command';
  const showTrend = trendData.length > 0;
  const showForecast = trafficForecast.length > 0;
  const showPlatforms = platformDistribution.length > 0;

  if (!showTrend && !showForecast && !showPlatforms) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
      {showTrend && (
        <Card padding="md">
          <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            12-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.accent}
                fill="url(#trendGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {showForecast && (
        <Card padding="md">
          <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            6-Month Forecast
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trafficForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="traffic"
                stroke={config.accent}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {showPlatforms && (
        <Card padding="md">
          <h3 className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Platform Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="platform" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill={config.accent} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
