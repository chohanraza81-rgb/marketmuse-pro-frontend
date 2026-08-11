'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Share2, Loader2, Copy, Check, FileDown, Download, Search
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function SEOReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/reports/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then(data => {
        if (data.type !== 'seo') throw new Error('Invalid report type');
        setReport(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyAll = async () => {
    if (!report?.markdown) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 2000);
  };
  const handleExportPDF = () => {
    if (!report) return;
    setPdfGenerating(true);
    const w = window.open('', '_blank');
    if (!w) { toast.error('Allow pop-ups'); setPdfGenerating(false); return; }
    w.document.write(`<html><head><title>MusePRO SEO Report</title><style>body{font-family:Arial;padding:40px;color:#000}pre{white-space:pre-wrap;font-size:12px}</style></head><body><h1>SEO Report: ${report.niche}</h1><pre>${report.markdown}</pre></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); setPdfGenerating(false); }, 500);
  };
  const handleExportCSV = () => {
    if (!report?.data?.keywords) { toast.error('No keyword data'); return; }
    const rows = report.data.keywords.map((k: any) => ({ Keyword: k.keyword, Volume: k.volume, KD: k.kd, CPC: k.cpc }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map((r: any) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `seo-${report.niche}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };
  const handleShare = async () => {
    if (navigator.share) { await navigator.share({ title: `SEO Report: ${report.niche}`, url: window.location.href }).catch(() => {}); }
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }
  };

  if (loading) return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-400" /></main>;
  if (error || !report) return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-red-400"><div className="text-center"><p className="text-xl mb-4">Report not found</p><Link href="/seo-report" className="text-indigo-400">← Back</Link></div></main>;

  const data = report.data;
  const trendLine = data?.chart_data?.trend_12m?.map((v: number, i: number) => ({ month: `M${i+1}`, value: v })) || [];
  const trafficForecast = data?.chart_data?.traffic_forecast_6m?.map((v: number, i: number) => ({ month: `M${i+1}`, traffic: v })) || data?.chart_data?.traffic_growth_6m?.map((v: number, i: number) => ({ month: `M${i+1}`, traffic: v })) || [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div><span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span></Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-indigo-600 text-white font-medium">SEO</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Link href="/history" className="text-neutral-400 hover:text-white"><ArrowLeft size={18} /></Link>
          <Search size={16} className="text-indigo-400" />
          <span className="font-medium capitalize">{report.niche}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">SEO</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyAll} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={handleExportPDF} disabled={pdfGenerating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><FileDown size={14} />PDF</button>
          <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Download size={14} />CSV</button>
          <button onClick={handleShare} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Share2 size={14} />Share</button>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">TREND</p>
            <p className="text-xl font-bold">{data?.trend_assessment || data?.trend_score || '-'}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">KEYWORDS ANALYZED</p>
            <p className="text-xl font-bold font-mono">{data?.keywords?.length || 50}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">6-MONTH TRAFFIC ESTIMATE</p>
            <p className="text-xl font-bold font-mono">{trafficForecast.length > 0 ? trafficForecast[5]?.traffic?.toLocaleString() : '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {trendLine.length > 0 && (
            <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">SEARCH TREND (12 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendLine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#A3A3A3" fontSize={12} />
                  <YAxis stroke="#A3A3A3" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {trafficForecast.length > 0 && (
            <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">TRAFFIC FORECAST (6 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trafficForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#A3A3A3" fontSize={12} />
                  <YAxis stroke="#A3A3A3" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="traffic" stroke="#8B5CF6" fill="#8B5CF630" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Markdown Report */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 md:p-12">
          <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-strong:text-white prose-a:text-indigo-400">
            <ReactMarkdown>{report.markdown}</ReactMarkdown>
          </article>
        </motion.div>
      </div>
    </main>
  );
}
