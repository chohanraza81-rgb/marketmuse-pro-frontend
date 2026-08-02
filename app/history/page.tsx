'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const flags = { us: '🇺🇸', pk: '🇵🇰', gb: '🇬🇧', ae: '🇦🇪', sa: '🇸🇦' };

  useEffect(() => {
    fetch('https://marketmuse-pro-backend-production.up.railway.app/api/reports?limit=50')
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#020202] text-white">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent mb-6">Report History</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-4">
          <p className="text-sm text-gray-400">Total Reports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-4">
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-[#6366F1]">${reports.length * 99}</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-[#1F1F1F] rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1F1F1F]">
                <th className="p-2 text-left">Date</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Niche</th><th className="p-2 text-left">Country</th><th className="p-2 text-left">Value</th><th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} className="border-b border-[#1F1F1F]/50 hover:bg-white/5">
                  <td className="p-2">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${report.type === 'product' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{report.type}</span></td>
                  <td className="p-2">{report.niche}</td>
                  <td className="p-2">{flags[report.country]}</td>
                  <td className="p-2">$99</td>
                  <td className="p-2"><Link href={`/${report.type}-research/${report._id}`} className="text-[#6366F1] hover:underline">View</Link></td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No reports yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
