'use client';
import { CopyButton } from './CopyButton';
import { currencySymbol } from '@/lib/utils';

export const PriceEngineTable = ({ products, country }: { products: any[]; country: string }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2">Product</th>
            <th className="p-2">Price</th>
            <th className="p-2">Est. Cost</th>
            <th className="p-2">Est. Profit</th>
            <th className="p-2">Reviews</th>
            <th className="p-2">Copy</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-white/5">
              <td className="p-2 flex items-center gap-2">
                {p.image && <img src={p.image} className="w-8 h-8 rounded" alt="" />}
                <span>{p.title}</span>
              </td>
              <td className="p-2">{currencySymbol[country]}{p.price}</td>
              <td className="p-2">{currencySymbol[country]}{p.estimated_cost}</td>
              <td className="p-2 text-green-400">{currencySymbol[country]}{p.estimated_profit}</td>
              <td className="p-2">{p.reviews}</td>
              <td className="p-2"><CopyButton text={p.title} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
