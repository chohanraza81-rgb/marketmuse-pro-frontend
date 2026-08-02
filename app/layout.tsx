import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'MarketMuse AI PRO MAX ULTRA',
  description: '6-Figure Product Research & SEO Domination',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ErrorBoundary>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}
