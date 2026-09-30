'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft, Save, Palette, Building2, Globe, AtSign,
  Type, FileText, Eye, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://marketmuse-pro-backend-production-fd01.up.railway.app/api';

interface Settings {
  agencyName: string;
  logoUrl: string;
  tagline: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  pdfTheme: 'dark' | 'light';
  footerText: string;
  supportEmail: string;
}

const DEFAULT_SETTINGS: Settings = {
  agencyName: '',
  logoUrl: '',
  tagline: '',
  website: '',
  primaryColor: '#533AFD',
  secondaryColor: '#10B981',
  fontFamily: 'Inter',
  pdfTheme: 'dark',
  footerText: '',
  supportEmail: '',
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AgencySettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch Settings ──
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/agency-settings`);
        const data = await res.json();
        if (data) {
          setSettings({
            agencyName: data.agencyName || '',
            logoUrl: data.logoUrl || '',
            tagline: data.tagline || '',
            website: data.website || '',
            primaryColor: data.primaryColor || '#533AFD',
            secondaryColor: data.secondaryColor || '#10B981',
            fontFamily: data.fontFamily || 'Inter',
            pdfTheme: data.pdfTheme || 'dark',
            footerText: data.footerText || '',
            supportEmail: data.supportEmail || '',
          });
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Save Handler ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/agency-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('White-label settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Update Field ──
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-[var(--bg-base)]">
          <Loader2 size={24} className="animate-spin text-[var(--accent-indigo)]" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[var(--accent-indigo)]/5 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-10">
          {/* ── Exit Nav ── */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={13} />
            Back to Home
          </Link>

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] px-3 py-1.5">
                <Building2 size={12} className="text-[var(--accent-indigo)]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  White-Label Studio
                </span>
              </div>
              <h1 className="text-[32px] font-normal leading-tight tracking-[-0.02em] text-[var(--text-primary)] md:text-[40px]">
                Agency Settings
              </h1>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Customize reports with your agency branding. Applied automatically to all future PDF exports.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={saving}
              icon={!saving ? <Save size={14} /> : undefined}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </motion.div>

          {/* ── Two-Column Layout ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* ── LEFT: Settings Form ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Agency Details */}
              <Card padding="lg">
                <div className="mb-5 flex items-center gap-2">
                  <Building2 size={14} className="text-[var(--accent-indigo)]" />
                  <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
                    Agency Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={settings.agencyName}
                      onChange={(e) => update('agencyName', e.target.value)}
                      placeholder="Your Agency Name"
                      className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => update('tagline', e.target.value)}
                      placeholder="Premium Market Intelligence"
                      className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => update('logoUrl', e.target.value)}
                      placeholder="https://youragency.com/logo.png"
                      className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        <Globe size={10} className="mr-1 inline" /> Website
                      </label>
                      <input
                        type="url"
                        value={settings.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://youragency.com"
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        <AtSign size={10} className="mr-1 inline" /> Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => update('supportEmail', e.target.value)}
                        placeholder="hello@youragency.com"
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Branding */}
              <Card padding="lg">
                <div className="mb-5 flex items-center gap-2">
                  <Palette size={14} className="text-[var(--accent-emerald)]" />
                  <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
                    Branding & Theme
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => update('primaryColor', e.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)]"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) => update('primaryColor', e.target.value)}
                          className="flex-1 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 font-mono text-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => update('secondaryColor', e.target.value)}
                          className="h-10 w-12 cursor-pointer rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)]"
                        />
                        <input
                          type="text"
                          value={settings.secondaryColor}
                          onChange={(e) => update('secondaryColor', e.target.value)}
                          className="flex-1 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 font-mono text-[12px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        <Type size={10} className="mr-1 inline" /> Font Style
                      </label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => update('fontFamily', e.target.value)}
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Times New Roman">Serif (Classic)</option>
                        <option value="Courier New">Monospace (Tech)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        PDF Theme
                      </label>
                      <select
                        value={settings.pdfTheme}
                        onChange={(e) => update('pdfTheme', e.target.value as 'dark' | 'light')}
                        className="w-full rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-indigo)]"
                      >
                        <option value="dark">Dark (Premium)</option>
                        <option value="light">Light (Corporate)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      <FileText size={10} className="mr-1 inline" /> Footer Text
                    </label>
                    <textarea
                      value={settings.footerText}
                      onChange={(e) => update('footerText', e.target.value)}
                      rows={2}
                      placeholder="Confidential — Prepared by Your Agency"
                      className="w-full resize-none rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ── RIGHT: Live Preview ── */}
            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:sticky lg:top-20 lg:self-start"
            >
              <div className="mb-3 flex items-center gap-2">
                <Eye size={12} className="text-[var(--text-muted)]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Live Preview
                </span>
              </div>

              <div
                className="rounded-[6px] border border-[var(--border-default)] p-6"
                style={{
                  background: settings.pdfTheme === 'dark' ? '#0F0F14' : '#FFFFFF',
                  fontFamily: settings.fontFamily,
                }}
              >
                {/* Logo + Agency Name */}
                <div className="mb-5 flex items-center gap-3">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="h-10 w-10 rounded-[4px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[4px] text-[14px] font-medium"
                      style={{
                        background: settings.primaryColor,
                        color: '#fff',
                      }}
                    >
                      {(settings.agencyName || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3
                      className="text-[14px] font-medium"
                      style={{
                        color: settings.pdfTheme === 'dark' ? '#E6EDF3' : '#111',
                      }}
                    >
                      {settings.agencyName || 'Your Agency Name'}
                    </h3>
                    {settings.tagline && (
                      <p className="text-[11px]" style={{ color: settings.primaryColor }}>
                        {settings.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sample Content */}
                <div className="space-y-2">
                  <div
                    className="h-1.5 w-1/2 rounded-full"
                    style={{ background: settings.primaryColor }}
                  />
                  <div
                    className="h-1.5 w-3/4 rounded-full"
                    style={{
                      background:
                        settings.pdfTheme === 'dark' ? '#2E2E33' : '#E5E7EB',
                    }}
                  />
                  <div
                    className="h-1.5 w-1/3 rounded-full"
                    style={{
                      background:
                        settings.pdfTheme === 'dark' ? '#2E2E33' : '#E5E7EB',
                    }}
                  />
                  <div
                    className="h-1.5 w-2/3 rounded-full"
                    style={{ background: settings.secondaryColor }}
                  />
                </div>

                {/* Footer */}
                <p
                  className="mt-6 border-t pt-3 text-[10px]"
                  style={{
                    color: settings.pdfTheme === 'dark' ? '#6B7280' : '#9CA3AF',
                    borderColor: settings.pdfTheme === 'dark' ? '#232326' : '#E5E7EB',
                  }}
                >
                  {settings.footerText || 'Footer text will appear here'}
                </p>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Live preview updates as you edit. Applied to all future PDF exports.
              </p>
            </motion.aside>
          </div>
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </>
  );
}
