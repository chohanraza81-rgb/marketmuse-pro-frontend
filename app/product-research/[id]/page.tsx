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
import { GaugeChart } from '@/components/GaugeChart';
import { PriceEngineTable } from '@/components/PriceEngineTable';
import { MarketGapCard } from '@/components/MarketGapCard';
import { PersonaCard } from '@/components/PersonaCard';
import { LaunchTimeline } from '@/components/LaunchTimeline';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { countryFlags } from '@/lib/utils';

export default function ProductReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id as string).then(data => {
      setReport(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!report) return <div className="text-center mt-20">Report not found</div>;

  const niche = report.niche;
  const country = report.country;
  const analysis = report.data;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 glass-card p-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/product-research" className="text-gray-400 hover:text-white"><ArrowLeft /></Link>
          <h1 className="text-xl font-bold">{niche}</h1>
          <span className="text-2xl">{countryFlags[country]}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CopyAllButton items={analysis.launch_plan?.map((l:any) => l.task) || []} label="Copy Plan" />
          <ExportPDFButton report={report} />
          <ExportCSVButton data={analysis.pricing_engine || []} filename={`pricing_${niche}.csv`} />
          <button onClick={() => {
            navigator.share?.({ title: `MarketMuse Report: ${niche}`, url: window.location.href })
              .catch(() => navigator.clipboard.writeText(window.location.href));
          }} className="p-1.5 border border-border rounded-lg"><Share2 size={16} /></button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="glass-card mb-6 flex overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Engine</TabsTrigger>
          <TabsTrigger value="gap">Market Gap</TabsTrigger>
          <TabsTrigger value="personas">Customer Playbook</TabsTrigger>
          <TabsTrigger value="launch">30 Day Launch</TabsTrigger>
          <TabsTrigger value="markdown">Markdown / Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card col-span-1 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Market Score</h2>
              <GaugeChart score={analysis.market_score} />
            </div>
            <div className="glass-card col-span-2 grid grid-cols-3 gap-4">
              <KPI label="Demand" value="High" icon="🔥" />
              <KPI label="Competition" value="Medium" icon="⚔️" />
              <KPI label="Profit" value="$12k/mo" icon="💰" />
            </div>
            <div className="glass-card col-span-full">
              <h3 className="font-semibold mb-3">12-Month Demand Forecast</h3>
              {/* Recharts LineChart using report.charts.trends */}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="pricing">
          <PriceEngineTable products={analysis.pricing_engine} country={country} />
        </TabsContent>

        <TabsContent value="gap">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.market_gap.map((gap: any, i: number) => (
              <MarketGapCard key={i} gap={gap} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personas">
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.personas.map((p: any, i: number) => (
              <PersonaCard key={i} persona={p} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="launch">
          <LaunchTimeline plan={analysis.launch_plan} />
        </TabsContent>

        <TabsContent value="markdown">
          <MarkdownViewer content={report.markdown} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function KPI({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="glass-card text-center p-4">
      <span className="text-2xl">{icon}</span>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xl font-bold gradient-text">{value}</p>
    </div>
  );
}
