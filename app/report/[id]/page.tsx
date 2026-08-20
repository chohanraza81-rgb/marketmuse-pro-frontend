'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  FileDown,
  Download,
  TrendingUp,
  Search,
  Loader2,
  Share2,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export default function UnifiedReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  // Dropdown States
  const [exportOpen, setExportOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) setExportOpen(false);
      if (copyRef.current && !copyRef.current.contains(event.target as Node)) setCopyOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/reports/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Helper: Extract specific section from Markdown by title
  const extractSection = (markdown: string, title: string): string => {
    if (!markdown) return 'Section not found';
    // Regex to find title and capture text until the next numbered section or end of string
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTitle})([\\s\\S]*?)(?=(\\n\\d+\\.\\s+[A-Z ]+|\\Z))`, 'i');
    const match = markdown.match(regex);
    return match ? `${match[1]}${match[2]}`.trim() : 'Section not found';
  };

  const copyText = async (text: string, label: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleExportPDF = () => {
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) {
      toast.error('Allow pop-ups');
      return;
    }
    w.document.write(`<html><head><title>MusePRO Report</title><style>body{font-family:Arial;padding:40px;color:#000}pre{white-space:pre-wrap;font-size:12px}</style></head><body><h1>${report.type === 'product' ? 'Product Research' : 'SEO Analysis'}: ${report.niche}</h1><pre>${report.markdown}</pre></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  // New: Export as .txt file
  const handleExportTxt = () => {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MusePRO_Report_${report.niche}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT file downloaded');
  };

  const handleExportCSV = () => {
    if (!report?.data) {
      toast.error('No data');
      return;
    }
    let rows: any[] = [];
    if (report.type === 'product' && report.data.realProducts) {
      rows = report.data.realProducts.map((p: any) => ({
        Product: p.title,
        Price: p.price,
        Reviews: p.reviews,
        Source: p.source,
      }));
    } else if (report.type === 'seo' && report.keywords) {
      rows = report.keywords.map((k: any) => ({
        Keyword: k.keyword,
        Volume: k.volume ?? 'Not Disclosed',
        CPC: k.cpc ?? 'Not Disclosed',
        KD: k.kd ?? 'Not Disclosed',
      }));
    }
    if (rows.length > 0) {
      const csv = [Object.keys(rows[0]).join(','), ...rows.map((r: any) => Object.values(r).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}-${report.niche}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } else {
      toast.error('No exportable data');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `MusePRO Report: ${report?.niche}`, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="text-xl mb-4">Report not found</p>
          <Link href="/history" className="text-indigo-400">← Back to History</Link>
        </div>
      </main>
    );
  }

  const isProduct = report.type === 'product';
  const data = report.data || {};
  const keywords = report.keywords || [];
  const serpResults = report.serp_landscape || data.serp || [];

  // 🛡️ Backend calculated fields
  const trafficEstimate = report.sixMonthTrafficEstimate || report.traffic_estimate || 0;
  const trendSummary = report.trendSummary || report.trend_summary || 'Evergreen trend';
  const chartData = report.chartData || {};
  const trendLine = chartData.trend_12m || [];
  const trafficForecast = chartData.traffic_forecast_6m || [];
  const marketShare = chartData.market_share || [];

  const score = isProduct
    ? (data.market_score || data.opportunity_score || 70)
    : (trendForecast.length ? Math.min(Math.round(trafficForecast[trafficForecast.length - 1]?.traffic / 1000), 100) : 65);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
          </div>
        </div>
      </nav>

      {/* Top Action Bar with Advanced Dropdowns */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-3 border-b border-neutral-800/50">
        <div className="flex items-center gap-3">
          <Link href="/history" className="text-neutral-400 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          {isProduct ? (
            <TrendingUp size={16} className="text-emerald-400" />
          ) : (
            <Search size={16} className="text-indigo-400" />
          )}
          <span className="font-semibold capitalize">{report.niche}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isProduct
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-indigo-500/10 text-indigo-400'
            }`}
          >
            {isProduct ? 'Product' : 'SEO'}
          </span>
        </div>

        {/* Dropdowns Container */}
        <div className="flex gap-2 flex-wrap relative">
          {/* 📤 EXPORT DROPDOWN */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm transition-colors"
            >
              <Download size={14} /> Export <ChevronDown size={14} className={exportOpen ? 'rotate-180' : ''} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-12 mt-1 w-44 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl z-50 py-1 overflow-hidden">
                <button
                  onClick={() => { handleExportPDF(); setExportOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => { handleExportTxt(); setExportOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Download .txt
                </button>
                <button
                  onClick={() => { handleExportCSV(); setExportOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Export CSV
                </button>
                <div className="border-t border-neutral-700 my-1"></div>
                <button
                  onClick={() => { handleShare(); setExportOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Share Link
                </button>
              </div>
            )}
          </div>

          {/* 📋 COPY DROPDOWN */}
          <div className="relative" ref={copyRef}>
            <button
              onClick={() => setCopyOpen(!copyOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <Copy size={14} /> Copy <ChevronDown size={14} className={copyOpen ? 'rotate-180' : ''} />
            </button>
            {copyOpen && (
              <div className="absolute right-0 top-12 mt-1 w-56 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl z-50 py-1 overflow-hidden">
                <button
                  onClick={() => { copyText(report.markdown, 'Complete Report'); setCopyOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Copy Complete Report
                </button>
                <div className="border-t border-neutral-700 my-1"></div>
                <button
                  onClick={() => { copyText(extractSection(report.markdown, '1. EXECUTIVE BRIEF'), 'Executive Brief'); setCopyOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Copy Executive Brief
                </button>
                <button
                  onClick={() => { copyText(extractSection(report.markdown, '4. SERP LANDSCAPE'), 'SERP Landscape'); setCopyOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Copy SERP Landscape
                </button>
                <button
                  onClick={() => { copyText(extractSection(report.markdown, '5. CONTENT ROADMAP'), 'Content Roadmap'); setCopyOpen(false); }}
                  className="flex w-full px-4 py-2.5 text-sm hover:bg-neutral-800 text-left transition-colors"
                >
                  Copy Content Roadmap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-2">TREND</p>
            <p className="text-sm font-semibold">{trendSummary}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-2">KEYWORDS ANALYZED</p>
            <p className="text-2xl font-bold font-mono">{keywords.length}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-2">6-MONTH TRAFFIC EST.</p>
            <p className="text-2xl font-bold font-mono">{trafficEstimate.toLocaleString()} visits</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-2">OPPORTUNITY SCORE</p>
            <p className="text-2xl font-bold font-mono">{score}/100</p>
            <div className="mt-2 w-full h-1.5 rounded-full bg-neutral-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {trendLine.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">SEARCH TREND (12 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendLine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#A3A3A3" fontSize={12} />
                  <YAxis stroke="#A3A3A3" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {trafficForecast.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">TRAFFIC FORECAST (6 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trafficForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#A3A3A3" fontSize={12} />
                  <YAxis stroke="#A3A3A3" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="traffic" stroke="#06B6D4" fill="#06B6D430" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {marketShare.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">MARKET SHARE</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={marketShare} dataKey="share" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {marketShare.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {marketShare.map((entry: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                    {entry.name}: {entry.share}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Tables */}
        {!isProduct && keywords.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">KEYWORDS WORTH TARGETING</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400">
                    <th className="text-left py-2 px-3">#</th>
                    <th className="text-left py-2 px-3">Keyword</th>
                    <th className="text-left py-2 px-3">Volume</th>
                    <th className="text-left py-2 px-3">CPC</th>
                    <th className="text-left py-2 px-3">KD</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.slice(0, 50).map((k: any, i: number) => (
                    <tr key={i} className="border-b border-neutral-800">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{k.keyword}</td>
                      <td className="py-2 px-3">{k.volume?.toLocaleString() ?? 'N/A'}</td>
                      <td className="py-2 px-3">{k.cpc ? `$${k.cpc.toFixed(2)}` : 'N/A'}</td>
                      <td className="py-2 px-3">{k.kd ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Markdown Report */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Complete Report</h2>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 md:p-12 bg-[#0F0F14] border border-neutral-800">
            <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-strong:text-white prose-a:text-indigo-400">
              <ReactMarkdown>{report.markdown}</ReactMarkdown>
            </article>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
