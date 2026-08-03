import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'MarketMuse PRO | AI Market Intelligence',
  description: 'Enterprise-grade product research & SEO intelligence for modern agencies.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black">
        <Toaster position="bottom-center" theme="dark" richColors />
        {children}
      </body>
    </html>
  );
}
