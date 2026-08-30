// app/dashboard/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Download, Mail, Share2, Printer, Sparkles, ArrowLeft,
  Copy, Check, Clock, Send, Package, TrendingUp, Globe, Zap,
  DollarSign, Users, Target, BarChart, Gauge, X, Paperclip
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export default function ReportDashboard() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Email states
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendMarkdown, setSendMarkdown] = useState(true);
  const [sendSnapshot, setSendSnapshot] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Share states
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState(24);
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/reports/${reportId}`);
        if (!res.ok) throw new Error('Failed to load report');
        const data = await res.json();
        setReport(data);
        
        const typeLabel = data.type === 'product' ? 'Product Research' : 'SEO';
        setEmailSubject(`Your ${typeLabel} Report: ${data.niche}`);
        setEmailBody(`Dear Client,\n\nPlease find your ${typeLabel} Report attached.\n\nReport: ${data.niche}\nCountry: ${data.country?.toUpperCase()}\n\nBest regards,\nMusePRO Team`);
      } catch (err: any) {
        setError(err?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId]);

  const generatePDF = async () => {
    setGeneratingPDF(true);
    try {
      const element = document.getElementById('dashboard-content');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0A0A0F', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`MusePRO_${report?.niche?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo) {
      alert('Please enter recipient email');
      return;
    }
    setSending(true);
    try {
      const emailAttachments = [];
      
      if (sendMarkdown && report?.markdown) {
        emailAttachments.push({
          name: `${report.niche?.replace(/\s+/g, '_')}_report.md`,
          content: Buffer.from(report.markdown).toString('base64'),
          contentType: 'text/markdown',
        });
      }

      if (sendSnapshot) {
        const element = document.getElementById('dashboard-content');
        if (element) {
          const canvas = await html2canvas(element, { scale: 1.5, backgroundColor: '#0A0A0F', useCORS: true });
          const imgData = canvas.toDataURL('image/png').split(',')[1];
          emailAttachments.push({
            name: `${report.niche?.replace(/\s+/g, '_')}_dashboard.png`,
            content: imgData,
            contentType: 'image/png',
          });
        }
      }

      const payload = {
        to: emailTo.split(',').map((e: string) => e.trim()).filter(Boolean),
        subject: emailSubject,
        body: emailBody,
        attachments: emailAttachments,
      };

      console.log('Sending email payload:', JSON.stringify(payload).substring(0, 200));

      const res = await fetch(`${API_URL}/reports/${reportId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const responseData = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.details || 'Failed to send email');
      }
      
      alert('✅ Email sent successfully!');
      setShowEmailModal(false);
      setEmailTo('');
    } catch (err: any) {
      console.error('Email error:', err);
      alert('❌ ' + (err?.message || 'Failed to send email'));
    } finally {
      setSending(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      console.log('Generating share link for report:', reportId);
      
      const res = await fetch(`${API_URL}/reports/${reportId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInHours: shareExpiry,
          password: sharePassword || null,
        }),
      });
      
      const responseData = await res.json().catch(() => ({}));
      console.log('Share response:', responseData);
      
      if (!res.ok) {
        throw new Error(responseData?.error || 'Failed to generate link');
      }
      
      // Backend returns /api/reports/share/:token
      const fullLink = `${window.location.origin}${responseData.link}`;
      setShareLink(fullLink);
    } catch (err: any) {
      console.error('Share error:', err);
      alert('❌ ' + (err?.message || 'Failed to generate link'));
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <Sparkles size={48} className="text-indigo-400 animate-pulse" />
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20">
          <ArrowLeft size={16} className="inline mr-2" /> Back
        </Link>
      </div>
    </main>
  );

  if (!report) return null;

  const { data, keywords, serp_landscape, traffic_estimate, chart_data } = report;
  const isProduct = report.type === 'product';

  const overallScore = data?.score || 75;

  const trendData = chart_data?.trend_12m?.length > 0 
    ? chart_data.trend_12m 
    : Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: Math.floor(30 + Math.random() * 70) }));

  const forecastData = chart_data?.traffic_forecast_6m?.length > 0 
    ? chart_data.traffic_forecast_6m 
    : Array.from({ length: 6 }, (_, i) => ({ month: `M${i + 1}`, traffic: Math.floor(500 + Math.random() * 1500) }));

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div id="dashboard-content">
          {/* Header with Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                {report.niche}
              </h1>
              <p className="mt-2 text-neutral-400 flex items-center gap-2">
                {isProduct ? <Package size={14} /> : <TrendingUp size={14} />}
                {isProduct ? 'Product Research' : 'SEO Report'}
                <span className="mx-2">•</span>
                {report.country?.toUpperCase()}
                <span className="mx-2">•</span>
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Action Buttons - ONLY ONE EMAIL, ONE SHARE */}
            <div className="flex flex-wrap gap-3">
              <button onClick={generatePDF} disabled={generatingPDF} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50">
                <Download size={18} /> {generatingPDF ? '...' : 'PDF'}
              </button>
              <button onClick={() => setShowEmailModal(true)} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2">
                <Mail size={18} /> Email
              </button>
              <button onClick={() => setShowShareModal(true)} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2">
                <Share2 size={18} /> Share
              </button>
              <button onClick={() => window.print()} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2">
                <Printer size={18} />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-neutral-400">Overall Score</p>
              <p className="text-3xl font-black mt-2 text-indigo-400">{overallScore}/100</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-neutral-400">{isProduct ? 'Financial Tiers' : 'Traffic Estimate'}</p>
              <p className="text-3xl font-black mt-2 text-emerald-400">
                {isProduct ? (data?.financial_model?.length || 0) : (traffic_estimate || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-neutral-400">Keywords</p>
              <p className="text-3xl font-black mt-2 text-purple-400">{keywords?.length || 0}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-neutral-400">Competitors</p>
              <p className="text-3xl font-black mt-2 text-pink-400">{serp_landscape?.length || data?.competition_analysis?.length || 0}</p>
            </div>
          </div>

          {/* Product Report Data */}
          {isProduct && data?.financial_model?.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">💰 Financial Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.financial_model.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-emerald-400">{item.tier_name || `Tier ${i + 1}`}</p>
                    <p className="text-2xl font-bold mt-1">{item.price_sar || item.price || 'N/A'}</p>
                    <p className="text-xs text-neutral-400 mt-2">{item.target_audience || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">12-Month Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Traffic Forecast</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {!isProduct && keywords?.length > 0 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Top Keywords</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={keywords.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={80} stroke="#ffffff50" />
                    <YAxis stroke="#ffffff50" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="volume" fill="#8b5cf6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* SERP Table */}
          {!isProduct && serp_landscape?.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Competitor SERP Landscape</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-neutral-400">
                    <th className="pb-3">#</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Traffic</th>
                  </tr>
                </thead>
                <tbody>
                  {serp_landscape.slice(0, 5).map((s: any, i: number) => (
                    <tr key={i} className="border-t border-white/5 text-sm">
                      <td className="py-3 text-neutral-400">{i+1}</td>
                      <td className="py-3"><a href={s.link} target="_blank" className="text-indigo-400">{s.title}</a></td>
                      <td className="py-3">{(s.traffic || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
      {showEmailModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Mail size={20} className="text-indigo-400" /> Email Report</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Recipient Email *</label>
                <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="client@example.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Subject</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-2"><Paperclip size={14} /> Attachments</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendMarkdown} onChange={() => setSendMarkdown(!sendMarkdown)} className="accent-indigo-500" />
                  <span className="text-sm">Markdown Report (.md)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" checked={sendSnapshot} onChange={() => setSendSnapshot(!sendSnapshot)} className="accent-indigo-500" />
                  <span className="text-sm">Dashboard Snapshot (.png)</span>
                </label>
              </div>
              <button onClick={handleSendEmail} disabled={sending} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <Send size={16} /> {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
      {showShareModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Share2 size={20} className="text-indigo-400" /> Share Report</h2>
              <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1 flex items-center gap-2"><Clock size={14} /> Expiry</label>
                <select value={shareExpiry} onChange={(e) => setShareExpiry(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none">
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                </select>
              </div>
              {shareLink ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs truncate">{shareLink}</span>
                  <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              ) : (
                <button onClick={handleGenerateShareLink} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2">
                  <Share2 size={16} /> Generate Link
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
}
