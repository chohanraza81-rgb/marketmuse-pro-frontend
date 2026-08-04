'use client';
import { useEffect, useState } from 'react';

export default function LiveStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('https://marketmuse-pro-backend-production.up.railway.app/api/health');
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  if (online === null) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
      online ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
              'bg-red-500/10 border border-red-500/20 text-red-400'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
