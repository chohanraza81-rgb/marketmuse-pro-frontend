'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  _id: string;
  type: string;
  niche: string;
  country: string;
  createdAt: string;
}

const flags: Record<string, string> = {
  us:'🇺🇸', gb:'🇬🇧', ca:'🇨🇦', au:'🇦🇺', de:'🇩🇪', sg:'🇸🇬',
  sa:'🇸🇦', ae:'🇦🇪', pk:'🇵🇰', in:'🇮🇳', tr:'🇹🇷', my:'🇲🇾',
};

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('https://marketmuse-pro-backend-production-a93c.up.railway.app/api/reports?limit=100')
      .then(r => r.json())
      .then(data => {
        setReports(data.reports || []);
        setMessage('');
      })
      .catch(err => {
        setMessage('Error: ' + err.message);
      });
  }, []);

  if (message) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        <p style={{ fontSize: '18px' }}>{message}</p>
        <a href="/history" style={{ color: '#6366f1' }}>Retry</a>
        <a href="/" style={{ color: '#6366f1' }}>Home</a>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Report History</h1>
        <a href="/" style={{ color: '#6366f1', textDecoration: 'none' }}>← Home</a>
      </div>
      
      <p style={{ color: '#888', marginBottom: '20px' }}>{reports.length} reports total</p>

      {reports.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No reports found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reports.map((r) => (
            <div key={r._id} style={{
              background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px',
              padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: r.type === 'product' ? '#05966920' : '#4f46e520',
                    color: r.type === 'product' ? '#34d399' : '#818cf8'
                  }}>
                    {r.type === 'product' ? 'Product' : 'SEO'}
                  </span>
                  <span>{flags[r.country]}</span>
                </div>
                <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{r.niche}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={r.type === 'product' ? `/product-research/${r._id}` : `/seo-report/${r._id}`}
                style={{
                  padding: '6px 14px', borderRadius: '8px', background: '#1f1f1f',
                  color: '#ccc', textDecoration: 'none', fontSize: '13px'
                }}
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
