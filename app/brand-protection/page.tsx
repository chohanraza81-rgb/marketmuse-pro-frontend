'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

const categories = [
  { value: 'Sneakers', label: 'Sneakers' },
  { value: 'Luxury Bags', label: 'Luxury Bags' },
  { value: 'Luxury Watches', label: 'Luxury Watches' },
  { value: 'Streetwear', label: 'Streetwear' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Cosmetics', label: 'Cosmetics' },
];

const countries = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
];

const progressMessages = [
  'Initiating OSINT scan',
  'Scanning 15+ platforms',
  'Analyzing counterfeit patterns',
  'Mapping distribution channels',
  'Building evidence package',
  'Generating threat assessment',
];

const features = [
  { icon: CheckCircle2, text: 'Threat dashboard with risk score (0-100)' },
  { icon: CheckCircle2, text: 'OSINT findings from Instagram, DHgate, Telegram' },
  { icon: CheckCircle2, text: 'Counterfeiter network mapping & profiles' },
  { icon: CheckCircle2, text: 'Evidence package with timestamped URLs' },
];

export default function BrandProtectionPage() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Sneakers');
  const [country, setCountry] = useState('us');
  const [revenue, setRevenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < progressMessages.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!brand.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setProgressStep(0);

    try {
      const res = await fetch(`${API_URL}/brand-protection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          category,
          country,
          annualRevenue: revenue ? Number(revenue) : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate report');
      }

      const data = await res.json();
      const reportId = data.id || data._id;
      if (!reportId) throw new Error('Invalid report response');

      toast.success('Threat intelligence ready');
      setTimeout(() => {
        router.push(`/dashboard/${reportId}`);
      }, 600);
    } catch (err: any) {
      toast.error('Generation failed', {
        description: err.message || 'Something went wrong. Please try again.',
      });
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-[var(--accent-red)]/5 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            ← Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3 py-1.5">
              <Shield size={12} className="text-[var(--accent-red)]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Counterfeit Intelligence
              </span>
              <span className="rounded-[3px] bg-[var(--accent-red)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-red)]">
                New
              </span>
            </div>
            <h1 className="text-[32px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[40px]">
              Detect counterfeit threats
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Enter your brand to scan 15+ platforms for counterfeit activity. Get evidence-ready intelligence for enforcement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card padding="lg" variant="default">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                      Brand Name <span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      />
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., Nike, Louis Vuitton, Rolex"
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] py-3 pl-10 pr-4 text-[14px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-red)]"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                        Product Category <span className="text-[var(--accent-red)]">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-3 text-[14px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-red)]"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                        Annual Revenue (Optional)
                      </label>
                      <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        placeholder="e.g., 50000000"
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-3 text-[14px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-red)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                      Target Market <span className="text-[var(--accent-red)]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCountry(c.code)}
                          className={`flex items-center gap-2 rounded-[4px] border px-3 py-2.5 text-[13px] transition-all ${
                            country === c.code
                              ? 'border-[var(--accent-red)] bg-[var(--accent-red)]/10 text-[var(--text-primary)]'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="text-[15px]">{c.flag}</span>
                          <span className="truncate font-medium">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    icon={<ArrowRight size={16} />}
                    className="w-full"
                  >
                    {loading ? 'Scanning platforms...' : 'Generate Threat Report'}
                  </Button>
                  <p className="text-center text-[12px] text-[var(--text-muted)]">
                    Scans 15+ platforms • 60–120 seconds
                  </p>
                </form>
              </Card>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  What's included
                </h3>
                <ul className="space-y-2.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <f.icon size={14} className="mt-0.5 flex-shrink-0 text-[var(--accent-red)]" />
                      <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Platforms scanned
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)]">Social</span>
                    <span className="font-mono text-[var(--text-muted)]">IG, TikTok, TG</span>
                  </p>
                  <p className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)]">Marketplaces</span>
                    <span className="font-mono text-[var(--text-muted)]">DHgate, Ali</span>
                  </p>
                  <p className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)]">Forums</span>
                    <span className="font-mono text-[var(--text-muted)]">Reddit, Discord</span>
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <LoadingOverlay
        loading={loading}
        title="Scanning for Counterfeits"
        message={progressMessages[progressStep]}
        accentColor="var(--accent-red)"
      />

      <Toaster richColors position="top-right" />
    </>
  );
}
