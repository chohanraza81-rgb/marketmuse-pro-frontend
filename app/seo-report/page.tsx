'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export default function SEOReportPage() {
  const router = useRouter();
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return toast.error('Please enter a niche');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/seo-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), country }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      router.push(`/report/${data._id}`);
      toast.success('Report generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0F0F14] border border-neutral-800">
        <h1 className="text-2xl font-bold mb-6 text-center">SEO Intelligence Report</h1>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Niche / Topic</label>
            <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white" placeholder="e.g. keto diet for beginners" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white" disabled={loading}>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
              <option value="sg">Singapore</option>
              <option value="in">India</option>
              <option value="pk">Pakistan</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate SEO Report'}
          </button>
        </form>
      </div>
    </main>
  );
}
