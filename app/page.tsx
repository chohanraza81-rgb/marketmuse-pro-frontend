'use client';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Search,
  Globe,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import LiveStatus from '@/components/LiveStatus';

const features = [
  {
    icon: TrendingUp,
    title: 'Product Intelligence',
    desc: 'Real‑time shopping data, competitor deep dives, and profit forecasts.',
  },
  {
    icon: Search,
    title: 'SEO Dominance',
    desc: '50 live keywords, SERP gaps, backlink strategy, and content calendar.',
  },
  {
    icon: Globe,
    title: '12 Countries',
    desc: 'US, UK, Canada, Australia, Germany, Singapore, Saudi, UAE, Pakistan, India, Turkey, Malaysia.',
  },
  {
    icon: Zap,
    title: 'Live Data',
    desc: 'Keywords Everywhere + SerpAPI – real volumes, trends, and CPC.',
  },
  {
    icon: Shield,
    title: 'Enterprise Grade',
    desc: 'GPT‑4o powered, 99.9% uptime, production‑ready.',
  },
  {
    icon: BarChart3,
    title: 'Financial Models',
    desc: 'Breakeven, profit projections, risk radar included.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white overflow-hidden font-['Inter']">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090B]/80 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Muse<span className="text-indigo-400">PRO</span>
              </span>
            </Link>
            <LiveStatus />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              History
            </Link>
            <Link
              href="/compare"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/product-research"
              className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10"
            >
              Product Research
            </Link>
            <Link
              href="/seo-report"
              className="text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-600/20"
            >
              SEO Report
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-10">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-sm text-indigo-300 font-semibold tracking-wide">
                MusePRO — Real‑Time Market Research
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Research markets.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Dominate search.
              </span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-12 leading-relaxed">
              Enterprise‑grade product research & SEO intelligence. Live data from Keywords Everywhere,
              SerpAPI, and GPT‑4o – in seconds.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/seo-report"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                SEO Report
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/product-research"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/15 backdrop-blur-sm"
              >
                Product Research
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/compare"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/15 backdrop-blur-sm"
              >
                Compare Reports
                <BarChart3 size={18} className="group-hover:translate-x-0.5 transition-transform" />
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
              className="group relative p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800/60 hover:border-neutral-700/80 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <f.icon size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
              <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-600">
          <span>© 2026 MusePRO. All rights reserved.</span>
          <span>Powered by real‑time data & GPT‑4o.</span>
        </div>
      </footer>
    </main>
  );
}
