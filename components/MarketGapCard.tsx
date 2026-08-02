'use client';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';

export const MarketGapCard = ({ gap }: { gap: { insight: string; icon: string } }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card relative overflow-hidden group"
    >
      <div className="text-4xl mb-3">{gap.icon}</div>
      <p className="text-white font-medium">{gap.insight}</p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <CopyButton text={gap.insight} />
      </div>
    </motion.div>
  );
};
