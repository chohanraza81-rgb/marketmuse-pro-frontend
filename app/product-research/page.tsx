'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProductResearchPage() {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const countries = ['us', 'pk', 'gb', 'ae', 'sa'];
  const flags: Record<string, string> = { us: '🇺🇸', pk: '🇵🇰', gb: '🇬🇧', ae: '🇦🇪', sa: '🇸🇦' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    try {
      const API_URL = 'https://marketmuse-pro-backend-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/product-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, country }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const report = await res.json();
      router.push(`/product-research/${report.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#020202]">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
          Find 6-Figure Products in 30 Seconds
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          AI-powered product research with real-time market data.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-xl space-y-6 bg-[#0A0A0A] backdrop-blur-xl border border-[#1F1F1F] rounded-2xl p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Product Niche
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. ergonomic office chair"
            className="w-full bg-[#020202] border border-[#1F1F1F] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            Target Country
          </label>
          <div className="grid grid-cols-5 gap-3">
            {countries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={`p-2 border rounded-lg text-lg ${
                  country === c
                    ? 'border-[#6366F1] bg-[#6366F1]/20'
                    : 'border-[#1F1F1F]'
                }`}
              >
                {flags[c]} {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6366F1] hover:bg-[#8B5CF6] transition text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report – $99'}
        </button>
      </form>
    </main>
  );
}
