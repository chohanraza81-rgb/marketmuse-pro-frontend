'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type Status = 'checking' | 'online' | 'offline';

interface HealthData {
  lastChecked: Date | null;
  responseTime: number | null;
  uptime: number;
  checksTotal: number;
  checksSuccessful: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LiveStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [showTooltip, setShowTooltip] = useState(false);
  const [health, setHealth] = useState<HealthData>({
    lastChecked: null,
    responseTime: null,
    uptime: 100,
    checksTotal: 0,
    checksSuccessful: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Health Check ──
  const checkHealth = async () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://marketmuse-pro-backend-production-fd01.up.railway.app/api';

    const startTime = Date.now();

    try {
      const res = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Date.now() - startTime;

      setStatus(res.ok ? 'online' : 'offline');
      setHealth((prev) => {
        const newTotal = prev.checksTotal + 1;
        const newSuccessful = prev.checksSuccessful + (res.ok ? 1 : 0);
        return {
          lastChecked: new Date(),
          responseTime,
          uptime: Math.round((newSuccessful / newTotal) * 100),
          checksTotal: newTotal,
          checksSuccessful: newSuccessful,
        };
      });
    } catch {
      setStatus('offline');
      setHealth((prev) => ({
        ...prev,
        lastChecked: new Date(),
        responseTime: null,
        checksTotal: prev.checksTotal + 1,
      }));
    }
  };

  // ── Setup polling ──
  useEffect(() => {
    checkHealth();
    intervalRef.current = setInterval(checkHealth, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived styles ──
  const isOnline = status === 'online';
  const isChecking = status === 'checking';
  const isOffline = status === 'offline';

  const statusColor = isOnline
    ? 'var(--accent-emerald)'
    : isOffline
    ? 'var(--accent-red)'
    : 'var(--accent-amber)';

  const statusLabel = isOnline ? 'Live' : isOffline ? 'Offline' : 'Checking';

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* ── Status Pill ── */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-[4px] border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors"
        style={{
          borderColor: `color-mix(in srgb, ${statusColor} 25%, transparent)`,
          background: `color-mix(in srgb, ${statusColor} 8%, transparent)`,
          color: statusColor,
        }}
      >
        {/* Pulse dot */}
        <span className="relative flex h-1.5 w-1.5">
          {isOnline && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: statusColor }}
            />
          )}
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: statusColor }}
          />
        </span>

        {/* Label */}
        <span>{statusLabel}</span>
      </button>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {showTooltip && !isChecking && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[100] mt-2 w-64 overflow-hidden rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface-2)] shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-[var(--border-subtle)] px-3 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-[3px]"
                  style={{ background: `color-mix(in srgb, ${statusColor} 15%, transparent)` }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusColor }}
                  />
                </div>
                <div>
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: statusColor }}
                  >
                    System {statusLabel}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {isOnline
                      ? 'All systems operational'
                      : 'Service unavailable'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2 px-3 py-3">
              <MetricRow
                label="Uptime (session)"
                value={`${health.uptime}%`}
                color={health.uptime >= 95 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}
              />
              <MetricRow
                label="Response time"
                value={health.responseTime ? `${health.responseTime}ms` : '—'}
                color={
                  health.responseTime && health.responseTime < 500
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-amber)'
                }
              />
              <MetricRow
                label="Last checked"
                value={formatRelativeTime(health.lastChecked)}
                color="var(--text-secondary)"
              />
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface-1)] px-3 py-2">
              <p className="text-[10px] text-[var(--text-muted)]">
                Auto-checks every 30 seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function MetricRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-[11px]" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function formatRelativeTime(date: Date | null): string {
  if (!date) return '—';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
