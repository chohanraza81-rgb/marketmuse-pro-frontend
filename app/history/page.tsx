'use client';
import { useState, useEffect } from 'react';

interface Report {
  _id: string;
  type: string;
  niche: string;
  country: string;
  createdAt: string;
}

const flags: Record<string, string> = {
  us:'🇺�', gb:'🇬�', ca:'🇨🇦', au:'🇦🇺', de:'🇩🇪', sg:'🇸🇬',
  sa:'🇸🇦', ae:'🇦🇪', pk:'🇵🇰', in:'🇮🇳', tr:'🇹🇷', my:'🇲🇾',
};

const API_URL = 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/reports?limit=100`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        <p style={{ color: '#ef4444' }}>Error: {error}</p>
        <button onClick={loadReports} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Report History</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadReports} style={{ background: '#1f1f1f', color: '#ccc', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Refresh</button>
          <a href="/" style={{ color: '#6366f1', textDecoration: 'none', lineHeight: '2.2' }}>← Home</a>
        </div>
      </div>
      
      <p style={{ color: '#888', marginBottom: '20px' }}>{reports.length} reports total</p>

      {reports.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No reports found. <button onClick={loadReports} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Refresh</button></p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reports.map((r) => (
            <div key={r._id} style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: r.type === 'product' ? '#05966920' : '#4f46e520', color: r.type === 'product' ? '#34d399' : '#818cf8' }}>{r.type === 'product' ? 'Product' : 'SEO'}</span>
                  <span>{flags[r.country]}</span>
                </div>
                <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{r.niche}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <a href={r.type === 'product' ? `/product-research/${r._id}` : `/seo-report/${r._id}`} style={{ padding: '6px 14px', borderRadius: '8px', background: '#1f1f1f', color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>View →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
