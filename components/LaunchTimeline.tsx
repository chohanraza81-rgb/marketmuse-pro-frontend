'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CopyButton } from './CopyButton';

export const LaunchTimeline = ({ plan }: { plan: { day: number; task: string }[] }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (day: number) => {
    setChecked(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="relative">
      {plan.map((item, idx) => (
        <motion.div
          key={item.day}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
          className="flex items-start gap-4 mb-4 pl-6 border-l border-border relative"
        >
          <div className="absolute -left-3 top-0">
            <div
              onClick={() => toggle(item.day)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${
                checked[item.day] ? 'bg-accent border-accent' : 'border-gray-600 hover:border-accent'
              }`}
            >
              {checked[item.day] && <Check size={14} className="text-white" />}
            </div>
          </div>
          <div className="flex-1 glass-card p-3 group">
            <span className="text-xs text-accent font-medium">Day {item.day}</span>
            <p className="text-sm mt-1">{item.task}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <CopyButton text={`Day ${item.day}: ${item.task}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
