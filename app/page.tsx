'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, BarChart3, Globe, FileText, DollarSign, 
  Settings, ArrowRight, Zap, ShieldCheck 
} from 'lucide-react';
import LiveStatus from '@/components/LiveStatus';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white font-['Inter'] relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Deep Premium Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Navbar with Live Status */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/history" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/compare" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Compare</Link>
            <Link href="/product-research" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Product</Link>
            <Link href="/seo-report" className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">SEO</Link>
          </div>

          {/* Right Actions + Live Status */}
          <div className="flex items-center gap-3">
            {/* Live Status Component - Green Dot for Online, Red for Offline */}
            <LiveStatus />
            
            <Link href="/agency-settings" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
              <Settings size={16} /> Agency
            </Link>
            
            <Link href="/seo-report" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <Zap size={14} className="text-emerald-400" />
          <span className="text-xs uppercase tracking-widest text-neutral-300">Real-Time Agency Intelligence</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
          Research markets.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dominate search.</span>
        </h1>

        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Enterprise-grade product research & SEO intelligence. Live data from 
          <span className="text-white font-semibold"> DataForSEO</span>, SerpAPI, and GPT-4o — in seconds.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/seo-report" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
            SEO Report <TrendingUp size={20} />
          </Link>
          <Link href="/product-research" className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md font-bold transition-all flex items-center gap-2">
            Product Research <BarChart3 size={20} />
          </Link>
        </div>
      </section>

      {/* Professional Sequenced Grid (2x2) */}
      <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
              <FileText size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">SEO Dominance</h3>
            <p className="text-neutral-400 leading-relaxed">50 live keywords, SERP gaps, backlink strategy, and a 12-week content calendar built from enterprise-grade data.</p>
          </div>

          {/* Box 2 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <BarChart3 size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Product Intelligence</h3>
            <p className="text-neutral-400 leading-relaxed">Real-time shipping data, competitor deep dives, and profit forecasts.</p>
          </div>

          {/* Box 3 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Globe size={24} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">12 Countries Supported</h3>
            <p className="text-neutral-400 leading-relaxed">US, UK, Canada, Australia, Germany, Singapore, Saudi, UAE, Pakistan, India, Turkey, Malaysia.</p>
          </div>

          {/* Box 4 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.07] hover:border-pink-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
              <DollarSign size={24} className="text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Financial Models & White-Label</h3>
            <p className="text-neutral-400 leading-relaxed">Breakevens, profit projections, risk radar, and 100% client ownership with your branding.</p>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-600">
        © 2026 MusePRO. All rights reserved.
        <span className="mx-2">•</span> 
        Powered by real-time DataForSEO & GPT-4o.
      </footer>
    </main>
  );
}
