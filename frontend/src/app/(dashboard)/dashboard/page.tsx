'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Share2,
  HeartPulse,
  Car,
  Plane,
  Umbrella,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="h-6 w-6 text-emerald-600" />;
      case 'Car':
        return <Car className="h-6 w-6 text-amber-600" />;
      case 'Plane':
        return <Plane className="h-6 w-6 text-sky-600" />;
      case 'Umbrella':
        return <Umbrella className="h-6 w-6 text-purple-600" />;
      default:
        return <ShieldCheck className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-xs border border-blue-400/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Assisted Underwriting &amp; Instant Quotes</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Agent Command Center</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Evaluate customer eligibility across Term, Health, Auto, Travel, and Life products.
            Generate branded PDF quotations and collect payments via Stripe in minutes.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <a href="/customers/new">
              <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 shadow-md">
                + Create Customer
              </Button>
            </a>
            <a href="/products">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 bg-transparent">
                Browse Products
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))
        ) : (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data?.metrics?.totalCustomers ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <span className="text-emerald-600 font-semibold inline-flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> Active
                </span>
                Underwritten Profiles
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Generated Quotes</span>
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data?.metrics?.totalQuotes ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <span>Personalized PDF Proposals</span>
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payments Logged</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data?.metrics?.totalPayments ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Total Revenue: <span className="font-semibold text-emerald-600">{formatCurrency(data?.metrics?.totalRevenue ?? 0)}</span>
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Policies</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data?.metrics?.totalActivePolicies ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Issued &amp; Certified Policies
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Insurance Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Insurance Categories</h2>
            <p className="text-xs text-slate-500">Supported underwriting domains and eligible plans</p>
          </div>
          <a href="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>View All Plans</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="h-36">
                <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-3 w-full" />
              </Card>
            ))
          ) : (
            data?.categories?.map((cat: any) => (
              <a key={cat._id} href={`/products?categoryId=${cat._id}`} className="group">
                <Card className="h-full hover:border-blue-300 transition-all p-5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{cat.productCount ?? 3} Plans</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Card>
              </a>
            ))
          )}
        </div>
      </div>

      {/* 2-Column Section: Recent Quotes & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Quotes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Quotations</h3>
              <p className="text-xs text-slate-500">Latest proposals generated for clients</p>
            </div>
            <a href="/quotes">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </a>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            ) : data?.recentQuotes?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No quotations generated yet. Create a customer to issue a quote.
              </div>
            ) : (
              data?.recentQuotes?.map((quote: any) => (
                <div
                  key={quote._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      {quote.customerId?.firstName} {quote.customerId?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {quote.productId?.name} • <span className="font-semibold text-slate-700">{formatCurrency(quote.premium)}/yr</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={quote.status === 'paid' ? 'success' : quote.status === 'shared' ? 'info' : 'default'}>
                      {quote.status}
                    </Badge>
                    <a href={quote.generatedPdfUrl} target="_blank" rel="noreferrer">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-slate-600">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Payment Activity</h3>
              <p className="text-xs text-slate-500">Stripe transactions and policy activations</p>
            </div>
            <a href="/payments">
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </a>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            ) : data?.recentPayments?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No payment activity recorded yet.
              </div>
            ) : (
              data?.recentPayments?.map((payment: any) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      {payment.customerId?.firstName} {payment.customerId?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.quoteId?.productId?.name || 'Policy Premium'} • {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                    <Badge variant={payment.paymentStatus === 'completed' ? 'success' : 'warning'}>
                      {payment.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

