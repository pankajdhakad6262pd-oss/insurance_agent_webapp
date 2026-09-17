'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShieldCheck,
  FileText,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'New Customer', href: '/customers/new', icon: UserPlus },
  { label: 'Insurance Products', href: '/products', icon: ShieldCheck },
  { label: 'Quotations', href: '/quotes', icon: FileText },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { agent, logout } = useAuth();

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href === '/customers') {
      // Highlight /customers on /customers and on /customers/[id], but NEVER on /customers/new
      return pathname.startsWith('/customers/') && pathname !== '/customers/new';
    }
    if (href === '/dashboard' || href === '/customers/new') {
      return false;
    }
    return pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white/70 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0 shadow-sm z-30">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none tracking-tight">InsureShield</h1>
              <p className="text-xs font-semibold text-blue-600 tracking-wider mt-1 uppercase">Agent Platform</p>
            </div>
          </a>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-sm border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-100/80 bg-slate-50/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-200/60 shadow-xs mb-3">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {agent?.name ? agent.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{agent?.name || 'Licensed Agent'}</p>
              <p className="text-[11px] text-slate-500 truncate">{agent?.email || 'agent@test.com'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
