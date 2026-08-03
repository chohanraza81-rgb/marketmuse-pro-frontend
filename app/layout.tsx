import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'MarketMuse PRO | AI Market Intelligence',
  description: 'Enterprise-grade product research & SEO intelligence for modern agencies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black">
        <Toaster 
          position="top-center" 
          theme="dark" 
          richColors 
          expand
          toastOptions={{
            style: {
              background: '#171717',
              border: '1px solid #262626',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
