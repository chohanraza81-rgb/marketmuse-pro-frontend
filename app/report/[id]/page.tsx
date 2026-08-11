'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts';

// Professional color palette – no emojis
const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const BG_COLOR = '#0A0A0A';
const CARD_BG = '#171717';
const BORDER_COLOR = '#262626';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#A3A3A3';

const BACKEND_URL = 'https://marketmuse-pro-backend-production-a93c.up.railway.app/api';

export default function VisualReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${BACKEND_URL}/reports/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found');
        return res.json();
      })
      .then(data => setReport(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG_COLOR }}>
        <div className="w-10 h-10 border-2 border-neutral-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG_COLOR }}>
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Report not found</p>
          <Link href="/" className="text-indigo-400 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const isProduct = report.type === 'product';
  const data = report.data;
  const charts = report.charts;

  // Derived data for charts
  const marketShareData = data?.chart_data?.competitor_market_share || [];
  const profitMarginData = data?.pricing_engine?.map((p: any) => ({
    name: p.title?.substring(0, 20) + '...',
    margin: p.profit_margin_percent
  })) || [];
  const demandTrend = data?.chart_data?.demand_forecast_12m?.map((val: number, i: number) => ({
    month: `M${i+1}`,
    value: val
  })) || [];
  const trafficForecast = data?.chart_data?.traffic_forecast_6m?.map((val: number, i: number) => ({
    month: `M${i+1}`,
    traffic: val
  })) || data?.chart_data?.traffic_growth_6m?.map((val: number, i: number) => ({
    month: `M${i+1}`,
    traffic: val
  })) || [];

  const score = data?.market_score || 0;
  const financials = data?.financial_forecast || data?.financial_projections || {};
  const risks = data?.risk_matrix || data?.risk_radar || [];

  return (
    <div style={{ background: BG_COLOR, color: TEXT_PRIMARY, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-1">MusePRO</h1>
          <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Real-Time Market Research · Intelligence Division</p>
          <div className="mt-4 h-px" style={{ background: BORDER_COLOR }} />
          <div className="mt-4 flex flex-wrap justify-between items-center text-sm" style={{ color: TEXT_SECONDARY }}>
            <span>{isProduct ? 'Product Research Report' : 'SEO Research Report'}</span>
            <span>Prepared For: [Client] | Ref: {report._id?.slice(-6).toUpperCase() || 'N/A'}</span>
            <span>Date: {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Classification: CONFIDENTIAL</span>
          </div>
          <div className="mt-2 h-px" style={{ background: BORDER_COLOR }} />
        </div>

        {/* Opportunity Scorecard */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4 tracking-tight">OPPORTUNITY SCORECARD</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
              <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY }}>OPPORTUNITY SCORE</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{score}</span>
                <span className="text-sm" style={{ color: TEXT_SECONDARY }}>/100</span>
              </div>
              <div className="mt-3 w-full h-2 rounded-full" style={{ background: BORDER_COLOR }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score}%`,
                    background: score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
                  }}
                />
              </div>
            </div>
            {isProduct && (
              <>
                <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
                  <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY }}>EST. MONTHLY PROFIT</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ${financials?.month6_profit_optimistic?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
                  <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY }}>BREAKEVEN</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {financials?.units_to_breakeven?.toLocaleString() || 'N/A'} units
                  </p>
                </div>
                <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
                  <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY }}>TIME TO PROFIT</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {financials?.months_to_profitability || 'N/A'} months
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Key Insights */}
        {data?.key_insights?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold mb-4 tracking-tight">KEY INSIGHTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.key_insights.map((insight: string, i: number) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderLeft: `3px solid ${COLORS[i % COLORS.length]}` }}>
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Demand Trend (Line Chart) */}
          {demandTrend.length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
              <h3 className="text-sm font-semibold mb-4 tracking-tight">DEMAND TREND (12 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} />
                  <XAxis dataKey="month" stroke={TEXT_SECONDARY} fontSize={12} />
                  <YAxis stroke={TEXT_SECONDARY} fontSize={12} />
                  <Tooltip contentStyle={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Market Share (Donut Chart) */}
          {marketShareData.length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
              <h3 className="text-sm font-semibold mb-4 tracking-tight">MARKET SHARE DISTRIBUTION</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={marketShareData} dataKey="share" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {marketShareData.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {marketShareData.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-1 text-xs" style={{ color: TEXT_SECONDARY }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                    {entry.name}: {entry.share}%
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profit Margin (Horizontal Bar Chart) */}
          {profitMarginData.length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
              <h3 className="text-sm font-semibold mb-4 tracking-tight">MARGIN COMPARISON BY PRODUCT</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitMarginData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} />
                  <XAxis type="number" stroke={TEXT_SECONDARY} fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" stroke={TEXT_SECONDARY} fontSize={11} width={120} />
                  <Tooltip contentStyle={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px' }} formatter={(value: any) => `${value}%`} />
                  <Bar dataKey="margin" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Traffic Forecast (Area Chart) */}
          {trafficForecast.length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}` }}>
              <h3 className="text-sm font-semibold mb-4 tracking-tight">TRAFFIC FORECAST (6 MONTHS)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trafficForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} />
                  <XAxis dataKey="month" stroke={TEXT_SECONDARY} fontSize={12} />
                  <YAxis stroke={TEXT_SECONDARY} fontSize={12} />
                  <Tooltip contentStyle={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="traffic" stroke="#8B5CF6" fill="#8B5CF630" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Risk Matrix */}
        {risks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold mb-4 tracking-tight">RISK ASSESSMENT MATRIX</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <th className="text-left py-3 px-4" style={{ color: TEXT_SECONDARY }}>Risk</th>
                    <th className="text-left py-3 px-4" style={{ color: TEXT_SECONDARY }}>Probability</th>
                    <th className="text-left py-3 px-4" style={{ color: TEXT_SECONDARY }}>Impact</th>
                    <th className="text-left py-3 px-4" style={{ color: TEXT_SECONDARY }}>Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                      <td className="py-3 px-4">{r.risk}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.probability === 'High' ? 'bg-red-500/20 text-red-400' :
                          r.probability === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>{r.probability}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                          r.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>{r.impact}</span>
                      </td>
                      <td className="py-3 px-4" style={{ color: TEXT_SECONDARY }}>{r.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: BORDER_COLOR }}>
          <div className="flex flex-wrap justify-between text-xs" style={{ color: TEXT_SECONDARY }}>
            <span>METHODOLOGY & SOURCES: Google Shopping via SerpAPI, Google Keyword Planner via Keywords Everywhere, Google Trends, ExchangeRate-API, GPT-4o</span>
            <span>DOCUMENT CONTROL: Classification: Confidential | Distribution: Client Only | Version: 1.0 | Prepared By: MusePRO Intelligence Division</span>
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: TEXT_SECONDARY }}>© MusePRO — Intelligence Division. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
