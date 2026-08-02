'use client';
import { HistoryTable } from '@/components/HistoryTable';

export default function HistoryPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold font-satoshi gradient-text mb-6">Report CRM</h1>
      <HistoryTable />
    </main>
  );
}
