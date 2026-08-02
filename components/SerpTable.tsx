'use client';
import { GaugeChart } from './GaugeChart'; // we can reuse radial bar for DA gauge

export const SerpTable = ({ serp }: { serp: any[] }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">SERP Top 10 – Difficulty to Beat</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2">#</th>
              <th className="p-2">Title</th>
              <th className="p-2">DA</th>
              <th className="p-2">Words</th>
              <th className="p-2">Backlinks</th>
            </tr>
          </thead>
          <tbody>
            {serp.map((item, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-white/5">
                <td className="p-2">{item.position}</td>
                <td className="p-2 max-w-[200px] truncate">{item.title}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-8">
                      <GaugeChart score={item.da || 0} /> {/* small gauge */}
                    </div>
                    <span>{item.da}</span>
                  </div>
                </td>
                <td className="p-2">{item.word_count}</td>
                <td className="p-2">{item.backlinks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
