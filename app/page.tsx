'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, BarChart3, Globe, FileText, 
  Settings, ArrowRight, Zap, ShieldCheck, Gauge, LayoutDashboard,
  Mail, Wifi, WifiOff, Loader2, History, GitCompare
} from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        setApiStatus(res.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };

    checkAPI();
    const interval = setInterval(checkAPI, 30000);
    
    const handleOnline = () => checkAPI();
    const handleOffline = () => setApiStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight whitespace-nowrap">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-lg hover:bg-white/5 whitespace-nowrap">
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </Link>
            <Link href="/product-research" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-lg hover:bg-white/5 whitespace-nowrap">
              <BarChart3 size={14} />
              <span>Product</span>
            </Link>
            <Link href="/seo-report" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-lg hover:bg-white/5 whitespace-nowrap">
              <TrendingUp size={14} />
              <span>SEO</span>
            </Link>
            <Link href="/technical-seo" className="px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-lg hover:bg-white/5 whitespace-nowrap">
              <Gauge size={14} />
              <span>Tech SEO</span>
            </Link>
          </div>

          {/* Right Side: History, Compare, Status, Agency, Get Started */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/history" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 whitespace-nowrap">
              <History size={14} />
              <span>History</span>
            </Link>

            <Link href="/compare" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 whitespace-nowrap">
              <GitCompare size={14} />
              <span>Compare</span>
            </Link>

            {/* System Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              apiStatus === 'online' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : apiStatus === 'offline'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}>
              {apiStatus === 'checking' && <Loader2 size={12} className="animate-spin flex-shrink-0" />}
              {apiStatus === 'online' && <Wifi size={12} className="flex-shrink-0" />}
              {apiStatus === 'offline' && <WifiOff size={12} className="flex-shrink-0" />}
              <span className="whitespace-nowrap">
                {apiStatus === 'online' ? 'System Online' : apiStatus === 'offline' ? 'System Offline' : 'Checking...'}
              </span>
            </div>

            {/* Agency Link - Re-added and visible */}
            <Link href="/agency-settings" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium whitespace-nowrap">
              <Settings size={14} />
              <span>Agency</span>
            </Link>

            {/* Get Started */}
            <Link href="/seo-report" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-semibold shadow-lg shadow-indigo-500/20 whitespace-nowrap">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Rest of the page remains unchanged */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Zap size={14} className="text-emerald-400" />
          <span className="text-xs uppercase tracking-widest text-neutral-300">Agency Intelligence Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent"
        >
          Research markets.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dominate search.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          Enterprise-grade product research & SEO intelligence. Live data from 
          <span className="text-white font-semibold"> DataForSEO</span>, SerpAPI, and GPT-4o — in seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 whitespace-nowrap">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/seo-report" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2 whitespace-nowrap">
            <TrendingUp size={20} /> SEO Report
          </Link>
          <Link href="/technical-seo" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2 whitespace-nowrap">
            <Gauge size={20} /> Technical SEO
          </Link>
          <Link href="/product-research" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2 whitespace-nowrap">
            <BarChart3 size={20} /> Product Research
          </Link>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: LayoutDashboard,
              color: 'bg-indigo-500/20',
              iconColor: 'text-indigo-400',
              hoverBorder: 'hover:border-indigo-500/30',
              title: 'Premium Dashboard',
              description: 'Visual reports with interactive charts, PDF export, email sharing, and shareable links.',
              delay: 0
            },
            {
              icon: TrendingUp,
              color: 'bg-blue-500/20',
              iconColor: 'text-blue-400',
              hoverBorder: 'hover:border-blue-500/30',
              title: 'SEO Dominance',
              description: '50 live keywords, SERP gaps, backlink strategy, and a 12-week content calendar.',
              delay: 0.1
            },
            {
              icon: Gauge,
              color: 'bg-orange-500/20',
              iconColor: 'text-orange-400',
              hoverBorder: 'hover:border-orange-500/30',
              title: 'Technical SEO Audit',
              description: 'Comprehensive site health checks, Core Web Vitals, and security analysis.',
              delay: 0.2
            },
            {
              icon: BarChart3,
              color: 'bg-purple-500/20',
              iconColor: 'text-purple-400',
              hoverBorder: 'hover:border-purple-500/30',
              title: 'Product Intelligence',
              description: 'Real-time shipping data, competitor deep dives, and profit forecasts.',
              delay: 0.3
            },
            {
              icon: Mail,
              color: 'bg-emerald-500/20',
              iconColor: 'text-emerald-400',
              hoverBorder: 'hover:border-emerald-500/30',
              title: 'Email Reports',
              description: 'Send reports directly to clients via Brevo with multiple attachments and tracking.',
              delay: 0.4
            },
            {
              icon: ShieldCheck,
              color: 'bg-pink-500/20',
              iconColor: 'text-pink-400',
              hoverBorder: 'hover:border-pink-500/30',
              title: 'White-Label Enterprise',
              description: 'Rebrand reports with your agency logo, colors, and fonts for 100% client ownership.',
              delay: 0.5
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.5 }}
              className={`p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] ${item.hoverBorder} transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} className={item.iconColor} />
              </div>
              <h3 className="text-2xl font-bold mb-3 whitespace-nowrap">{item.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to dominate your market?</h2>
          <p className="text-neutral-400 text-lg mb-8">Start generating world-class reports in seconds.</p>
          <Link href="/seo-report" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold transition-all shadow-xl shadow-indigo-500/20 whitespace-nowrap">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-neutral-600">
            © 2026 MusePRO. All rights reserved.
            <span className="mx-2">•</span> 
            Powered by real-time DataForSEO & GPT-4o.
          </p>
        </div>
      </footer>
    </main>
  );
}
