'use client';
import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function UnifiedReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

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
    } else if (report.type === 'seo' && report.data.keywords) {
      rows = report.data.keywords.map((k: any) => ({
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
  const keywords = data.keywords || [];
  const realProducts = data.realProducts || [];
  const serpResults = data.serpResults || data.serp || [];

  const trendLine = data.chart_data?.trend_12m?.map((v: number, i: number) => ({ month: `M${i + 1}`, value: v })) || [];
  const trafficForecast = data.chart_data?.traffic_forecast_6m?.map((v: number, i: number) => ({ month: `M${i + 1}`, traffic: v })) || data.chart_data?.traffic_growth_6m?.map((v: number, i: number) => ({ month: `M${i + 1}`, traffic: v })) || [];
  const marketShare = data.chart_data?.competitor_market_share || [];

  const score = isProduct
    ? (data.market_score || data.opportunity_score || data.score || 0)
    : (data.trend_score === 'Evergreen' ? 70 : data.trend_score === 'Seasonal' ? 50 : trafficForecast.length ? Math.min(Math.round(trafficForecast[trafficForecast.length - 1]?.traffic / 1000), 100) : 0);

  const getProfitOrTraffic = () => {
    if (isProduct) return data.financial_forecast?.month6_profit_optimistic || data.financial_forecast?.month6_profit_conservative || 0;
    return trafficForecast.length ? trafficForecast[trafficForecast.length - 1]?.traffic || 0 : 0;
  };

  const SectionCopyButton = ({ label, text }: { label: string; text: string }) => (
    <button
      onClick={() => copyText(text, label)}
      className="ml-2 p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
      title={`Copy ${label}`}
    >
      {copied === label ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );

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
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO</Link>
          </div>
        </div>
      </nav>

      {/* Top Action Bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-3 border-b border-neutral-800/50">
        <div className="flex items-center gap-3">
          <Link href="/history" className="text-neutral-400 hover:text-white"><ArrowLeft size={18} /></Link>
          {isProduct ? <TrendingUp size={16} className="text-emerald-400" /> : <Search size={16} className="text-indigo-400" />}
          <span className="font-semibold capitalize">{report.niche}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isProduct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{isProduct ? 'Product' : 'SEO'}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => copyText(report.markdown, 'Complete Report')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            {copied === 'Complete Report' ? <Check size={16} /> : <Copy size={16} />}
            {copied === 'Complete Report' ? 'Copied' : 'Copy Complete Report'}
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><FileDown size={14} />PDF</button>
          <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Download size={14} />CSV</button>
          <button onClick={handleShare} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"><Share2 size={14} />Share</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-400">{isProduct ? 'OPPORTUNITY SCORE' : 'TREND'}</p>
              <SectionCopyButton label={isProduct ? 'Opportunity Score' : 'Trend'} text={isProduct ? `${score}/100` : (data.trend_assessment || data.trend_score || 'N/A')} />
            </div>
            <p className="text-3xl font-bold font-mono">{isProduct ? `${score}/100` : (data.trend_assessment || data.trend_score || 'N/A')}</p>
            {isProduct && <div className="mt-2 w-full h-1.5 rounded-full bg-neutral-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${score}%` }} /></div>}
          </div>
          {isProduct ? (
            <>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">EST. MONTHLY PROFIT</p>
                  <SectionCopyButton label="Est. Monthly Profit" text={`$${getProfitOrTraffic().toLocaleString()}`} />
                </div>
                <p className="text-2xl font-bold font-mono">${getProfitOrTraffic().toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">BREAKEVEN</p>
                  <SectionCopyButton label="Breakeven" text={`${data.financial_forecast?.units_to_breakeven || 'N/A'} units`} />
                </div>
                <p className="text-2xl font-bold font-mono">{data.financial_forecast?.units_to_breakeven?.toLocaleString() || 'N/A'} units</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">TIME TO PROFIT</p>
                  <SectionCopyButton label="Time to Profit" text={`${data.financial_forecast?.months_to_profitability || 'N/A'} months`} />
                </div>
                <p className="text-2xl font-bold font-mono">{data.financial_forecast?.months_to_profitability || 'N/A'} months</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">KEYWORDS ANALYZED</p>
                  <SectionCopyButton label="Keywords Analyzed" text={keywords.length.toString()} />
                </div>
                <p className="text-2xl font-bold font-mono">{keywords.length}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-400">6-MONTH TRAFFIC EST.</p>
                  <SectionCopyButton label="Traffic Estimate" text={`${trafficForecast.length ? trafficForecast[trafficForecast.length - 1]?.traffic.toLocaleString() : 'N/A'} visits`} />
                </div>
                <p className="text-2xl font-bold font-mono">{trafficForecast.length ? trafficForecast[trafficForecast.length - 1]?.traffic.toLocaleString() : 'N/A'}</p>
              </div>
            </>
          )}
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
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
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
                  <div key={idx} className="flex items-center gap-1 text-xs text-neutral-400"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />{entry.name}: {entry.share}%</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Tables */}
        {isProduct && realProducts.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">PRODUCTS WORTH SELLING</h3>
              <SectionCopyButton label="Products Table" text={realProducts.map((p: any) => `${p.title} | $${p.price} | ${p.reviews} reviews | ${p.source}`).join('\n')} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-neutral-700 text-neutral-400"><th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Product</th><th className="text-left py-2 px-3">Price</th><th className="text-left py-2 px-3">Reviews</th><th className="text-left py-2 px-3">Source</th></tr></thead>
                <tbody>{realProducts.map((p: any, i: number) => <tr key={i} className="border-b border-neutral-800"><td className="py-2 px-3">{i + 1}</td><td className="py-2 px-3">{p.title}</td><td className="py-2 px-3">${p.price.toLocaleString()}</td><td className="py-2 px-3">{p.reviews}</td><td className="py-2 px-3">{p.source}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {!isProduct && keywords.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">KEYWORDS WORTH TARGETING</h3>
              <SectionCopyButton label="Keywords Table" text={keywords.map((k: any) => `${k.keyword} | Volume: ${k.volume ?? 'Not Disclosed'} | CPC: ${k.cpc ?? 'Not Disclosed'} | KD: ${k.kd ?? 'Not Disclosed'}`).join('\n')} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-neutral-700 text-neutral-400"><th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Keyword</th><th className="text-left py-2 px-3">Volume</th><th className="text-left py-2 px-3">CPC</th><th className="text-left py-2 px-3">KD</th></tr></thead>
                <tbody>{keywords.slice(0, 50).map((k: any, i: number) => <tr key={i} className="border-b border-neutral-800"><td className="py-2 px-3">{i + 1}</td><td className="py-2 px-3">{k.keyword}</td><td className="py-2 px-3">{k.volume?.toLocaleString() ?? 'Not Disclosed'}</td><td className="py-2 px-3">{k.cpc ? `$${k.cpc.toFixed(2)}` : 'Not Disclosed'}</td><td className="py-2 px-3">{k.kd ?? 'Not Disclosed'}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complete Markdown Report */}
        <div className="max-w-4xl mx-auto px-6 pb-20 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Complete Report</h2>
            <button
              onClick={() => copyText(report.markdown, 'Complete Report')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              {copied === 'Complete Report' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'Complete Report' ? 'Copied' : 'Copy Complete Report'}
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 md:p-12">
            <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-strong:text-white prose-a:text-indigo-400">
              <ReactMarkdown>{report.markdown}</ReactMarkdown>
            </article>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
