'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Share2, Loader2, Copy, Check, FileDown, Download, TrendingUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function ProductReportPage() {
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
        if (data.type !== 'product') throw new Error('Invalid report type');
        setReport(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Action handlers (copy, PDF, CSV, share) – same as before
  const handleCopyAll = async () => {
    if (!report?.markdown) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    toast.success('Report copied', { icon: '✅' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!report) return;
    setPdfGenerating(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Allow pop-ups for PDF'); setPdfGenerating(false); return; }
    printWindow.document.write(`<html><head><title>MusePRO Report</title><style>body{font-family:Arial;padding:40px;color:#000;line-height:1.6}pre{white-space:pre-wrap;font-size:12px}</style></head><body><h1>Product Research: ${report.niche}</h1><pre>${report.markdown}</pre></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); setPdfGenerating(false); }, 500);
  };

  const handleExportCSV = () => {
    if (!report?.data?.pricing_engine) { toast.error('No pricing data'); return; }
    const rows = report.data.pricing_engine.map((p: any) => ({
      Product: p.title, Price: p.selling_price_usd, Cost: p.landed_cost_usd, Profit: p.net_profit_usd, Margin: p.profit_margin_percent + '%', Reviews: p.reviews
    }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map((r: any) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `product-${report.niche}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const handleShare = async () => {
    if (navigator.share) { await navigator.share({ title: `Product Research: ${report.niche}`, url: window.location.href }).catch(() => {}); }
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-emerald-400" />
    </main>
  );
  if (error || !report) return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-red-400">
      <div className="text-center"><p className="text-xl mb-4">Report not found</p><Link href="/product-research" className="text-indigo-400">← Back</Link></div>
    </main>
  );

  const data = report.data;
  const financials = data?.financial_forecast || data?.financial_projections || {};
  const demandTrend = data?.chart_data?.demand_forecast_12m?.map((v: number, i: number) => ({ month: `M${i+1}`, value: v })) || [];
  const marketShare = data?.chart_data?.competitor_market_share || [];
  const profitBars = data?.pricing_engine?.map((p: any) => ({ name: p.title?.substring(0, 20), margin: p.profit_margin_percent })) || [];
  const risks = data?.risk_matrix || data?.risk_radar || [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Navbar (same as before, with LiveStatus and links) */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
              <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-emerald-600 text-white font-medium">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO</Link>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Link href="/history" className="text-neutral-400 hover:text-white"><ArrowLeft size={18} /></Link>
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="font-medium capitalize">{report.niche}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Product</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyAll} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={handleExportPDF} disabled={pdfGenerating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><FileDown size={14} />PDF</button>
          <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Download size={14} />CSV</button>
          <button onClick={handleShare} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Share2 size={14} />Share</button>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">OPPORTUNITY SCORE</p>
            <div className="flex items-baseline gap-1"><span className="text-2xl font-bold font-mono">{data?.market_score || '-'}</span><span className="text-sm text-neutral-500">/100</span></div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-neutral-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${data?.market_score || 0}%` }} /></div>
          </div>
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">EST. MONTHLY PROFIT</p>
            <p className="text-2xl font-bold font-mono">${financials?.month6_profit_optimistic?.toLocaleString() || '-'}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">BREAKEVEN</p>
            <p className="text-2xl font-bold font-mono">{financials?.units_to_breakeven?.toLocaleString() || '-'} units</p>
          </div>
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">TIME TO PROFIT</p>
            <p className="text-2xl font-bold font-mono">{financials?.months_to_profitability || '-'} months</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {demandTrend.length > 0 && (
            <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">DEMAND TREND (12 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#A3A3A3" fontSize={12} />
                  <YAxis stroke="#A3A3A3" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {marketShare.length > 0 && (
            <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
              <h3 className="text-sm font-semibold mb-3">MARKET SHARE DISTRIBUTION</h3>
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
                  <div key={idx} className="flex items-center gap-1 text-xs text-neutral-400"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />{entry.name}: {entry.share}%</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {profitBars.length > 0 && (
          <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800 mb-8">
            <h3 className="text-sm font-semibold mb-3">MARGIN COMPARISON BY PRODUCT</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitBars} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#A3A3A3" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke="#A3A3A3" fontSize={11} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }} formatter={(value: any) => `${value}%`} />
                <Bar dataKey="margin" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Matrix */}
        {risks.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <h3 className="text-sm font-semibold mb-3">RISK ASSESSMENT MATRIX</h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b border-neutral-700 text-neutral-400"><th className="text-left py-2 px-3">Risk</th><th className="text-left py-2 px-3">Probability</th><th className="text-left py-2 px-3">Impact</th><th className="text-left py-2 px-3">Mitigation</th></tr></thead>
              <tbody>
                {risks.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-neutral-800">
                    <td className="py-2 px-3">{r.risk}</td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.probability === 'High' ? 'bg-red-500/20 text-red-400' : r.probability === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{r.probability}</span></td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.impact === 'High' ? 'bg-red-500/20 text-red-400' : r.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{r.impact}</span></td>
                    <td className="py-2 px-3 text-neutral-400">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
