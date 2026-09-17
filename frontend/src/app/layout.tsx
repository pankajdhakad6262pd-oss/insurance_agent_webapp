import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '../hooks/useAuth';
import './globals.css';

export const metadata: Metadata = {
  title: 'InsureShield | Modern Insurance Agent Platform',
  description: 'Production-ready MVP CRM for certified insurance agents to underwrite, quote, and activate policies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
