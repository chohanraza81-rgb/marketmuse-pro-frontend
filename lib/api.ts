const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const createProductReport = (niche: string, country: string) =>
  fetchAPI('/product-research', {
    method: 'POST',
    body: JSON.stringify({ niche, country }),
  });

export const createSEOReport = (niche: string, country: string) =>
  fetchAPI('/seo-report', {
    method: 'POST',
    body: JSON.stringify({ niche, country }),
  });

export const getReports = (params: Record<string, string>) =>
  fetchAPI(`/reports?${new URLSearchParams(params)}`);

export const getReport = (id: string) => fetchAPI(`/reports/${id}`);

export const deleteReport = (id: string) =>
  fetchAPI(`/reports/${id}`, { method: 'DELETE' });
