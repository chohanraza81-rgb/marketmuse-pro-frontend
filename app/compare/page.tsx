'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  FileDown,
  Download,
  BarChart3,
  Trophy,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Target,
  Layers,
  Search,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

interface Report {
  _id: string;
  type: 'product' | 'seo';
  niche: string;
  country: string;
  data: any;
  markdown: string;
  createdAt?: string;
}

const flags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

// ─── Working Getters ───
const getScore = (r: Report | null): number => {
  if (!r) return 0;
  const d = r.data || {};

  if (r.type === 'product') {
    const score =
      d.market_score ??
      d.opportunity_score ??
      d.score ??
      d.chart_data?.market_score ??
      0;
    return typeof score === 'number' ? Math.min(score, 100) : 0;
  }

  if (r.type === 'seo') {
    let score = 0;
    if (d.trend_score === 'Evergreen') score += 30;
    else if (d.trend_score === 'Seasonal') score += 20;

    const keywordCount = d.keywords?.length || 0;
    score += Math.min(keywordCount, 50) * 0.8;

    const forecast = d.chart_data?.traffic_forecast_6m || d.chart_data?.traffic_growth_6m || d.chart_data?.traffic_forecast;
    if (forecast && forecast.length > 0) {
      const last = forecast[forecast.length - 1]?.traffic ?? forecast[forecast.length - 1] ?? 0;
      score += Math.min(Math.round(last / 1000), 30);
    }
    return Math.min(Math.round(score), 100);
  }
  return 0;
};

const getProfitOrTraffic = (r: Report | null): number => {
  if (!r) return 0;
  const d = r.data || {};

  if (r.type === 'product') {
    return (
      d.financial_forecast?.month6_profit_optimistic ??
      d.financial_projections?.month6_profit_optimistic ??
      d.financial_forecast?.month6_profit_conservative ??
      0
    );
  }

  const forecast = d.chart_data?.traffic_forecast_6m || d.chart_data?.traffic_growth_6m || d.chart_data?.traffic_forecast;
  if (forecast && forecast.length > 0) {
    return forecast[forecast.length - 1]?.traffic ?? forecast[forecast.length - 1] ?? 0;
  }

  const topVolumes = (d.keywords || []).slice(0, 10).reduce((sum: number, k: any) => sum + (k.volume || 0), 0);
  return Math.round(topVolumes * 0.01);
};

const getTopKeywords = (r: Report | null): string[] => {
  if (!r || r.type !== 'seo') return [];
  const kws = r.data?.keywords || [];
  return kws.slice(0, 5).map((k: any) => k.keyword || '');
};

const getCommonKeywords = (r1: Report | null, r2: Report | null): number => {
  const set1 = new Set(getTopKeywords(r1).map(k => k.toLowerCase()));
  const set2 = new Set(getTopKeywords(r2).map(k => k.toLowerCase()));
  let count = 0;
  set1.forEach(k => {
    if (set2.has(k)) count++;
  });
  return count;
};

const getRiskCount = (r: Report | null): number => {
  return (r?.data?.risk_matrix || r?.data?.risk_radar || r?.data?.risk_assessment || []).length || 0;
};

const getDataCompleteness = (r: Report | null): number => {
  if (!r) return 0;
  const d = r.data || {};
  let checks = 0;
  let total = 0;

  total++; if (d.keywords && d.keywords.length > 0) checks++;
  total++; if (d.chart_data && (d.chart_data.trend_12m || d.chart_data.traffic_forecast_6m)) checks++;
  total++; if (r.type === 'product' && d.financial_model) checks++;
  total++; if (r.type === 'seo' && d.serp_landscape && d.serp_landscape.length > 0) checks++;
  total++; if (d.case_studies && d.case_studies.length > 0) checks++;
  total++; if (r.markdown && r.markdown.length > 100) checks++;

  return Math.round((checks / total) * 100);
};

export default function ComparePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected1, setSelected1] = useState<string>('');
  const [selected2, setSelected2] = useState<string>('');
  const [report1, setReport1] = useState<Report | null>(null);
  const [report2, setReport2] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/reports?limit=500`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load reports');
        setLoading(false);
      });
  }, []);

  const handleCompare = async () => {
    if (!selected1 || !selected2) {
      toast.error('Please select both reports');
      return;
    }

    if (selected1 === selected2) {
      toast.error('Please select two different reports');
      return;
    }

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/reports/${selected1}`),
        fetch(`${API_URL}/reports/${selected2}`),
      ]);

      if (!res1.ok || !res2.ok) {
        toast.error('Failed to fetch full reports');
        return;
      }

      const r1 = await res1.json();
      const r2 = await res2.json();

      setReport1(r1);
      setReport2(r2);
      toast.success('Comparison ready');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleCopyMarkdown = async () => {
    if (!report1 || !report2) {
      toast.error('No comparison to copy');
      return;
    }
    const md = `# MusePRO — Report Comparison\n\n## Report 1\n- **Niche:** ${report1.niche}\n- **Country:** ${flags[report1.country]} ${report1.country.toUpperCase()}\n- **Type:** ${report1.type}\n- **Market Score:** ${getScore(report1)}/100\n- **Data Completeness:** ${getDataCompleteness(report1)}%\n- **Est. Monthly ${report1.type === 'product' ? 'Profit' : 'Traffic'}:** ${report1.type === 'product' ? `$${getProfitOrTraffic(report1).toLocaleString()}` : `${getProfitOrTraffic(report1).toLocaleString()} visits`}\n\n## Report 2\n- **Niche:** ${report2.niche}\n- **Country:** ${flags[report2.country]} ${report2.country.toUpperCase()}\n- **Type:** ${report2.type}\n- **Market Score:** ${getScore(report2)}/100\n- **Data Completeness:** ${getDataCompleteness(report2)}%\n- **Est. Monthly ${report2.type === 'product' ? 'Profit' : 'Traffic'}:** ${report2.type === 'product' ? `$${getProfitOrTraffic(report2).toLocaleString()}` : `${getProfitOrTraffic(report2).toLocaleString()} visits`}\n\n## Winner\n**${getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}** is the stronger opportunity.`;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success('Comparison markdown copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!report1 || !report2) {
      toast.error('No comparison to export');
      return;
    }
    const rows = [
      ['Metric', report1.niche, report2.niche],
      ['Market Score', getScore(report1), getScore(report2)],
      ['Data Completeness', `${getDataCompleteness(report1)}%`, `${getDataCompleteness(report2)}%`],
      ['Common Keywords', getCommonKeywords(report1, report2), ''],
      ['Risk Count', getRiskCount(report1), getRiskCount(report2)],
      ['Est. Monthly ' + (report1.type === 'product' ? 'Profit' : 'Traffic'), report1.type === 'product' ? `$${getProfitOrTraffic(report1)}` : `${getProfitOrTraffic(report1)} visits`, report2.type === 'product' ? `$${getProfitOrTraffic(report2)}` : `${getProfitOrTraffic(report2)} visits`],
      ['Winner', getScore(report1) >= getScore(report2) ? report1.niche : report2.niche, ''],
    ];
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musePRO-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Comparison CSV downloaded');
  };

  const handleExportPDF = () => {
    if (!report1 || !report2) {
      toast.error('No comparison to export');
      return;
    }
    const w = window.open('', '_blank');
    if (!w) {
      toast.error('Allow pop-ups for PDF');
      return;
    }
    w.document.write(`
      <html>
        <head><title>MusePRO — Report Comparison</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
          h1 { font-size: 22px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
          th { background: #f5f5f5; }
          .winner { color: green; font-weight: bold; margin-top: 20px; }
        </style>
        </head>
        <body>
          <h1>MusePRO — Report Comparison</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <table>
            <tr><th>Metric</th><th>${report1.niche}</th><th>${report2.niche}</th></tr>
            <tr><td>Market Score</td><td>${getScore(report1)}/100</td><td>${getScore(report2)}/100</td></tr>
            <tr><td>Data Completeness</td><td>${getDataCompleteness(report1)}%</td><td>${getDataCompleteness(report2)}%</td></tr>
            <tr><td>Common Keywords</td><td colspan="2">${getCommonKeywords(report1, report2)}</td></tr>
            <tr><td>Risk Count</td><td>${getRiskCount(report1)}</td><td>${getRiskCount(report2)}</td></tr>
            <tr><td>Est. Monthly ${report1.type === 'product' ? 'Profit' : 'Traffic'}</td><td>${report1.type === 'product' ? `$${getProfitOrTraffic(report1).toLocaleString()}` : `${getProfitOrTraffic(report1).toLocaleString()} visits`}</td><td>${report2.type === 'product' ? `$${getProfitOrTraffic(report2).toLocaleString()}` : `${getProfitOrTraffic(report2).toLocaleString()} visits`}</td></tr>
          </table>
          <p class="winner">Winner: ${getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}</p>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  const comparisonData = report1 && report2 ? [
    { metric: 'Market Score', report1: getScore(report1), report2: getScore(report2) },
    { metric: report1.type === 'product' ? 'Profit' : 'Traffic', report1: getProfitOrTraffic(report1), report2: getProfitOrTraffic(report2) },
  ] : [];

  const commonKeywords = report1 && report2 ? getCommonKeywords(report1, report2) : 0;

  return (
    <main className="min-h-screen bg-[#09090B] text-white font-['Inter']">
      <nav className="fixed top-0 w-full z-50 bg-[#09090B]/80 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Muse<span className="text-indigo-400">PRO</span>
              </span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10">SEO</Link>
            <Link href="/compare" className="text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all">Compare</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Report Comparison
              </span>
            </h1>
            <p className="text-neutral-400 text-lg">Battle two reports and find the winner in seconds.</p>
          </motion.div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
            <label className="block text-sm font-semibold text-indigo-300 mb-3">Report 1</label>
            <select value={selected1} onChange={(e) => setSelected1(e.target.value)} className="w-full bg-[#171717] border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50">
              <option value="">Select report...</option>
              {reports.map((r) => (
                <option key={r._id} value={r._id}>{r.niche} — {r.type.toUpperCase()} ({flags[r.country]})</option>
              ))}
            </select>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
            <label className="block text-sm font-semibold text-purple-300 mb-3">Report 2</label>
            <select value={selected2} onChange={(e) => setSelected2(e.target.value)} className="w-full bg-[#171717] border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50">
              <option value="">Select report...</option>
              {reports.map((r) => (
                <option key={r._id} value={r._id}>{r.niche} — {r.type.toUpperCase()} ({flags[r.country]})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button onClick={handleCompare} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30">
            Compare Reports
          </button>
          {report1 && report2 && (
            <>
              <button onClick={handleCopyMarkdown} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied Markdown' : 'Copy Markdown'}
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15">
                <Download size={18} /> Export CSV
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15">
                <FileDown size={18} /> High‑Quality PDF
              </button>
            </>
          )}
        </div>

        {/* Comparison Display */}
        {report1 && report2 ? (
          <div className="space-y-10">
            {/* VS Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-neutral-800/60 border border-neutral-700">
                <span className="font-bold text-indigo-400">{report1.niche}</span>
                <span className="text-2xl font-black text-neutral-400">VS</span>
                <span className="font-bold text-purple-400">{report2.niche}</span>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold">
                  <Trophy size={18} />
                  Winner: {getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { report: report1, color: 'indigo', score: getScore(report1), completeness: getDataCompleteness(report1), profitOrTraffic: getProfitOrTraffic(report1), risks: getRiskCount(report1), isWinner: getScore(report1) >= getScore(report2) },
                { report: report2, color: 'purple', score: getScore(report2), completeness: getDataCompleteness(report2), profitOrTraffic: getProfitOrTraffic(report2), risks: getRiskCount(report2), isWinner: getScore(report2) > getScore(report1) },
              ].map(({ report, color, score, completeness, profitOrTraffic, risks, isWinner }) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-6 rounded-2xl border-2 ${isWinner ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-800 bg-[#0F0F14]'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.type === 'product' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{report.type.toUpperCase()}</span>
                    <span className="text-sm text-neutral-400">{flags[report.country]} {report.country.toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-bold capitalize mb-4">{report.niche}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-neutral-500 flex items-center gap-1.5"><Gauge size={14} /> Market Score</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color === 'indigo' ? 'bg-indigo-500' : 'bg-purple-500'}`} style={{ width: `${score}%` }} /></div>
                        <span className="font-mono font-bold">{score}/100</span>
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-neutral-500" /> Data Completeness: <strong>{completeness}%</strong></p>
                    <p className="flex items-center gap-1.5"><TrendingUp size={14} className="text-neutral-500" /> {report.type === 'product' ? 'Est. Monthly Profit:' : 'Est. 6‑Month Traffic:'} <strong>{report.type === 'product' ? `$${profitOrTraffic.toLocaleString()}` : `${profitOrTraffic.toLocaleString()} visits`}</strong></p>
                    <p className="flex items-center gap-1.5"><AlertTriangle size={14} className="text-neutral-500" /> Risks: <strong>{risks}</strong></p>
                    <p className="flex items-center gap-1.5"><Layers size={14} className="text-neutral-500" /> Opportunity: <strong>{report.data?.opportunity_level || report.data?.trend_assessment || report.data?.trend_score || 'N/A'}</strong></p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60 text-center">
                <h3 className="text-sm font-semibold mb-2 flex items-center justify-center gap-2"><Search size={16} className="text-indigo-400" /> Common Keywords</h3>
                <p className="text-3xl font-black">{commonKeywords}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60 text-center">
                <h3 className="text-sm font-semibold mb-2 flex items-center justify-center gap-2"><ShieldCheck size={16} className="text-emerald-400" /> Avg. Data Completeness</h3>
                <p className="text-3xl font-black">{Math.round((getDataCompleteness(report1) + getDataCompleteness(report2)) / 2)}%</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60 text-center">
                <h3 className="text-sm font-semibold mb-2 flex items-center justify-center gap-2"><Target size={16} className="text-purple-400" /> Combined Opportunity</h3>
                <p className="text-3xl font-black">{(getScore(report1) + getScore(report2)) / 2}/100</p>
              </div>
            </div>

            {/* Combined Chart */}
            <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
              <h3 className="text-sm font-semibold mb-4">Metric Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" stroke="#A3A3A3" fontSize={12} />
                  <YAxis dataKey="metric" type="category" stroke="#A3A3A3" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Bar dataKey="report1" name={report1.niche} fill="#6366F1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="report2" name={report2.niche} fill="#A855F7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
                <h3 className="text-sm font-semibold mb-3">Top Keywords — {report1.niche}</h3>
                <ul className="space-y-2">
                  {getTopKeywords(report1).map((kw, i) => <li key={i} className="text-sm text-neutral-300">{kw}</li>)}
                  {getTopKeywords(report1).length === 0 && <li className="text-sm text-neutral-500">No keywords available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
                <h3 className="text-sm font-semibold mb-3">Top Keywords — {report2.niche}</h3>
                <ul className="space-y-2">
                  {getTopKeywords(report2).map((kw, i) => <li key={i} className="text-sm text-neutral-300">{kw}</li>)}
                  {getTopKeywords(report2).length === 0 && <li className="text-sm text-neutral-500">No keywords available</li>}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">Select two reports and click <strong className="text-indigo-400">Compare Reports</strong> to see the battle.</div>
        )}
      </div>
    </main>
  );
}
