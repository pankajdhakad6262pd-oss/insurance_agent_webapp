'use client';

import React from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

export const Header: React.FC = () => {
  const { agent } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Welcome back, <span className="text-blue-600">{agent?.name?.split(' ')[0] || 'Agent'}</span> 👋
        </h2>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Active Portal
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <a href="/customers/new">
          <Button size="sm" className="space-x-1.5">
            <UserPlus className="h-4 w-4" />
            <span>New Customer</span>
          </Button>
        </a>
      </div>
    </header>
  );
};
