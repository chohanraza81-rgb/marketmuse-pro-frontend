'use client';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

export const GaugeChart = ({ score }: { score: number }) => {
  const data = [{ name: 'Market Score', value: score, fill: '#6366F1' }];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={20} data={data} startAngle={180} endAngle={0}>
        <RadialBar background dataKey="value" cornerRadius={10} />
        <Legend />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
