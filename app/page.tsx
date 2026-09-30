'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, TrendingUp, Package, Gauge, Shield, ArrowRight,
  CheckCircle2, Zap, BarChart3, Globe, Layers, Target, Activity,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import LiveStatus from '@/components/LiveStatus';

// ═══════════════════════════════════════════════════════════════
// REPORT TYPES
// ═══════════════════════════════════════════════════════════════
const REPORT_TYPES = [
  {
    id: 'seo',
    icon: TrendingUp,
    accent: 'var(--accent-indigo)',
    badge: 'indigo' as const,
    label: 'SEO Research',
    description: '50 keywords, SERP analysis, content roadmap, and 12-month trend intelligence.',
    href: '/seo-report',
    features: ['50 keywords', 'SERP gap analysis', '12-week roadmap'],
  },
  {
    id: 'product',
    icon: Package,
    accent: 'var(--accent-emerald)',
    badge: 'emerald' as const,
    label: 'Product Intelligence',
    description: 'Competitor forensics, sourcing strategy, local market heatmap, and 3-year projections.',
    href: '/product-research',
    features: ['Competitor deep-dive', 'Unit economics', 'Market heatmap'],
  },
  {
    id: 'technical',
    icon: Gauge,
    accent: 'var(--accent-purple)',
    badge: 'purple' as const,
    label: 'Technical SEO Audit',
    description: 'Score breakdown, security headers, Core Web Vitals, and priority fix checklist.',
    href: '/technical-seo',
    features: ['Weighted scoring', 'Security audit', 'Priority fixes'],
  },
  {
    id: 'brand',
    icon: Shield,
    accent: 'var(--accent-red)',
    badge: 'critical' as const,
    label: 'Brand Protection',
    description: 'OSINT findings across 15+ platforms, counterfeit mapping, and enforcement evidence.',
    href: '/brand-protection',
    features: ['OSINT scan', 'Threat dashboard', 'Evidence package'],
    isNew: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════════════════ */}
        <section className="relative">
          {/* Top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-[var(--accent-indigo)]/8 via-[var(--accent-purple)]/4 to-transparent" />

          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-32">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3.5 py-1.5 backdrop-blur">
                <Zap size={11} className="text-[var(--accent-emerald)]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Intelligence Platform · v1.0
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-4xl text-center text-[42px] font-normal leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)] md:text-[68px]"
            >
              Research markets.
              <br />
              <span className="bg-gradient-to-r from-[var(--accent-indigo)] via-[var(--accent-purple)] to-[var(--accent-emerald)] bg-clip-text text-transparent">
                Dominate search.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-center text-[16px] leading-relaxed text-[var(--text-secondary)] md:text-[18px]"
            >
              Enterprise-grade market intelligence powered by live data from
              DataForSEO, SerpAPI, and Google Trends. Four report types. Real evidence.
              Delivered in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/dashboard">
                <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/seo-report">
                <Button variant="outline" size="lg">
                  Generate a Report
                </Button>
              </Link>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[12px] text-[var(--text-muted)]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--accent-emerald)]" />
                <span>12 Countries Supported</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--accent-emerald)]" />
                <span>Evidence-Backed Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[var(--accent-emerald)]" />
                <span>White-Label Ready</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            REPORT TYPES GRID
            ═══════════════════════════════════════════════════════ */}
        <section className="relative mx-auto max-w-7xl px-6 pb-24">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--accent-indigo)]">
              Four Intelligence Products
            </p>
            <h2 className="text-[28px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[36px]">
              One platform. Every market question answered.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Whether you're launching a product, ranking a website, auditing technical
              SEO, or protecting a brand — MusePRO delivers the intelligence you need.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {REPORT_TYPES.map((report, i) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <Link href={report.href} className="block h-full">
                    <Card
                      padding="lg"
                      variant="default"
                      className="group relative h-full overflow-hidden transition-all hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-2)]"
                    >
                      {/* Top accent line */}
                      <div
                        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ background: report.accent }}
                      />

                      {/* Icon + Badge */}
                      <div className="mb-5 flex items-start justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[6px] transition-transform group-hover:scale-105"
                          style={{
                            background: `color-mix(in srgb, ${report.accent} 12%, transparent)`,
                          }}
                        >
                          <Icon size={18} style={{ color: report.accent }} />
                        </div>
                        {report.isNew && (
                          <Badge variant="critical" size="sm">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Label */}
                      <h3 className="mb-2 text-[16px] font-medium leading-snug text-[var(--text-primary)]">
                        {report.label}
                      </h3>

                      {/* Description */}
                      <p className="mb-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                        {report.description}
                      </p>

                      {/* Features */}
                      <ul className="mb-5 space-y-1.5">
                        {report.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]"
                          >
                            <CheckCircle2
                              size={11}
                              style={{ color: report.accent }}
                              className="flex-shrink-0"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Arrow CTA */}
                      <div className="mt-auto flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]">
                        Generate Report
                        <ArrowRight
                          size={12}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURES SECTION
            ═══════════════════════════════════════════════════════ */}
        <section className="relative border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/30">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--accent-emerald)]">
                Built for professionals
              </p>
              <h2 className="text-[28px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[36px]">
                Agency-grade infrastructure
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Activity,
                  title: 'Real-Time Data',
                  description: 'Live SERP, keyword, and trend data from 6+ premium APIs.',
                },
                {
                  icon: Globe,
                  title: '12 Countries',
                  description: 'Localized reports for US, UK, CA, AU, DE, SG, SA, AE, PK, IN, TR, MY.',
                },
                {
                  icon: Layers,
                  title: 'White-Label',
                  description: 'Custom branding — your logo, colors, fonts on every report.',
                },
                {
                  icon: Target,
                  title: 'Evidence-Backed',
                  description: 'Every claim cited. Every number sourced. Every recommendation actionable.',
                },
                {
                  icon: BarChart3,
                  title: 'Interactive Charts',
                  description: 'Trend lines, forecasts, heatmaps, and competitor benchmarks.',
                },
                {
                  icon: Sparkles,
                  title: 'Premium Exports',
                  description: 'Branded PDFs, CSV data exports, and shareable links with expiry.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Case Studies',
                  description: 'Real outcomes with metrics — not generic templates.',
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Reports generated in 30-90 seconds. No more waiting for consultants.',
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] bg-[var(--bg-surface-3)] text-[var(--text-secondary)]">
                      <Icon size={14} />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[13px] font-medium text-[var(--text-primary)]">
                        {feature.title}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FINAL CTA
            ═══════════════════════════════════════════════════════ */}
        <section className="relative mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[12px] border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-surface-1)] to-[var(--bg-surface-2)] px-8 py-16 text-center"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[var(--accent-indigo)]/10 to-transparent" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-[28px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[36px]">
                Ready to dominate your market?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Generate your first intelligence report in under 90 seconds.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/seo-report">
                  <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════════════════════ */}
        <footer className="border-t border-[var(--border-subtle)]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-purple)]">
                <Sparkles size={11} className="text-white" />
              </div>
              <span className="text-[13px] font-medium tracking-tight">
                Muse<span className="text-[var(--text-secondary)]">PRO</span>
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              © {new Date().getFullYear()} MusePRO · Premium Market Intelligence · All rights reserved
            </p>
            <div className="flex items-center gap-3">
              <LiveStatus />
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
