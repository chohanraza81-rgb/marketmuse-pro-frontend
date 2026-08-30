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
  Download, Mail, Share2, Printer, Camera, Sparkles, ArrowLeft,
  Copy, Check, Clock, Send, LayoutDashboard, MailOpen,
  Share2 as ShareIcon, TrendingUp, Globe, Zap, X, Package,
  DollarSign, Users, Target, FileText, Gauge, BarChart, Paperclip
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
  const [attachments, setAttachments] = useState<string[]>(['markdown']);
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
        
        const typeLabel = data.type === 'product' ? 'Product Research' : data.data?.subtype === 'technical' ? 'Technical SEO' : 'SEO';
        setEmailSubject(`Your ${typeLabel} Report: ${data.niche}`);
        setEmailBody(`Dear Client,\n\nPlease find your ${typeLabel} Report attached below.\n\nReport: ${data.niche}\nCountry: ${data.country?.toUpperCase()}\n\nBest regards,\nMusePRO Team`);
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
      
      pdf.save(`MusePRO_${report?.niche?.replace(/\s+/g, '_')}_Dashboard.pdf`);
    } catch (err) {
      alert('Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo) return alert('Please enter recipient email');
    setSending(true);
    try {
      const emailAttachments = [];
      
      // Markdown attachment
      if (attachments.includes('markdown') && report?.markdown) {
        emailAttachments.push({
          name: `${report.niche?.replace(/\s+/g, '_')}_report.md`,
          content: Buffer.from(report.markdown).toString('base64'),
          contentType: 'text/markdown',
        });
      }

      // PDF attachment (dashboard snapshot as PNG)
      if (attachments.includes('pdf')) {
        const element = document.getElementById('dashboard-content');
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0A0A0F', useCORS: true });
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

      const res = await fetch(`${API_URL}/reports/${reportId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || errData?.details || 'Failed to send email');
      }
      
      alert('Email sent successfully!');
      setEmailModal(false);
      setEmailTo('');
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to generate link');
      }
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
          <ArrowLeft size={16} /> Back
        </Link>
      </div>
    </main>
  );

  if (!report) return null;

  const { data, markdown, chart_data, keywords, serp_landscape, traffic_estimate } = report;
  const isProduct = report.type === 'product';
  const isTechnical = report.type === 'seo' && data?.subtype === 'technical';

  const overallScore = data?.score || (isProduct ? 75 : 50);

  const trendData = chart_data?.trend_12m?.length > 0 
    ? chart_data.trend_12m 
    : Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: Math.floor(30 + Math.random() * 70) }));

  const forecastData = chart_data?.traffic_forecast_6m?.length > 0 
    ? chart_data.traffic_forecast_6m 
    : Array.from({ length: 6 }, (_, i) => ({ month: `M${i + 1}`, traffic: Math.floor(500 + Math.random() * 1500) }));

  const kpiCards = isProduct ? [
    { label: 'Viability Score', value: `${overallScore}/100`, icon: Target, color: 'text-indigo-400' },
    { label: 'Financial Tiers', value: data?.financial_model?.length || 0, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Personas', value: data?.consumer_persona?.length || 0, icon: Users, color: 'text-purple-400' },
    { label: 'Competitors', value: data?.competition_analysis?.length || 0, icon: TrendingUp, color: 'text-pink-400' },
  ] : [
    { label: 'Overall Score', value: `${overallScore}/100`, icon: TrendingUp, color: 'text-indigo-400' },
    { label: 'Traffic Estimate', value: (traffic_estimate || 0).toLocaleString(), icon: Globe, color: 'text-emerald-400' },
    { label: 'Keywords', value: keywords?.length || 0, icon: Zap, color: 'text-purple-400' },
    { label: 'Competitors', value: serp_landscape?.length || 0, icon: BarChart, color: 'text-pink-400' },
  ];

  const scoreBreakdown = isProduct ? [
    { category: 'Market Demand', score: data?.marketScore || 60 },
    { category: 'Competition', score: data?.competitionScore || 55 },
    { category: 'Profit Margin', score: data?.profitScore || 70 },
    { category: 'Viability', score: data?.viabilityScore || 75 },
  ] : [
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
                      {isProduct ? 'Product Research Report' : isTechnical ? 'Technical SEO Audit' : 'SEO Report'}
                      <span className="mx-2">•</span>
                      {report.country?.toUpperCase()}
                      <span className="mx-2">•</span>
                      {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                  {kpiCards.map((item, i) => (
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

                {/* Product Report Sections */}
                {isProduct && (
                  <>
                    {data?.financial_model?.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <DollarSign size={18} className="text-emerald-400" /> Financial Model
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {data.financial_model.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <p className="font-semibold text-emerald-400">{item.tier_name || item.plan || `Tier ${i + 1}`}</p>
                              <p className="text-2xl font-bold mt-1">{item.price_sar || item.price || 'N/A'}</p>
                              <p className="text-xs text-neutral-400 mt-2">{item.features || item.target_audience || ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data?.consumer_persona?.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Users size={18} className="text-purple-400" /> Consumer Personas
                        </h3>
                        <div className="space-y-4">
                          {data.consumer_persona.slice(0, 3).map((persona: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <p className="font-semibold text-purple-400">Persona #{i + 1}</p>
                              <p className="text-sm mt-1"><span className="text-neutral-400">Demographics:</span> {persona.demographics || 'N/A'}</p>
                              <p className="text-sm mt-1"><span className="text-neutral-400">Pain Points:</span> {persona.pain_points || 'N/A'}</p>
                              <p className="text-sm mt-1"><span className="text-neutral-400">Goals:</span> {persona.goals || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data?.competition_analysis?.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <TrendingUp size={18} className="text-pink-400" /> Competition Analysis
                        </h3>
                        <div className="space-y-2">
                          {data.competition_analysis.slice(0, 5).map((item: any, i: number) => (
                            <p key={i} className="text-sm text-neutral-300 p-3 rounded-lg bg-white/[0.02]">{item}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
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

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
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
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
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

                  {!isProduct && pieData.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
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

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
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
                {!isProduct && serp_landscape?.length > 0 && (
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
                    <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-2">
                      <Paperclip size={14} /> Attachments
                    </label>
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
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
