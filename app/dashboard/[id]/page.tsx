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
  DollarSign, Users, Target, BarChart, Gauge, X, Paperclip,
  Upload, FileText, AlertCircle, CheckCircle2
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
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string; contentType: string }[]>([]);
  const [sending, setSending] = useState(false);
  
  // Share states
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState(24);
  const [sharePassword, setSharePassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          content: base64,
          contentType: file.type || 'application/octet-stream',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

      // Add uploaded files
      uploadedFiles.forEach(file => {
        emailAttachments.push(file);
      });

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
      
      const responseData = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(responseData?.error || responseData?.details || 'Failed to send email');
      }
      
      alert('✅ Email sent successfully!');
      setShowEmailModal(false);
      setEmailTo('');
      setUploadedFiles([]);
    } catch (err: any) {
      console.error('Email error:', err);
      alert('❌ ' + (err?.message || 'Failed to send email'));
    } finally {
      setSending(false);
    }
  };

  const handleGenerateShareLink = async () => {
    setGeneratingLink(true);
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
      console.log('Share API response:', responseData);
      
      if (!res.ok) {
        throw new Error(responseData?.error || 'Failed to generate link');
      }
      
      const fullLink = `${window.location.origin}${responseData.link}`;
      setShareLink(fullLink);
    } catch (err: any) {
      console.error('Share error:', err);
      alert('❌ ' + (err?.message || 'Failed to generate link'));
    } finally {
      setGeneratingLink(false);
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
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back
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
    : isProduct 
      ? Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: Math.floor(50 + Math.random() * 40) }))
      : Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, value: Math.floor(30 + Math.random() * 70) }));

  const forecastData = chart_data?.traffic_forecast_6m?.length > 0 
    ? chart_data.traffic_forecast_6m 
    : Array.from({ length: 6 }, (_, i) => ({ month: `M${i + 1}`, traffic: Math.floor(500 + Math.random() * 1500) }));

  // Summary extraction
  const summary = isProduct 
    ? (data?.trend_summary || 'High potential market with growing demand.')
    : (data?.trend_summary || report?.trend_summary || 'Steady market growth observed.');

  const keyInsights = data?.key_insights || [];

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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                {report.niche}
              </h1>
              <p className="mt-2 text-neutral-400 flex items-center gap-2 text-sm">
                {isProduct ? <Package size={14} /> : <TrendingUp size={14} />}
                {isProduct ? 'Product Research' : 'SEO Report'}
                <span>•</span>
                {report.country?.toUpperCase()}
                <span>•</span>
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={generatePDF} disabled={generatingPDF} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap">
                <Download size={16} /> {generatingPDF ? '...' : 'PDF'}
              </button>
              <button onClick={() => setShowEmailModal(true)} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2 text-sm whitespace-nowrap">
                <Mail size={16} /> Email
              </button>
              <button onClick={() => setShowShareModal(true)} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2 text-sm whitespace-nowrap">
                <Share2 size={16} /> Share
              </button>
              <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2 text-sm whitespace-nowrap">
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Executive Summary</h3>
            <p className="text-neutral-300 leading-relaxed">{summary}</p>
            {keyInsights?.length > 0 && (
              <div className="mt-3 space-y-1">
                {keyInsights.slice(0, 3).map((insight: string, i: number) => (
                  <p key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {insight}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-neutral-400">Overall Score</p>
              <p className="text-2xl font-black mt-1 text-indigo-400">{overallScore}/100</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-neutral-400">{isProduct ? 'Financial Tiers' : 'Traffic'}</p>
              <p className="text-2xl font-black mt-1 text-emerald-400">
                {isProduct ? (data?.financial_model?.length || 0) : (traffic_estimate || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-neutral-400">Keywords</p>
              <p className="text-2xl font-black mt-1 text-purple-400">{keywords?.length || 0}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-neutral-400">Competitors</p>
              <p className="text-2xl font-black mt-1 text-pink-400">{serp_landscape?.length || data?.competition_analysis?.length || 0}</p>
            </div>
          </div>

          {/* Product Report Data */}
          {isProduct && data?.financial_model?.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" /> Financial Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.financial_model.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-emerald-400 text-sm">{item.tier_name || `Tier ${i + 1}`}</p>
                    <p className="text-xl font-bold mt-1">{item.price_sar || item.price || 'N/A'}</p>
                    <p className="text-xs text-neutral-400 mt-1">{item.target_audience || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Personas */}
          {isProduct && data?.consumer_persona?.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Consumer Personas
              </h3>
              <div className="space-y-2">
                {data.consumer_persona.slice(0, 3).map((persona: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-purple-400 text-sm">Persona #{i + 1}</p>
                    <p className="text-xs mt-1"><span className="text-neutral-500">Demographics:</span> {persona.demographics || 'N/A'}</p>
                    <p className="text-xs mt-0.5"><span className="text-neutral-500">Pain Points:</span> {persona.pain_points || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold mb-3">12-Month Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#ffffff50" fontSize={11} />
                  <YAxis stroke="#ffffff50" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold mb-3">Traffic Forecast</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="month" stroke="#ffffff50" fontSize={11} />
                  <YAxis stroke="#ffffff50" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {!isProduct && keywords?.length > 0 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="text-base font-bold mb-3">Top Keywords</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsBarChart data={keywords.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={60} stroke="#ffffff50" fontSize={10} />
                    <YAxis stroke="#ffffff50" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="volume" fill="#8b5cf6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* SERP Table */}
          {!isProduct && serp_landscape?.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mt-4">
              <h3 className="text-base font-bold mb-3">Competitor SERP Landscape</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-400 text-xs">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Traffic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serp_landscape.slice(0, 5).map((s: any, i: number) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-2 text-neutral-400">{i+1}</td>
                        <td className="py-2"><a href={s.link} target="_blank" className="text-indigo-400 hover:text-indigo-300">{s.title}</a></td>
                        <td className="py-2">{(s.traffic || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
      {showEmailModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-3xl bg-[#0F0F14] border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Mail size={18} className="text-indigo-400" /> Email Report</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Recipient Email *</label>
                <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="client@example.com" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Subject</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Body</label>
                <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-2 flex items-center gap-1"><Paperclip size={12} /> Attachments</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={sendMarkdown} onChange={() => setSendMarkdown(!sendMarkdown)} className="accent-indigo-500" />
                    <span>Markdown Report (.md)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={sendSnapshot} onChange={() => setSendSnapshot(!sendSnapshot)} className="accent-indigo-500" />
                    <span>Dashboard Snapshot (.png)</span>
                  </label>
                </div>
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Upload Additional Files</label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 cursor-pointer transition-all text-sm text-neutral-400 hover:text-white">
                  <Upload size={16} />
                  <span>Click to upload files</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 text-xs">
                        <span className="truncate">{file.name}</span>
                        <button onClick={() => removeUploadedFile(i)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSendEmail} disabled={sending} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                <Send size={14} /> {sending ? 'Sending...' : 'Send Email'}
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
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Share2 size={18} className="text-indigo-400" /> Share Report</h2>
              <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 flex items-center gap-1"><Clock size={12} /> Expiry Time</label>
                <select value={shareExpiry} onChange={(e) => setShareExpiry(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm">
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                  <option value={720}>30 days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Password (optional)</label>
                <input type="password" value={sharePassword} onChange={(e) => setSharePassword(e.target.value)} placeholder="Optional password" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-sm" />
              </div>
              {shareLink ? (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-2">
                  <span className="text-xs truncate">{shareLink}</span>
                  <button onClick={() => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 flex-shrink-0">
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              ) : (
                <button onClick={handleGenerateShareLink} disabled={generatingLink} className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  <Share2 size={14} /> {generatingLink ? 'Generating...' : 'Generate Link'}
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
