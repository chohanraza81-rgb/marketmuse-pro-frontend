'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Gauge,
  Shield,
  History,
  GitCompare,
  Settings,
  ArrowRight,
} from 'lucide-react';
import LiveStatus from '@/components/LiveStatus';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seo-report', label: 'SEO', icon: TrendingUp },
  { href: '/product-research', label: 'Product', icon: BarChart3 },
  { href: '/technical-seo', label: 'Tech SEO', icon: Gauge },
  { href: '/brand-protection', label: 'Brand Protection', icon: Shield, isNew: true },
];

const SECONDARY_ITEMS = [
  { href: '/history', label: 'History', icon: History },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/agency-settings', label: 'Agency', icon: Settings },
];

interface NavbarProps {
  variant?: 'full' | 'minimal';
}

export default function Navbar({ variant = 'full' }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-6">
        {/* ── Logo ── */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-gradient-to-br from-[var(--accent-indigo)] to-[var(--accent-purple)]">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-medium tracking-tight">
            Muse<span className="text-[var(--text-secondary)]">PRO</span>
          </span>
        </Link>

        {/* ── Center Nav (only in full variant) ── */}
        {variant === 'full' && (
          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-[13px] transition-colors ${
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon size={13} />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="ml-1 rounded-[3px] bg-[var(--accent-red)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-red)]">
                      New
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-[13px] h-px bg-[var(--text-primary)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2">
          {variant === 'full' && (
            <>
              {SECONDARY_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`hidden items-center justify-center rounded-[4px] p-2 transition-colors md:flex ${
                      isActive
                        ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-1)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <item.icon size={14} />
                  </Link>
                );
              })}
              <div className="mx-1 hidden h-4 w-px bg-[var(--border-subtle)] md:block" />
            </>
          )}

          {/* LiveStatus — FIXED on every page */}
          <LiveStatus />

          {/* CTA */}
          {variant === 'full' && (
            <Link
              href="/seo-report"
              className="flex items-center gap-1.5 rounded-[4px] bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-base)] transition-opacity hover:opacity-90"
            >
              New Report
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
