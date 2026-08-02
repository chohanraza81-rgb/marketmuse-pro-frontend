'use client';
import { CopyButton } from './CopyButton';
import { CopyAllButton } from './CopyAllButton';

export const ContentCalendarGrid = ({ calendar }: { calendar: { title: string; keyword: string }[] }) => {
  const titles = calendar.map(c => c.title);
  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyAllButton items={titles} label="Copy All Titles" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {calendar.map((item, i) => (
          <div key={i} className="glass-card p-4 group relative">
            <p className="font-medium text-sm mb-1">{item.title}</p>
            <p className="text-xs text-accent">{item.keyword}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <CopyButton text={item.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
