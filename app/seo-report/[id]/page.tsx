'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReport } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyAllButton } from '@/components/CopyAllButton';
import { ExportPDFButton } from '@/components/ExportPDF';
import { ExportCSVButton } from '@/components/ExportCSV';
import { KeywordTable } from '@/components/KeywordTable';
import { TrendChart } from '@/components/TrendChart';
import { SerpTable } from '@/components/SerpTable';
import { ContentCalendarGrid } from '@/components/ContentCalendarGrid';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { countryFlags } from '@/lib/utils';

export default function SEOReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id as string).then(data => { setReport(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!report) return <div className="text-center mt-20">Report not found</div>;

  const niche = report.niche;
  const country = report.country;
  const analysis = report.data;
  const trends = report.charts?.trends || [];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 glass-card p-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/seo-report" className="text-gray-400 hover:text-white"><ArrowLeft /></Link>
          <h1 className="text-xl font-bold">{niche}</h1>
          <span className="text-2xl">{countryFlags[country]}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${analysis.trend_score === 'Seasonal' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
            {analysis.trend_score}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CopyAllButton items={analysis.keywords?.map((k:any) => k.keyword) || []} label="Copy All Keywords" />
          <ExportPDFButton report={report} />
          <ExportCSVButton data={analysis.keywords || []} filename={`seo_keywords_${niche}.csv`} />
          <button onClick={() => {
            navigator.share?.({ title: `SEO Report: ${niche}`, url: window.location.href })
              .catch(() => navigator.clipboard.writeText(window.location.href));
          }} className="p-1.5 border border-border rounded-lg"><Share2 size={16} /></button>
        </div>
      </div>

      <Tabs defaultValue="keywords" className="w-full">
        <TabsList className="glass-card mb-6 flex overflow-x-auto">
          <TabsTrigger value="keywords">Keyword Goldmine</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="serp">SERP Intelligence</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="markdown">Markdown / Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords">
          <KeywordTable keywords={analysis.keywords || []} />
        </TabsContent>

        <TabsContent value="trends">
          <div className="glass-card p-6 mb-6">
            <h3 className="font-semibold mb-4">12-Month Interest Over Time</h3>
            <TrendChart data={trends} />
          </div>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Related Query Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Bar chart placeholder – can use Recharts BarChart with related queries data
            </div>
          </div>
        </TabsContent>

        <TabsContent value="serp">
          <SerpTable serp={analysis.serp_analysis || []} />
        </TabsContent>

        <TabsContent value="calendar">
          <ContentCalendarGrid calendar={analysis.content_calendar || []} />
        </TabsContent>

        <TabsContent value="strategy">
          <MarkdownViewer content={`# Backlink Strategy\n${analysis.backlink_strategy}\n\n## On-page Checklist\n- Optimize title tags\n- Meta descriptions\n- Header tags\n- Image alt attributes\n- Internal linking\n- Mobile responsiveness\n- Page speed`} />
        </TabsContent>

        <TabsContent value="markdown">
          <MarkdownViewer content={report.markdown} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
