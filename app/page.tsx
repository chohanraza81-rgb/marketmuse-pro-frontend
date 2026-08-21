'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, BarChart3, Globe, FileText, DollarSign, 
  Settings, Plus, ShieldCheck, Zap, ArrowRight, CheckCircle2 
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-['Inter'] relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* 🌌 Premium Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* 🧊 Floating Glassy Navbar */}
      <nav className="sticky top-4 z-50 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/history" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/compare" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Compare</Link>
            <Link href="/product-research" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Product Research</Link>
            <Link href="/seo-report" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">SEO Report</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/agency-settings" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
              <Settings size={16} /> Agency
            </Link>
            <Link href="/seo-report" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/30">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-32 pb-20 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Zap size={14} className="text-emerald-400" />
          <span className="text-xs uppercase tracking-widest text-neutral-300">Agency-Grade Real-Time Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent"
        >
          Research markets.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dominate search.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
        >
          Enterprise-grade product research & SEO intelligence. Live data from
          <span className="text-white font-semibold"> DataForSEO</span>, SerpAPI, and GPT-4o — in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link href="/seo-report" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2">
            SEO Report <TrendingUp size={20} />
          </Link>
          <Link href="/product-research" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2">
            Product Research <BarChart3 size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Bento Grid Features - Premium Agency Level */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Card - SEO Dominance */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center"><FileText size={24} className="text-indigo-400" /></div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Core Feature</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">SEO Dominance</h3>
            <p className="text-neutral-400 leading-relaxed">50 live keywords, SERP gaps, backlink strategy, and a 12-week content calendar built from enterprise-grade data.</p>
            <div className="mt-6 flex gap-2">
              <span className="text-xs px-2 py-1 bg-black/40 rounded-md border border-white/5">DataForSEO</span>
              <span className="text-xs px-2 py-1 bg-black/40 rounded-md border border-white/5">SerpAPI</span>
              <span className="text-xs px-2 py-1 bg-black/40 rounded-md border border-white/5">GPT-4o</span>
            </div>
          </motion.div>

          {/* Small Card - Financial Models */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6"><DollarSign size={24} className="text-purple-400" /></div>
            <h3 className="text-xl font-bold mb-3">Financial Models</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Breakevens, profit projections, and risk radar included.</p>
          </motion.div>

          {/* Small Card - Product Intelligence */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6"><BarChart3 size={24} className="text-emerald-400" /></div>
            <h3 className="text-xl font-bold mb-3">Product Intelligence</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Real-time shipping data, competitor deep dives, and profit forecasts.</p>
          </motion.div>

          {/* Large Card - Global Reach */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6"><Globe size={24} className="text-blue-400" /></div>
            <h3 className="text-2xl font-bold mb-3">12 Countries Supported</h3>
            <p className="text-neutral-400 leading-relaxed">US, UK, Canada, Australia, Germany, Singapore, Saudi, UAE, Pakistan, India, Turkey, Malaysia.</p>
          </motion.div>

          {/* Small Card - White-Label Ready */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6"><ShieldCheck size={24} className="text-pink-400" /></div>
            <h3 className="text-xl font-bold mb-3">White-Label Enterprise</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Rebrand reports with your agency logo, colors, and fonts for 100% client ownership.</p>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>99.9% Uptime Reliability</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>12 Countries Covered</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Agency-Grade Outputs</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-600">
        © 2026 MusePRO. All rights reserved.
        <span className="mx-2">•</span> 
        Powered by real-time data & GPT-4o.
      </footer>
    </main>
  );
}
