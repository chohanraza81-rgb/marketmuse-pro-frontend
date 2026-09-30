'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  loading: boolean;
  title?: string;
  message?: string;
  accentColor?: string;
}

export function LoadingOverlay({
  loading,
  title = 'Processing',
  message = 'Please wait...',
  accentColor = 'var(--accent-indigo)',
}: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--bg-base)]/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface-1)] p-8 text-center"
      >
        <div className="relative mx-auto mb-5 h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: `${accentColor}30` }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2"
            style={{ borderColor: accentColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <Loader2
            size={24}
            className="absolute inset-0 m-auto animate-spin"
            style={{ color: accentColor }}
          />
        </div>
        <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">{message}</p>
      </motion.div>
    </motion.div>
  );
}
