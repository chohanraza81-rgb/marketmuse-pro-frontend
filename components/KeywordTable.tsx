'use client';
import { useState, useMemo } from 'react';
import { CopyButton } from './CopyButton';
import { CopyAllButton } from './CopyAllButton';
import { ExportCSVButton } from './ExportCSV';
import { ArrowUpDown, Search } from 'lucide-react';

interface Keyword {
  keyword: string;
  volume: number;
  kd: number;
  cpc: number;
}

export const KeywordTable = ({ keywords }: { keywords: Keyword[] }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Keyword>('volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let arr = keywords.filter(k => k.keyword.toLowerCase().includes(search.toLowerCase()));
    arr.sort((a, b) => (sortDir === 'asc' ? (a[sortField] as number) - (b[sortField] as number) : (b[sortField] as number) - (a[sortField] as number)));
    return arr;
  }, [keywords, search, sortField, sortDir]);

  const handleSort = (field: keyof Keyword) => {
    if (field === sortField) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const keywordList = keywords.map(k => k.keyword);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2 w-full max-w-xs">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Filter keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
        </div>
        <div className="flex gap-2">
          <CopyAllButton items={keywordList} label="Copy All 50" />
          <ExportCSVButton data={keywords} filename="keywords.csv" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left">Keyword</th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('volume')}>
                Volume <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('kd')}>
                KD <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('cpc')}>
                CPC <ArrowUpDown size={12} className="inline ml-1" />
              </th>
              <th className="p-2">Copy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((kw, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-white/5">
                <td className="p-2">{kw.keyword}</td>
                <td className="p-2 text-right">{kw.volume?.toLocaleString()}</td>
                <td className="p-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    kw.kd < 30 ? 'bg-green-500/20 text-green-400' : kw.kd < 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {kw.kd}
                  </span>
                </td>
                <td className="p-2 text-right">${kw.cpc?.toFixed(2)}</td>
                <td className="p-2"><CopyButton text={kw.keyword} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
