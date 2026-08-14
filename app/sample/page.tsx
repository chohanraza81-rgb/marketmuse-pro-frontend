'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, ArrowLeft } from 'lucide-react';
import LiveStatus from '@/components/LiveStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function SamplePage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/reports?limit=1&type=seo`)
      .then(r => r.json())
      .then(d => {
        if (d.reports?.[0]) {
          return fetch(`${API_URL}/reports/${d.reports[0]._id}`);
        }
        throw new Error('No sample');
      })
      .then(r => r.json())
      .then(data => setReport(data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-neutral-700 border-t-indigo-500 rounded-full animate-spin" /></main>;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
            <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>
          <LiveStatus />
        </div>
      </nav>
      <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-300 mb-8"><ArrowLeft size={14} /> Back</Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Sample Report</h1>
          <p className="text-neutral-400">Here's a glimpse of what you'll get.</p>
        </div>
        {report ? (
          <>
            <div className="p-5 rounded-2xl bg-[#0F0F14] border border-neutral-800 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold capitalize">{report.niche}</h2>
                <button onClick={() => copy(report.markdown, 'Full Report')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm">
                  {copied === 'Full Report' ? <Check size={14} /> : <Copy size={14} />} Copy Full Report
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-neutral-400">MARKET SCORE</p>
                    <button onClick={() => copy('Market Score: 82/100', 'Market Score')} className="text-neutral-400 hover:text-white">{copied === 'Market Score' ? <Check size={12} /> : <Copy size={12} />}</button>
                  </div>
                  <p className="text-2xl font-bold font-mono">82/100</p>
                </div>
                <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-neutral-400">KEYWORDS</p>
                    <button onClick={() => copy('50 Keywords Analyzed', 'Keywords')} className="text-neutral-400 hover:text-white">{copied === 'Keywords' ? <Check size={12} /> : <Copy size={12} />}</button>
                  </div>
                  <p className="text-2xl font-bold font-mono">50</p>
                </div>
                <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-neutral-400">TREND</p>
                    <button onClick={() => copy('Trend: Evergreen', 'Trend')} className="text-neutral-400 hover:text-white">{copied === 'Trend' ? <Check size={12} /> : <Copy size={12} />}</button>
                  </div>
                  <p className="text-2xl font-bold font-mono">Evergreen</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-3xl p-8">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: report.markdown?.replace(/\n/g, '<br/>') }} />
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-neutral-500">No sample report available yet. Generate one first.</div>
        )}
      </div>
    </main>
  );
}
