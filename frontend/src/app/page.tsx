'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [token, isLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading InsureShield Agent Platform...</p>
      </div>
    </div>
  );
}

