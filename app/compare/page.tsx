'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft, Copy, Check, FileDown, Download, Trophy,
  Gauge, TrendingUp, AlertTriangle, Layers, Search,
  BarChart3, Scale, Target, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

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

const flags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

// ═══════════════════════════════════════════════════════════════
// METRIC HELPERS
// ═══════════════════════════════════════════════════════════════
const getScore = (r: any): number => {
  if (!r) return 0;
  const d = r.data || {};

  if (r.type === 'brand_protection' || r.type === 'brand') {
    const score = d.riskProfile?.riskScore ?? d.score ?? 0;
    return typeof score === 'number' ? Math.min(score, 100) : 0;
  }
  if (r.type === 'technical_seo' || r.type === 'technical') {
    return typeof d.score === 'number' ? Math.min(d.score, 100) : 0;
  }
  if (r.type === 'product') {
    const score =
      d.market_score ?? d.opportunity_score ?? d.score ?? d.chart_data?.market_score ?? 0;
    return typeof score === 'number' ? Math.min(score, 100) : 0;
  }
  // SEO
  let score = 0;
  if (d.trend_score === 'Evergreen') score += 30;
  else if (d.trend_score === 'Seasonal') score += 20;
  const keywordCount = d.keywords?.length || 0;
  score += Math.min(keywordCount, 50) * 0.8;
  const forecast = d.chart_data?.traffic_forecast_6m;
  if (forecast && forecast.length > 0) {
    const last = forecast[forecast.length - 1]?.traffic ?? 0;
    score += Math.min(Math.round(last / 1000), 30);
  }
  return Math.min(Math.round(score), 100);
};

const getKeywords = (r: any): any[] => r?.keywords || [];

const getDataCompleteness = (r: any): number => {
  if (!r) return 0;
  const d = r.data || {};
  let checks = 0;
  let total = 0;
  total++; if (d.keywords?.length > 0) checks++;
  total++; if (d.chart_data?.trend_12m || d.chart_data?.traffic_forecast_6m) checks++;
  total++; if (r.type === 'product' && d.financial_model) checks++;
  total++; if (r.type === 'seo' && r.serp_landscape?.length > 0) checks++;
  total++; if (d.case_studies?.length > 0) checks++;
  total++; if (r.markdown?.length > 100) checks++;
  return Math.round((checks / total) * 100);
};

const getRiskCount = (r: any): number =>
  (r?.data?.risk_matrix || r?.data?.risk_radar || r?.data?.risk_assessment || []).length;

const getMetricValue = (r: any): number => {
  const d = r?.data || {};
  if (r?.type === 'product') {
    return (
      d.financial_forecast?.month6_profit_optimistic ??
      d.financial_forecast?.month6_profit_conservative ??
      0
    );
  }
  return r?.traffic_estimate || 0;
};

const getTypeInfo = (type: string) => {
  const map: Record<string, { label: string; badge: any }> = {
    seo: { label: 'SEO', badge: 'indigo' },
    product: { label: 'Product', badge: 'emerald' },
    technical_seo: { label: 'Tech SEO', badge: 'purple' },
    technical: { label: 'Tech SEO', badge: 'purple' },
    brand_protection: { label: 'Brand Protection', badge: 'critical' },
    brand: { label: 'Brand Protection', badge: 'critical' },
  };
  return map[type] || { label: type, badge: 'default' };
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ComparePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected1, setSelected1] = useState('');
  const [selected2, setSelected2] = useState('');
  const [report1, setReport1] = useState<any>(null);
  const [report2, setReport2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Fetch Reports ──
  useEffect(() => {
    fetch(`${API_URL}/reports?limit=500`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  // ── Compare Handler ──
  const handleCompare = async () => {
    if (!selected1 || !selected2) {
      toast.error('Select both reports');
      return;
    }
    if (selected1 === selected2) {
      toast.error('Select two different reports');
      return;
    }
    setComparing(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/reports/${selected1}`),
        fetch(`${API_URL}/reports/${selected2}`),
      ]);
      if (!res1.ok || !res2.ok) throw new Error('Failed to fetch reports');
      const r1 = await res1.json();
      const r2 = await res2.json();
      setReport1(r1);
      setReport2(r2);
      toast.success('Comparison ready');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setComparing(false);
    }
  };

  // ── Export Handlers ──
  const handleCopyMarkdown = async () => {
    if (!report1 || !report2) return;
    const md = `# MusePRO — Report Comparison

## Report 1: ${report1.niche}
- Type: ${getTypeInfo(report1.type).label}
- Country: ${flags[report1.country] || ''} ${(report1.country || '').toUpperCase()}
- Market Score: ${getScore(report1)}/100
- Data Completeness: ${getDataCompleteness(report1)}%

## Report 2: ${report2.niche}
- Type: ${getTypeInfo(report2.type).label}
- Country: ${flags[report2.country] || ''} ${(report2.country || '').toUpperCase()}
- Market Score: ${getScore(report2)}/100
- Data Completeness: ${getDataCompleteness(report2)}%

## Winner
**${getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}** is the stronger opportunity.`;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!report1 || !report2) return;
    const rows = [
      ['Metric', report1.niche, report2.niche],
      ['Type', getTypeInfo(report1.type).label, getTypeInfo(report2.type).label],
      ['Country', report1.country, report2.country],
      ['Market Score', getScore(report1), getScore(report2)],
      ['Data Completeness', `${getDataCompleteness(report1)}%`, `${getDataCompleteness(report2)}%`],
      ['Risk Count', getRiskCount(report1), getRiskCount(report2)],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musepro-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const handleExportPDF = () => {
    if (!report1 || !report2) return;
    const w = window.open('', '_blank');
    if (!w) {
      toast.error('Allow pop-ups for PDF');
      return;
    }
    w.document.write(`
      <html>
        <head>
          <title>MusePRO — Report Comparison</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background: #f5f5f5; }
            .winner { color: green; font-weight: bold; margin-top: 24px; font-size: 15px; }
          </style>
        </head>
        <body>
          <h1>MusePRO — Report Comparison</h1>
          <p style="color:#666;font-size:12px;">Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <tr><th>Metric</th><th>${report1.niche}</th><th>${report2.niche}</th></tr>
            <tr><td>Type</td><td>${getTypeInfo(report1.type).label}</td><td>${getTypeInfo(report2.type).label}</td></tr>
            <tr><td>Country</td><td>${(report1.country || '').toUpperCase()}</td><td>${(report2.country || '').toUpperCase()}</td></tr>
            <tr><td>Market Score</td><td>${getScore(report1)}/100</td><td>${getScore(report2)}/100</td></tr>
            <tr><td>Data Completeness</td><td>${getDataCompleteness(report1)}%</td><td>${getDataCompleteness(report2)}%</td></tr>
            <tr><td>Risk Count</td><td>${getRiskCount(report1)}</td><td>${getRiskCount(report2)}</td></tr>
          </table>
          <p class="winner">🏆 Winner: ${getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}</p>
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  // ── Derived Data ──
  const comparisonData = useMemo(() => {
    if (!report1 || !report2) return [];
    return [
      { metric: 'Score', r1: getScore(report1), r2: getScore(report2) },
      { metric: 'Completeness', r1: getDataCompleteness(report1), r2: getDataCompleteness(report2) },
      { metric: 'Risks', r1: getRiskCount(report1), r2: getRiskCount(report2) },
    ];
  }, [report1, report2]);

  const winner = useMemo(() => {
    if (!report1 || !report2) return null;
    return getScore(report1) >= getScore(report2) ? 'r1' : 'r2';
  }, [report1, report2]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[var(--accent-indigo)]/5 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-10">
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
            className="mb-10 text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3 py-1.5">
              <Scale size={12} className="text-[var(--accent-indigo)]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Report Comparison
              </span>
            </div>
            <h1 className="text-[32px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[40px]">
              Compare two reports
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Pit two reports head-to-head and find the stronger opportunity in seconds.
            </p>
          </motion.div>

          {/* ── Selectors ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card padding="md" variant="default">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-[var(--accent-indigo)]">
                Report 1
              </label>
              <select
                value={selected1}
                onChange={(e) => setSelected1(e.target.value)}
                className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
              >
                <option value="">Select report...</option>
                {reports.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.niche} — {getTypeInfo(r.type).label} ({flags[r.country] || ''})
                  </option>
                ))}
              </select>
            </Card>
            <Card padding="md" variant="default">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-[var(--accent-purple)]">
                Report 2
              </label>
              <select
                value={selected2}
                onChange={(e) => setSelected2(e.target.value)}
                className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2.5 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-purple)]"
              >
                <option value="">Select report...</option>
                {reports.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.niche} — {getTypeInfo(r.type).label} ({flags[r.country] || ''})
                  </option>
                ))}
              </select>
            </Card>
          </div>

          {/* ── Action Buttons ── */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleCompare}
              loading={comparing}
              icon={<BarChart3 size={14} />}
            >
              {comparing ? 'Comparing...' : 'Compare Reports'}
            </Button>
            {report1 && report2 && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopyMarkdown}
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copied ? 'Copied' : 'Copy Markdown'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleExportCSV}
                  icon={<Download size={14} />}
                >
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleExportPDF}
                  icon={<FileDown size={14} />}
                >
                  PDF
                </Button>
              </>
            )}
          </div>

          {/* ── Comparison Display ── */}
          {report1 && report2 ? (
            <div className="space-y-6">
              {/* VS Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-flex flex-wrap items-center gap-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-6 py-3">
                  <span className="text-[14px] font-medium text-[var(--accent-indigo)]">
                    {report1.niche}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    VS
                  </span>
                  <span className="text-[14px] font-medium text-[var(--accent-purple)]">
                    {report2.niche}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[13px]">
                  <Trophy size={14} className="text-[var(--accent-emerald)]" />
                  <span className="text-[var(--text-secondary)]">Winner:</span>
                  <span className="font-medium text-[var(--accent-emerald)]">
                    {winner === 'r1' ? report1.niche : report2.niche}
                  </span>
                </div>
              </motion.div>

              {/* KPI Comparison Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { report: report1, accent: 'var(--accent-indigo)', isWinner: winner === 'r1' },
                  { report: report2, accent: 'var(--accent-purple)', isWinner: winner === 'r2' },
                ].map(({ report, accent, isWinner }, idx) => {
                  const typeInfo = getTypeInfo(report.type);
                  const score = getScore(report);
                  const completeness = getDataCompleteness(report);
                  const risks = getRiskCount(report);
                  const metricValue = getMetricValue(report);

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card
                        padding="lg"
                        variant={isWinner ? 'elevated' : 'default'}
                        className={isWinner ? 'ring-1 ring-[var(--accent-emerald)]/30' : ''}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <Badge variant={typeInfo.badge} size="md">
                            {typeInfo.label}
                          </Badge>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {flags[report.country] || '🌍'}{' '}
                            {(report.country || '').toUpperCase()}
                          </span>
                        </div>

                        <h3 className="mb-5 text-[18px] font-medium text-[var(--text-primary)]">
                          {report.niche}
                        </h3>

                        {/* Metrics */}
                        <div className="space-y-4">
                          {/* Score */}
                          <div>
                            <div className="mb-1.5 flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                <Gauge size={10} /> Market Score
                              </span>
                              <span className="font-mono text-[var(--text-primary)]">
                                {score}/100
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-3)]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full"
                                style={{ background: accent }}
                              />
                            </div>
                          </div>

                          {/* Completeness */}
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <Layers size={11} /> Data Completeness
                            </span>
                            <span className="font-mono text-[var(--text-primary)]">
                              {completeness}%
                            </span>
                          </div>

                          {/* Traffic/Profit */}
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <TrendingUp size={11} />
                              {report.type === 'product' ? 'Profit Est.' : 'Traffic Est.'}
                            </span>
                            <span className="font-mono text-[var(--text-primary)]">
                              {report.type === 'product'
                                ? `$${metricValue.toLocaleString()}`
                                : `${metricValue.toLocaleString()}`}
                            </span>
                          </div>

                          {/* Risks */}
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <AlertTriangle size={11} /> Risk Count
                            </span>
                            <span className="font-mono text-[var(--text-primary)]">{risks}</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Chart */}
              {comparisonData.length > 0 && (
                <Card padding="lg">
                  <h3 className="mb-4 text-[14px] font-medium text-[var(--text-primary)]">
                    Metric Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={comparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis
                        dataKey="metric"
                        type="category"
                        stroke="var(--text-muted)"
                        fontSize={11}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                      />
                      <Bar
                        dataKey="r1"
                        name={report1.niche}
                        fill="var(--accent-indigo)"
                        radius={[0, 3, 3, 0]}
                      />
                      <Bar
                        dataKey="r2"
                        name={report2.niche}
                        fill="var(--accent-purple)"
                        radius={[0, 3, 3, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <Target
                size={32}
                className="mx-auto text-[var(--text-muted)]"
              />
              <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
                Select two reports above and click{' '}
                <span className="font-medium text-[var(--accent-indigo)]">Compare Reports</span>
              </p>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mt-4" icon={<ArrowRight size={12} />}>
                  Browse all reports
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </>
  );
}
