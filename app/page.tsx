'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, BarChart3, Globe, FileText, DollarSign, Settings, Plus } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter'] relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/20 blur-3xl pointer-events-none" />

      {/* 🌟 UPDATED NAVBAR (Settings/Agency Button Added) */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Muse<span className="text-indigo-400">PRO</span></span>
            <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">● ONLINE</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white px-3 py-2">History</Link>
            <Link href="/compare" className="hidden md:block text-sm text-neutral-400 hover:text-white px-3 py-2">Compare</Link>
            <Link href="/product-research" className="hidden md:block text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Product Research</Link>
            <Link href="/seo-report" className="hidden md:block text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO Report</Link>
            
            {/* ✅ NEW: Agency Settings (White-Label) Button */}
            <Link href="/agency-settings" className="flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              <Settings size={14} /> Agency
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs text-neutral-300">MusePRO — Real-Time Market Research</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent leading-tight">
          Research markets.<br />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Dominate search.</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
          Enterprise-grade product research & SEO intelligence. Live data from Keywords Everywhere, SerpAPI, and GPT-4o — in seconds.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/seo-report" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all flex items-center gap-2">SEO Report <TrendingUp size={18} /></Link>
          <Link href="/product-research" className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-semibold transition-all flex items-center gap-2">Product Research <BarChart3 size={18} /></Link>
          <Link href="/compare" className="px-6 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 font-semibold transition-all flex items-center gap-2">Compare <Plus size={18} /></Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4"><BarChart3 size={20} className="text-indigo-400" /></div>
          <h3 className="text-xl font-bold mb-2">Product Intelligence</h3>
          <p className="text-sm text-neutral-400">Real-time shipping data, competitor deep dives, and profit forecasts.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4"><FileText size={20} className="text-purple-400" /></div>
          <h3 className="text-xl font-bold mb-2">SEO Dominance</h3>
          <p className="text-sm text-neutral-400">50 live keywords, SERP gaps, backlink strategy, and content calendar.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4"><Globe size={20} className="text-emerald-400" /></div>
          <h3 className="text-xl font-bold mb-2">12 Countries</h3>
          <p className="text-sm text-neutral-400">US, UK, Canada, Australia, Germany, Singapore, Saudi, UAE, Pakistan, India, Turkey, Malaysia.</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4"><DollarSign size={20} className="text-blue-400" /></div>
          <h3 className="text-xl font-bold mb-2">Financial Models</h3>
          <p className="text-sm text-neutral-400">Breakevens, profit projections, risk radar included.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 py-8 text-center text-xs text-neutral-600">
        © 2026 MusePRO. All rights reserved.
        <span className="mx-2">•</span> 
        Powered by real-time data & GPT-4o.
      </footer>
    </main>
  );
}
