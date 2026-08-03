'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Share2, Loader2, Copy, Check, FileDown, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ProductReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`https://marketmuse-pro-backend-production.up.railway.app/api/reports/${id}`)
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

  const handleCopyAll = async () => {
    if (!report?.markdown) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    toast.success('Report copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!report) return;
    setPdfGenerating(true);
    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups for PDF export');
      setPdfGenerating(false);
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>MarketMuse PRO Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #000; line-height: 1.6; }
            h1 { color: #1a1a1a; }
            pre { white-space: pre-wrap; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Product Research: ${report.niche}</h1>
          <pre>${report.markdown}</pre>
          <footer style="margin-top: 40px; font-size: 12px; color: #666;">MarketMuse PRO – Private Report</footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setPdfGenerating(false);
    }, 500);
  };

  const handleExportCSV = () => {
    if (!report?.data?.pricing_engine) {
      toast.error('No pricing data to export');
      return;
    }
    const rows = report.data.pricing_engine.map((p: any) => ({
      Product: p.title,
      Price: p.selling_price_usd,
      Cost: p.landed_cost_usd,
      Profit: p.net_profit_usd,
      Margin: p.profit_margin_percent + '%',
      Reviews: p.reviews,
    }));
    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map((r: any) => Object.values(r).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-research-${report.niche?.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Product Research: ${report?.niche}`,
          text: 'Check out this product research report from MarketMuse PRO.',
          url: window.location.href,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto" />
          <p className="text-neutral-400">Loading report...</p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">⚠️ {error || 'Report not found'}</p>
          <Link href="/product-research" className="text-indigo-400 hover:underline">← Back to Product Research</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">MarketMuse<span className="text-indigo-400"> PRO</span></span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-emerald-600 text-white font-medium">Product</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">SEO</Link>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-neutral-500 hover:text-neutral-300 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <span className="text-sm text-neutral-300 font-medium capitalize">{report.niche}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Product</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300 transition-colors disabled:opacity-50"
            >
              <FileDown size={14} />
              {pdfGenerating ? 'Opening...' : 'PDF'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300 transition-colors"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300 transition-colors"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 md:p-12"
        >
          <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-300 prose-strong:text-white prose-a:text-indigo-400 prose-table:text-sm">
            <ReactMarkdown>{report.markdown}</ReactMarkdown>
          </article>
        </motion.div>
      </div>
    </main>
  );
}
