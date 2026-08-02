'use client';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';

export const PersonaCard = ({ persona }: { persona: { name: string; avatar: string; description: string; ads_channel: string } }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card relative group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-lg">
          {persona.avatar || '👤'}
        </div>
        <div>
          <h3 className="font-semibold">{persona.name}</h3>
          <p className="text-xs text-gray-400">Best ads: {persona.ads_channel}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300">{persona.description}</p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <CopyButton text={`${persona.name}: ${persona.description}`} />
      </div>
    </motion.div>
  );
};
