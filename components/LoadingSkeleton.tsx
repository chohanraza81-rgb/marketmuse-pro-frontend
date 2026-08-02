'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = ['Gathering market data...', 'Analyzing competitors...', 'Generating insights...', 'Compiling report...'];

export const LoadingSkeleton = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev)), 7000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="glass-card p-8 w-full max-w-2xl mx-auto text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-border rounded w-3/4 mx-auto" />
        <div className="h-4 bg-border rounded w-1/2 mx-auto" />
        <div className="h-4 bg-border rounded w-5/6 mx-auto" />
      </div>
      <div className="mt-6">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            className={`flex items-center gap-2 mb-2 ${i === step ? 'text-accent' : 'text-gray-500'}`}
            animate={{ opacity: i <= step ? 1 : 0.3 }}
          >
            <span className={`h-3 w-3 rounded-full ${i <= step ? 'bg-accent' : 'bg-border'}`} />
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
