'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createProductReport } from '@/lib/api';
import { countryFlags } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const countries = ['us', 'pk', 'gb', 'ae', 'sa'];

export default function ProductResearchPage() {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    try {
      const report = await createProductReport(niche, country);
      router.push(`/product-research/${report.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold font-satoshi bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
          Find 6-Figure Products in 30 Seconds
        </h1>
        <p className="mt-4 text-gray-400 text-lg">AI-powered product research with real-time market data.</p>
      </motion.div>
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="glass-card mt-10 w-full max-w-xl space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Product Niche</label>
          <input
            type="text"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            placeholder="e.g. ergonomic office chair"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Target Country</label>
          <div className="grid grid-cols-5 gap-3">
            {countries.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={`p-2 border rounded-lg text-lg ${country === c ? 'border-accent bg-accent/20' : 'border-border hover:border-gray-600'}`}
              >
                {countryFlags[c]} {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-accent hover:bg-accent2 transition text-white font-semibold py-3 rounded-lg">
          Generate Report – $99
        </button>
      </motion.form>
    </main>
  );
}
