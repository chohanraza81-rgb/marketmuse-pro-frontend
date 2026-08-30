// app/dashboard/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Download, Mail, Share2, Printer, Camera, Sparkles, ArrowLeft,
  Copy, Check, Lock, Clock, Send, LayoutDashboard, BarChart3, MailOpen,
  Share2 as ShareIcon, Settings, TrendingUp, Globe, Zap, Wifi, WifiOff
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'email', label: 'Email', icon: MailOpen },
  { id: 'share', label: 'Share', icon: ShareIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ReportDashboard() {
  const params = useParams();
  const reportId = params?.id as string;
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Your Report from MusePRO');
  const [emailBody, setEmailBody] = useState('Dear Client, please find your report attached.');
  const [attachments, setAttachments] = useState<string[]>(['pdf', 'markdown']);
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState(24);
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/reports/${reportId}`);
        setReport(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();

    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reportId]);

  const generatePDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0A0A0F' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MusePRO_Report_${reportId}.pdf`);
  };

  const captureChart = async (chartId: string) => {
    const element = document.getElementById(chartId);
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement('a');
    link.download = `${chartId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSendEmail = async () => {
    if (!emailTo) return alert('Please enter recipient email');
    setSending(true);
    try {
      await axios.post(`/api/reports/${reportId}/email`, {
        to: emailTo.split(',').map((e: string) => e.trim()),
        subject: emailSubject,
        body: emailBody,
        attachments: attachments.map(att => ({
          name: att === 'markdown' ? 'report.md' : 'report.pdf',
          content: att === 'markdown' ? Buffer.from(report?.markdown || '').toString('base64') : '',
          contentType: att === 'markdown' ? 'text/markdown' : 'application/pdf',
        })),
      });
      alert('Email sent successfully!');
      setEmailModal(false);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await axios.post(`/api/reports/${reportId}/share`, {
        expiresInHours: shareExpiry,
        password: sharePassword || null,
      });
      setShareLink(`${window.location.origin}${res.data.link}`);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to generate link');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">Loading dashboard...</div>;
  if (error) return <div className="min-h-screen bg-[#0A0A0F] text-red-400 flex items-center justify-center">{error}</div>;
  if (!report) return null;

  const { data, markdown, chart_data, keywords, serp_landscape, traffic_estimate } = report;
  const trendData = chart_data?.trend_12m || [];
  const forecastData = chart_data?.traffic_forecast_6m || [];
  const marketShare = chart_data?.market_share || [];
  const topKeywords = keywords?.slice(0, 10) || [];
  const scoreBreakdown = [
    { category: 'Infrastructure', score: data?.infrastructureScore || 0 },
    { category: 'On-Page', score: data?.onPageScore || 0 },
    { category: 'Technical', score: data?.technicalScore || 0 },
    { category: 'Security', score: data?.securityScore || 0 },
  ];

  const intentCounts: Record<string, number> = {};
  keywords?.forEach((kw: any) => {
    const intent = kw.intent || 'informational';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });
  const pieData = Object.keys(intentCounts).map(key => ({ name: key, value: intentCounts[key] }));

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          {/* Online/Offline Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Live' : 'Offline'}
          </div>

          <Link href="/history" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div id="dashboard-content">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                      {report.niche}
                    </h1>
                    <p className="mt-2 text-neutral-400">
                      {report.country?.toUpperCase()} | {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={generatePDF} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                      <Download size={18} /> PDF
                    </button>
                    <button onClick={() => setEmailModal(true)} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-semibold flex items-center gap-2">
                      <Mail size={18} /> Email
                    </button>
                    <button onClick={() => setShareModal(true)} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-semibold flex items-center gap-2">
                      <Share2 size={18} /> Share
                    </button>
                    <button onClick={() => window.print()} className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-semibold flex items-center gap-2">
                      <Printer size={18} /> Print
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Overall Score', value: `${data?.score}/100`, color: 'text-indigo-400', icon: TrendingUp },
                    { label: 'Traffic Estimate', value: traffic_estimate?.toLocaleString() || '0', color: 'text-emerald-400', icon: Globe },
                    { label: 'Keywords', value: keywords?.length || '0', color: 'text-purple-400', icon: Zap },
                    { label: 'Competitors', value: serp_landscape?.length || '0', color: 'text-pink-400', icon: BarChart3 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-400">{item.label}</p>
                        <item.icon size={18} className={item.color} />
                      </div>
                      <p className={`text-3xl font-black mt-2 ${item.color}`}>{item.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div id="trend-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('trend-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
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

                  <div id="forecast-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('forecast-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
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

                  <div id="keyword-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('keyword-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
                    <h3 className="text-lg font-bold mb-4">Top Keywords</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topKeywords}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={60} stroke="#ffffff50" />
                        <YAxis stroke="#ffffff50" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Bar dataKey="volume" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div id="intent-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('intent-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
                    <h3 className="text-lg font-bold mb-4">Keyword Intent</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                          {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div id="radar-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('radar-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
                    <h3 className="text-lg font-bold mb-4">Technical Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={scoreBreakdown}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="category" stroke="#ffffff70" />
                        <PolarRadiusAxis stroke="#ffffff20" />
                        <Radar name="Score" dataKey="score" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {marketShare.length > 0 && (
                    <div id="market-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                      <button onClick={() => captureChart('market-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20"><Camera size={16} /></button>
                      <h3 className="text-lg font-bold mb-4">Market Share</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={marketShare} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" label>
                            {marketShare.map((entry: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* SERP Table */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold mb-4">Competitor SERP Landscape</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-sm text-neutral-400">
                          <th className="pb-3">#</th>
                          <th className="pb-3">Title</th>
                          <th className="pb-3">DA</th>
                          <th className="pb-3">Traffic</th>
                          <th className="pb-3">Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serp_landscape?.slice(0, 8).map((s: any, i: number) => (
                          <tr key={i} className="border-t border-white/5 text-sm">
                            <td className="py-3 text-neutral-400">{i+1}</td>
                            <td className="py-3"><a href={s.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">{s.title}</a></td>
                            <td className="py-3">{s.da}</td>
                            <td className="py-3">{s.traffic?.toLocaleString()}</td>
                            <td className="py-3 text-neutral-400">{s.gap}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Same charts but larger */}
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">Email Report</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Recipients</label>
                    <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="client@example.com, ceo@example.com" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Subject</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Body</label>
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Attachments</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={attachments.includes('pdf')} onChange={() => setAttachments(prev => prev.includes('pdf') ? prev.filter(a => a !== 'pdf') : [...prev, 'pdf'])} /> PDF Report</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={attachments.includes('markdown')} onChange={() => setAttachments(prev => prev.includes('markdown') ? prev.filter(a => a !== 'markdown') : [...prev, 'markdown'])} /> Markdown</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={attachments.includes('charts')} onChange={() => setAttachments(prev => prev.includes('charts') ? prev.filter(a => a !== 'charts') : [...prev, 'charts'])} /> Chart Images</label>
                    </div>
                  </div>
                  <button onClick={handleSendEmail} disabled={sending} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2">
                    <Send size={16} /> {sending ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Share Tab */}
            {activeTab === 'share' && (
              <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">Share Report</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Expiry</label>
                    <select value={shareExpiry} onChange={(e) => setShareExpiry(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500">
                      <option value={24}>24 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>7 days</option>
                      <option value={720}>30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Password (optional)</label>
                    <input type="password" value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} placeholder="Optional password" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  {shareLink && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm truncate">{shareLink}</span>
                      <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}
                  <button onClick={handleGenerateShareLink} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2">
                    <Share2 size={16} /> Generate Link
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6">Dashboard Settings</h2>
                <p className="text-neutral-400">Customization options coming soon.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
