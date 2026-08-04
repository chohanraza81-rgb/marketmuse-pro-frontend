'use client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Search, Globe, ArrowRight, Zap, Shield, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import LiveStatus from '@/components/LiveStatus';

const features = [
  { icon: TrendingUp, title: 'Product Intelligence', desc: 'Real shopping data, competitor deep dives, profit forecasts.' },
  { icon: Search, title: 'SEO Dominance', desc: '50 keywords, SERP gaps, backlink strategy, content calendar.' },
  { icon: Globe, title: '12 Countries', desc: 'US, UK, Canada, Australia, Germany, Singapore, Saudi, UAE, Pakistan, India, Turkey, Malaysia.' },
  { icon: Zap, title: 'Live Data', desc: 'Keywords Everywhere + SerpAPI – real volumes, trends, CPC.' },
  { icon: Shield, title: 'Enterprise Grade', desc: 'GPT‑4o powered, 99.9% uptime, production‑ready.' },
  { icon: BarChart3, title: 'Financial Models', desc: 'Breakeven, profit projections, risk radar included.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">MarketMuse<span className="text-indigo-400"> PRO</span></span>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white transition-colors">History</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors">Product Research</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">SEO Report</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-300 font-medium">Real‑Time Market Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Research markets,<br />
              <span className="text-gradient">dominate search.</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-10">
              Enterprise‑grade product research & SEO intelligence with live data from Keywords Everywhere, SerpAPI, and GPT‑4o.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/seo-report" className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all">
                SEO Report
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/product-research" className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-all border border-neutral-700">
                Product Research
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass rounded-2xl p-6 glass-hover glow-hover group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <f.icon size={20} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-neutral-600">
          <span>© 2026 MarketMuse PRO. All rights reserved.</span>
          <span>Powered by real‑time data & GPT‑4o.</span>
        </div>
      </footer>
    </main>
  );
}
