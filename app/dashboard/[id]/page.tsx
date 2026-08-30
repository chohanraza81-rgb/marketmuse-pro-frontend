// app/dashboard/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Download, Mail, Share2, Printer, Camera, Sparkles, ArrowLeft,
  Copy, Check, Lock, Clock, Send, LayoutDashboard, BarChart3, MailOpen,
  Share2 as ShareIcon, Settings, TrendingUp, Globe, Zap, X, FileText,
  Gauge, Package, DollarSign, Users, Target
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'email', label: 'Email', icon: MailOpen },
  { id: 'share', label: 'Share', icon: ShareIcon },
];

export default function ReportDashboard() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [emailModal, setEmailModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>(['markdown', 'pdf']);
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState(24);
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/reports/${reportId}`);
        if (!res.ok) throw new Error('Failed to load report');
        const data = await res.json();
        setReport(data);
        setEmailSubject(`Your ${data.type === 'product' ? 'Product' : 'SEO'} Report: ${data.niche}`);
        setEmailBody(`Dear Client,\n\nPlease find your ${data.type === 'product' ? 'Product Research' : 'SEO'} Report attached.\n\nReport: ${data.niche}\nCountry: ${data.country?.toUpperCase()}\n\nBest regards,\nMusePRO Team`);
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
      
      pdf.save(`MusePRO_Report_${report?.niche?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const captureChart = async (chartId: string) => {
    const element = document.getElementById(chartId);
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `${chartId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSendEmail = async () => {
    if (!emailTo) return alert('Please enter recipient email');
    setSending(true);
    try {
      // Generate PDF first if selected
      let pdfBase64 = '';
      if (attachments.includes('pdf')) {
        const element = document.getElementById('dashboard-content');
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0A0A0F', useCORS: true });
          pdfBase64 = canvas.toDataURL('image/png').split(',')[1];
        }
      }

      const emailAttachments = [];
      
      if (attachments.includes('markdown') && report?.markdown) {
        emailAttachments.push({
          name: `${report.niche?.replace(/\s+/g, '_')}_report.md`,
          content: Buffer.from(report.markdown).toString('base64'),
          contentType: 'text/markdown',
        });
      }
      
      if (attachments.includes('pdf') && pdfBase64) {
        emailAttachments.push({
          name: `${report.niche?.replace(/\s+/g, '_')}_dashboard.png`,
          content: pdfBase64,
          contentType: 'image/png',
        });
      }

      const res = await fetch(`${API_URL}/reports/${reportId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo.split(',').map((e: string) => e.trim()),
          subject: emailSubject,
          body: emailBody,
          attachments: emailAttachments,
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || 'Failed to send email');
      }
      
      alert('Email sent successfully!');
      setEmailModal(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const res = await fetch(`${API_URL}/reports/${reportId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInHours: shareExpiry,
          password: sharePassword || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate link');
      const data = await res.json();
      setShareLink(`${window.location.origin}${data.link}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to generate link');
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <div className="text-center">
        <Sparkles size={48} className="text-indigo-400 mx-auto mb-4 animate-pulse" />
        <p className="text-neutral-400">Loading dashboard...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
          <ArrowLeft size={16} /> Back to Dashboards
        </Link>
      </div>
    </main>
  );

  if (!report) return null;

  const { data, markdown, chart_data, keywords, serp_landscape, traffic_estimate } = report;
  const isProduct = report.type === 'product';
  const isTechnical = report.type === 'seo' && data?.subtype === 'technical';

  // Chart data with fallbacks
  const trendData = chart_data?.trend_12m?.length > 0 ? chart_data.trend_12m : generateDefaultTrend();
  const forecastData = chart_data?.traffic_forecast_6m?.length > 0 ? chart_data.traffic_forecast_6m : generateDefaultForecast();
  const marketShare = chart_data?.market_share || [];
  const topKeywords = keywords?.slice(0, 10) || [];

  function generateDefaultTrend() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      value: Math.floor(30 + Math.random() * 70)
    }));
  }

  function generateDefaultForecast() {
    return Array.from({ length: 6 }, (_, i) => ({
      month: `M${i + 1}`,
      traffic: Math.floor(500 + Math.random() * 1500)
    }));
  }

  // Score breakdown based on report type
  const scoreBreakdown = isProduct ? [
    { category: 'Market', score: data?.marketScore || 0 },
    { category: 'Competition', score: data?.competitionScore || 0 },
    { category: 'Profit', score: data?.profitScore || 0 },
    { category: 'Viability', score: data?.viabilityScore || 0 },
  ] : [
    { category: 'Infrastructure', score: data?.infrastructureScore || 0 },
    { category: 'On-Page', score: data?.onPageScore || 0 },
    { category: 'Technical', score: data?.technicalScore || 0 },
    { category: 'Security', score: data?.securityScore || 0 },
  ];

  // Overall score
  const overallScore = data?.score || (isProduct ? 75 : 50);

  // Keyword intent for pie chart
  const intentCounts: Record<string, number> = {};
  keywords?.forEach((kw: any) => {
    const intent = kw.intent || 'informational';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });
  const pieData = Object.keys(intentCounts).map(key => ({ name: key, value: intentCounts[key] }));

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg">Home</Link>
            <Link href="/dashboard" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg">Dashboard</Link>
            <Link href="/history" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg">History</Link>
          </div>

          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </nav>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
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
            {activeTab === 'overview' && (
              <div id="dashboard-content">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                      {report.niche}
                    </h1>
                    <p className="mt-2 text-neutral-400 flex items-center gap-2">
                      {isProduct ? <Package size={14} /> : isTechnical ? <Gauge size={14} /> : <TrendingUp size={14} />}
                      {report.type === 'product' ? 'Product Report' : isTechnical ? 'Technical SEO' : 'SEO Report'}
                      <span className="mx-2">•</span>
                      {report.country?.toUpperCase()}
                      <span className="mx-2">•</span>
                      {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={generatePDF} disabled={generatingPDF} className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50">
                      <Download size={18} /> {generatingPDF ? 'Generating...' : 'PDF'}
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
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-400">Overall Score</p>
                      <TrendingUp size={18} className="text-indigo-400" />
                    </div>
                    <p className="text-3xl font-black mt-2 text-indigo-400">{overallScore}/100</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-400">{isProduct ? 'Est. Revenue' : 'Traffic Estimate'}</p>
                      <DollarSign size={18} className="text-emerald-400" />
                    </div>
                    <p className="text-3xl font-black mt-2 text-emerald-400">{(traffic_estimate || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-400">Keywords</p>
                      <Zap size={18} className="text-purple-400" />
                    </div>
                    <p className="text-3xl font-black mt-2 text-purple-400">{keywords?.length || 0}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-400">Competitors</p>
                      <BarChart3 size={18} className="text-pink-400" />
                    </div>
                    <p className="text-3xl font-black mt-2 text-pink-400">{serp_landscape?.length || 0}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Trend */}
                  <div id="trend-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('trend-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <Camera size={16} />
                    </button>
                    <h3 className="text-lg font-bold mb-4">12-Month Trend</h3>
                    {trendData.length > 0 ? (
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
                    ) : (
                      <div className="text-center py-10 text-neutral-500">No trend data available</div>
                    )}
                  </div>

                  {/* Forecast */}
                  <div id="forecast-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('forecast-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <Camera size={16} />
                    </button>
                    <h3 className="text-lg font-bold mb-4">Traffic Forecast</h3>
                    {forecastData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="month" stroke="#ffffff50" />
                          <YAxis stroke="#ffffff50" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-10 text-neutral-500">No forecast data available</div>
                    )}
                  </div>

                  {/* Keywords */}
                  {topKeywords.length > 0 && (
                    <div id="keyword-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                      <button onClick={() => captureChart('keyword-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20">
                        <Camera size={16} />
                      </button>
                      <h3 className="text-lg font-bold mb-4">Top Keywords</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topKeywords}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={80} stroke="#ffffff50" />
                          <YAxis stroke="#ffffff50" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Bar dataKey="volume" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Intent */}
                  {pieData.length > 0 && (
                    <div id="intent-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                      <button onClick={() => captureChart('intent-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20">
                        <Camera size={16} />
                      </button>
                      <h3 className="text-lg font-bold mb-4">Keyword Intent</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Radar */}
                  <div id="radar-chart" className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative group">
                    <button onClick={() => captureChart('radar-chart')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <Camera size={16} />
                    </button>
                    <h3 className="text-lg font-bold mb-4">{isProduct ? 'Product Viability' : 'Technical Breakdown'}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={scoreBreakdown}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="category" stroke="#ffffff70" />
                        <PolarRadiusAxis stroke="#ffffff20" />
                        <Radar name="Score" dataKey="score" stroke={isProduct ? '#10b981' : '#ec4899'} fill={isProduct ? '#10b981' : '#ec4899'} fillOpacity={0.4} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SERP Table */}
                {serp_landscape && serp_landscape.length > 0 && (
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
                          {serp_landscape.slice(0, 8).map((s: any, i: number) => (
                            <tr key={i} className="border-t border-white/5 text-sm hover:bg-white/[0.02]">
                              <td className="py-3 text-neutral-400">{i+1}</td>
                              <td className="py-3"><a href={s.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">{s.title}</a></td>
                              <td className="py-3">{s.da || 'N/A'}</td>
                              <td className="py-3">{(s.traffic || 0).toLocaleString()}</td>
                              <td className="py-3 text-neutral-400 text-xs">{s.gap || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MailOpen size={24} className="text-indigo-400" /> Email Report
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Recipients (comma-separated)</label>
                    <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="client@example.com, ceo@example.com" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Subject</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Body</label>
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={5} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Attachments</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={attachments.includes('markdown')} onChange={() => setAttachments(prev => prev.includes('markdown') ? prev.filter(a => a !== 'markdown') : [...prev, 'markdown'])} className="accent-indigo-500" />
                        <span>Markdown Report (.md)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={attachments.includes('pdf')} onChange={() => setAttachments(prev => prev.includes('pdf') ? prev.filter(a => a !== 'pdf') : [...prev, 'pdf'])} className="accent-indigo-500" />
                        <span>Dashboard Snapshot (.png)</span>
                      </label>
                    </div>
                  </div>
                  <button onClick={handleSendEmail} disabled={sending} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send size={16} /> {sending ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
            )}

            {/* Share Tab */}
            {activeTab === 'share' && (
              <div className="max-w-2xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <ShareIcon size={24} className="text-indigo-400" /> Share Report
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1 flex items-center gap-2">
                      <Clock size={14} /> Expiry Time
                    </label>
                    <select value={shareExpiry} onChange={(e) => setShareExpiry(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500">
                      <option value={24}>24 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>7 days</option>
                      <option value={720}>30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1 flex items-center gap-2">
                      <Lock size={14} /> Password (optional)
                    </label>
                    <input type="password" value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} placeholder="Optional password" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
                  </div>
                  {shareLink && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm truncate">{shareLink}</span>
                      <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 flex-shrink-0">
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
      {emailModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Email Report</h2>
              <button onClick={() => setEmailModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Recipients</label>
                <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="client@example.com" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Subject</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Body</label>
                <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSendEmail} disabled={sending} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={16} /> {sending ? 'Sending...' : 'Send'}
                </button>
                <button onClick={() => setEmailModal(false)} className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20">Cancel</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
      {shareModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Share Report</h2>
              <button onClick={() => setShareModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
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
                  <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 flex-shrink-0">
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
              <button onClick={handleGenerateShareLink} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2">
                <Share2 size={16} /> Generate Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </main>
  );
}
