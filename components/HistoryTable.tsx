'use client';
import { useState, useEffect } from 'react';
import { getReports, deleteReport } from '@/lib/api';
import { countryFlags } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CopyButton } from './CopyButton';
import { ExportPDFButton } from './ExportPDF';
import { ExportCSVButton } from './ExportCSV';
import { Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const HistoryTable = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', country: '', startDate: '', endDate: '' });
  const [selected, setSelected] = useState<string[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.country) params.country = filters.country;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await getReports(params);
      setReports(data.reports || []);
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [filters]);

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    toast.success('Report deleted');
    fetchReports();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalValue = reports.length * 99;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-400">Total Reports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-2xl font-bold gradient-text">${totalValue}</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-gray-400">Type</label>
          <select className="bg-bg border border-border rounded px-3 py-2 w-full text-white" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
            <option value="">All</option>
            <option value="product">Product</option>
            <option value="seo">SEO</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Country</label>
          <select className="bg-bg border border-border rounded px-3 py-2 w-full text-white" value={filters.country} onChange={e => setFilters({...filters, country: e.target.value})}>
            <option value="">All</option>
            <option value="us">US</option>
            <option value="pk">PK</option>
            <option value="gb">GB</option>
            <option value="ae">AE</option>
            <option value="sa">SA</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">From</label>
          <input type="date" className="bg-bg border border-border rounded px-3 py-2 w-full text-white" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        </div>
        <div>
          <label className="text-xs text-gray-400">To</label>
          <input type="date" className="bg-bg border border-border rounded px-3 py-2 w-full text-white" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-border rounded" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? reports.map(r => r._id) : [])} />
                </th>
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Niche</th>
                <th className="p-2">Country</th>
                <th className="p-2">Value</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="p-2">
                    <input type="checkbox" checked={selected.includes(report._id)} onChange={() => toggleSelect(report._id)} />
                  </td>
                  <td className="p-2">{format(new Date(report.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${report.type === 'product' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="p-2">{report.niche}</td>
                  <td className="p-2">{countryFlags[report.country]}</td>
                  <td className="p-2">{report.value}</td>
                  <td className="p-2 flex gap-2">
                    <Link href={`/${report.type}-research/${report._id}`}>
                      <Button variant="ghost" size="icon"><Eye size={16} /></Button>
                    </Link>
                    <ExportPDFButton report={report} />
                    <ExportCSVButton data={report.data?.keywords || []} filename={`${report._id}.csv`} />
                    <CopyButton text={window.location.origin + `/${report.type}-research/${report._id}`} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(report._id)}>
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
