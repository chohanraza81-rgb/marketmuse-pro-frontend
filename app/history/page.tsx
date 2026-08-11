'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  _id: string;
  type: 'product' | 'seo';
  niche: string;
  country: string;
  createdAt: string;
}

const flags: Record<string, string> = {
  us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪', sg: '🇸🇬',
  sa: '🇸🇦', ae: '🇦🇪', pk: '🇵🇰', in: '🇮🇳', tr: '🇹🇷', my: '🇲🇾',
};

const BACKEND_URL = 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/reports?limit=500`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report permanently?')) return;
    try {
      await fetch(`${BACKEND_URL}/reports/${id}`, { method: 'DELETE' });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif', padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Report History</h1>
        <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px' }}>← Home</Link>
      </div>

      <p style={{ color: '#888', marginBottom: '20px', fontSize: '14px' }}>
        {reports.length} reports total
        <button
          onClick={fetchReports}
          style={{
            marginLeft: '12px',
            background: '#1f1f1f',
            color: '#ccc',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Refresh
        </button>
      </p>

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>Error: {error}</p>
      ) : reports.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No reports found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reports.map((r) => (
            <div
              key={r._id}
              style={{
                background: '#171717',
                border: '1px solid #262626',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: r.type === 'product' ? '#05966920' : '#4f46e520',
                      color: r.type === 'product' ? '#34d399' : '#818cf8',
                    }}
                  >
                    {r.type === 'product' ? 'Product' : 'SEO'}
                  </span>
                  <span style={{ fontSize: '14px' }}>{flags[r.country]}</span>
                </div>
                <p style={{ fontWeight: 500, textTransform: 'capitalize', margin: '4px 0' }}>{r.niche}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(r.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href={`/report/${r._id}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#1f1f1f',
                    color: '#ccc',
                    textDecoration: 'none',
                    fontSize: '13px',
                  }}
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(r._id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#1f1f1f',
                    color: '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
