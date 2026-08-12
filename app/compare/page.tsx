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
  TrendingUp,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import LiveStatus from '@/components/LiveStatus';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface Report {
  _id: string;
  type: 'product' | 'seo';
  niche: string;
  country: string;
  data: any;
  markdown: string;
}

const flags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

// ─── PDF Styles ───
const pdfStyles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111111' },
  subtitle: { fontSize: 12, color: '#444444', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#333333' },
  row: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  cell: { flex: 1, border: '1px solid #cccccc', padding: 10, borderRadius: 4 },
  label: { fontSize: 10, color: '#666666', marginBottom: 4 },
  value: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  table: { width: '100%', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #cccccc', paddingVertical: 5 },
  tableCell: { flex: 1, fontSize: 10 },
});

function ComparisonPDF({ report1, report2 }: { report1: Report | null; report2: Report | null }) {
  if (!report1 || !report2) return null;

  const getScore = (r: Report) => r.data?.market_score ?? r.data?.trend_score ?? 0;
  const getProfit = (r: Report) => r.data?.financial_forecast?.month6_profit_optimistic ?? r.data?.chart_data?.traffic_forecast_6m?.[5]?.traffic ?? 0;
  const winner = getScore(report1) >= getScore(report2) ? report1.niche : report2.niche;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>MusePRO — Report Comparison</Text>
        <Text style={pdfStyles.subtitle}>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        <View style={pdfStyles.row}>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>REPORT 1</Text>
            <Text style={pdfStyles.value}>{report1.niche} ({report1.country.toUpperCase()})</Text>
            <Text style={pdfStyles.value}>Type: {report1.type}</Text>
          </View>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>REPORT 2</Text>
            <Text style={pdfStyles.value}>{report2.niche} ({report2.country.toUpperCase()})</Text>
            <Text style={pdfStyles.value}>Type: {report2.type}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Market Score Comparison</Text>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Score 1</Text>
            <Text style={pdfStyles.value}>{getScore(report1)}/100</Text>
          </View>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Score 2</Text>
            <Text style={pdfStyles.value}>{getScore(report2)}/100</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Opportunity Level</Text>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Report 1</Text>
            <Text style={pdfStyles.value}>{report1.data?.opportunity_level || report1.data?.trend_assessment || report1.data?.trend_score || 'N/A'}</Text>
          </View>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Report 2</Text>
            <Text style={pdfStyles.value}>{report2.data?.opportunity_level || report2.data?.trend_assessment || report2.data?.trend_score || 'N/A'}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Financial / Traffic Projection</Text>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Est. Monthly Profit / Traffic</Text>
            <Text style={pdfStyles.value}>
              {report1.type === 'product' ? `$${getProfit(report1).toLocaleString()}` : `${getProfit(report1).toLocaleString()} visits`}
            </Text>
          </View>
          <View style={pdfStyles.cell}>
            <Text style={pdfStyles.label}>Est. Monthly Profit / Traffic</Text>
            <Text style={pdfStyles.value}>
              {report2.type === 'product' ? `$${getProfit(report2).toLocaleString()}` : `${getProfit(report2).toLocaleString()} visits`}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Winner</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111111' }}>
          {winner} is the stronger opportunity.
        </Text>
      </Page>
    </Document>
  );
}

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

  const getScore = (r: Report | null): number => {
    if (!r) return 0;
    if (typeof r.data?.market_score === 'number') return r.data.market_score;
    if (r.type === 'seo') {
      const forecast = r.data?.chart_data?.traffic_forecast_6m || r.data?.chart_data?.traffic_growth_6m;
      if (forecast && forecast.length > 0) return forecast[forecast.length - 1]?.traffic ?? 0;
    }
    return 0;
  };

  const getProfitOrTraffic = (r: Report | null): number => {
    if (!r) return 0;
    if (r.type === 'product') return r.data?.financial_forecast?.month6_profit_optimistic || 0;
    const forecast = r.data?.chart_data?.traffic_forecast_6m || r.data?.chart_data?.traffic_growth_6m;
    return forecast?.[forecast.length - 1]?.traffic || 0;
  };

  const handleCompare = () => {
    if (!selected1 || !selected2) {
      toast.error('Please select both reports');
      return;
    }
    const r1 = reports.find((r) => r._id === selected1) || null;
    const r2 = reports.find((r) => r._id === selected2) || null;
    setReport1(r1);
    setReport2(r2);
    if (r1 && r2) toast.success('Comparison ready');
  };

  const handleCopyMarkdown = async () => {
    if (!report1 || !report2) {
      toast.error('No comparison to copy');
      return;
    }
    const md = `# MusePRO — Report Comparison\n\n## Report 1\n- **Niche:** ${report1.niche}\n- **Country:** ${flags[report1.country]} ${report1.country.toUpperCase()}\n- **Type:** ${report1.type}\n- **Market Score:** ${getScore(report1)}/100\n- **Opportunity Level:** ${report1.data?.opportunity_level || report1.data?.trend_assessment || 'N/A'}\n- **Est. Monthly Profit / Traffic:** ${report1.type === 'product' ? `$${getProfitOrTraffic(report1).toLocaleString()}` : `${getProfitOrTraffic(report1).toLocaleString()} visits`}\n\n## Report 2\n- **Niche:** ${report2.niche}\n- **Country:** ${flags[report2.country]} ${report2.country.toUpperCase()}\n- **Type:** ${report2.type}\n- **Market Score:** ${getScore(report2)}/100\n- **Opportunity Level:** ${report2.data?.opportunity_level || report2.data?.trend_assessment || 'N/A'}\n- **Est. Monthly Profit / Traffic:** ${report2.type === 'product' ? `$${getProfitOrTraffic(report2).toLocaleString()}` : `${getProfitOrTraffic(report2).toLocaleString()} visits`}\n\n## Winner\n**${getScore(report1) >= getScore(report2) ? report1.niche : report2.niche}** is the stronger opportunity.`;
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
      ['Opportunity Level', report1.data?.opportunity_level || report1.data?.trend_assessment || '', report2.data?.opportunity_level || report2.data?.trend_assessment || ''],
      ['Est. Monthly Profit / Traffic', report1.type === 'product' ? `$${getProfitOrTraffic(report1)}` : `${getProfitOrTraffic(report1)} visits`, report2.type === 'product' ? `$${getProfitOrTraffic(report2)}` : `${getProfitOrTraffic(report2)} visits`],
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

  const comparisonData = report1 && report2 ? [
    { metric: 'Market Score', report1: getScore(report1), report2: getScore(report2) },
    { metric: report1.type === 'product' ? 'Profit' : 'Traffic', report1: getProfitOrTraffic(report1), report2: getProfitOrTraffic(report2) },
  ] : [];

  return (
    <main className="min-h-screen bg-[#09090B] text-white font-['Inter']">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090B]/80 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
            <select
              value={selected1}
              onChange={(e) => setSelected1(e.target.value)}
              className="w-full bg-[#171717] border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
            >
              <option value="">Select report...</option>
              {reports.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.niche} — {r.type.toUpperCase()} ({flags[r.country]})
                </option>
              ))}
            </select>
          </div>
          <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800/60">
            <label className="block text-sm font-semibold text-purple-300 mb-3">Report 2</label>
            <select
              value={selected2}
              onChange={(e) => setSelected2(e.target.value)}
              className="w-full bg-[#171717] border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50"
            >
              <option value="">Select report...</option>
              {reports.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.niche} — {r.type.toUpperCase()} ({flags[r.country]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={handleCompare}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            Compare Reports
          </button>
          {report1 && report2 && (
            <>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied Markdown' : 'Copy Markdown'}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15"
              >
                <Download size={18} />
                Export CSV
              </button>
              <PDFDownloadLink
                document={<ComparisonPDF report1={report1} report2={report2} />}
                fileName={`musePRO-comparison-${new Date().getTime()}.pdf`}
              >
                {({ loading }) => (
                  <button
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/15"
                  >
                    <FileDown size={18} />
                    {loading ? 'Generating PDF...' : 'High‑Quality PDF'}
                  </button>
                )}
              </PDFDownloadLink>
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
              {/* Report 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-6 rounded-2xl border-2 ${
                  getScore(report1) >= getScore(report2)
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-neutral-800 bg-[#0F0F14]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${report1.type === 'product' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {report1.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-neutral-400">{flags[report1.country]} {report1.country.toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-bold capitalize mb-4">{report1.niche}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Market Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getScore(report1)}%` }} />
                      </div>
                      <span className="font-mono font-bold">{getScore(report1)}/100</span>
                    </div>
                  </div>
                  <p><span className="text-neutral-500">Opportunity:</span> <strong>{report1.data?.opportunity_level || report1.data?.trend_assessment || 'N/A'}</strong></p>
                  <p>
                    <span className="text-neutral-500">{report1.type === 'product' ? 'Est. Monthly Profit:' : 'Est. 6‑Month Traffic:'}</span>{' '}
                    <strong>{report1.type === 'product' ? `$${getProfitOrTraffic(report1).toLocaleString()}` : `${getProfitOrTraffic(report1).toLocaleString()} visits`}</strong>
                  </p>
                  <p><span className="text-neutral-500">Risks:</span> <strong>{(report1.data?.risk_matrix || report1.data?.risk_radar || []).length}</strong></p>
                </div>
              </motion.div>

              {/* Report 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-6 rounded-2xl border-2 ${
                  getScore(report2) > getScore(report1)
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-neutral-800 bg-[#0F0F14]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${report2.type === 'product' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {report2.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-neutral-400">{flags[report2.country]} {report2.country.toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-bold capitalize mb-4">{report2.niche}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Market Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${getScore(report2)}%` }} />
                      </div>
                      <span className="font-mono font-bold">{getScore(report2)}/100</span>
                    </div>
                  </div>
                  <p><span className="text-neutral-500">Opportunity:</span> <strong>{report2.data?.opportunity_level || report2.data?.trend_assessment || 'N/A'}</strong></p>
                  <p>
                    <span className="text-neutral-500">{report2.type === 'product' ? 'Est. Monthly Profit:' : 'Est. 6‑Month Traffic:'}</span>{' '}
                    <strong>{report2.type === 'product' ? `$${getProfitOrTraffic(report2).toLocaleString()}` : `${getProfitOrTraffic(report2).toLocaleString()} visits`}</strong>
                  </p>
                  <p><span className="text-neutral-500">Risks:</span> <strong>{(report2.data?.risk_matrix || report2.data?.risk_radar || []).length}</strong></p>
                </div>
              </motion.div>
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
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            Select two reports and click <strong className="text-indigo-400">Compare Reports</strong> to see the battle.
          </div>
        )}
      </div>
    </main>
  );
}
