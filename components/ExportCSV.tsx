'use client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

export const ExportCSVButton = ({ data, filename = 'export.csv' }: { data: any[]; filename?: string }) => {
  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
      <Download size={14} /> Export CSV
    </Button>
  );
};
