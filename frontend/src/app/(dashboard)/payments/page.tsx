'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Mail,
  Zap,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCheck,
  FileText,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Payment } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Pagination } from '../../../components/ui/pagination';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await api.listPayments();
      if (res.success && res.data) {
        setPayments(res.data.items);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch payments log');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async (paymentId: string) => {
    setSimulatingId(paymentId);
    try {
      const res = await api.simulatePaymentSuccess(paymentId);
      if (res.success) {
        toast.success(
          `Payment verified! Policy ${res.data.policy.policyNumber} activated & Resend email dispatched!`
        );
        fetchPayments();
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed');
    } finally {
      setSimulatingId(null);
    }
  };

  const getWhatsAppPaymentUrl = (payment: Payment) => {
    const customer = payment.customerId as any;
    const quote = payment.quoteId as any;
    const phone = customer?.mobile ? customer.mobile.replace(/[^\d]/g, '') : '';
    const name = customer ? `${customer.firstName} ${customer.lastName}` : 'Client';
    const prodName = quote?.productId?.name || 'Insurance Plan';

    const rawLink = payment.stripePaymentLink || '';
    const cleanLink = rawLink.replace(/^https?:\/\/(https?:\/\/)+/i, '$1');
    const paymentUrl = cleanLink.startsWith('http')
      ? cleanLink
      : (typeof window !== 'undefined' ? `${window.location.origin}${cleanLink}` : cleanLink);

    const msg =
      `Hello ${name},\n\n` +
      `Your insurance quotation for *${prodName}* has been approved!\n\n` +
      `Amount Due: *$${payment.amount.toLocaleString()} USD*\n\n` +
      `Please complete your payment using this official link to activate your policy certificate immediately:\n` +
      `${paymentUrl}\n\n` +
      `Best regards,\nYour Insurance Advisor`;

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Helper to extract advisor info from payment
  const getPaymentAdvisor = (p: Payment) => {
    const quote = p.quoteId as any;
    const customer = p.customerId as any;
    const adv = (p.agentId || quote?.agentId || customer?.createdByAgent) as any;
    return {
      name: adv?.name || 'David Miller',
      email: adv?.email || 'agent@test.com',
      role: adv?.role || 'agent',
    };
  };

  // Extract unique advisor names for filter dropdown
  const uniqueAdvisors = Array.from(
    new Set(payments.map((p) => getPaymentAdvisor(p).name))
  ).filter(Boolean);

  // Filter and sort logic
  const filteredPayments = payments
    .filter((p) => {
      // 1. Status Filter
      const isStatusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && p.paymentStatus === 'completed') ||
        (statusFilter === 'pending' && p.paymentStatus === 'pending');

      if (!isStatusMatch) return false;

      // 2. Advisor Filter
      const advisor = getPaymentAdvisor(p);
      if (advisorFilter !== 'all' && advisor.name !== advisorFilter) {
        return false;
      }

      // 3. Search Query (Client Name, Plan, Amount, Reference, Advisor Name/Email)
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const customer = p.customerId as any;
      const quote = p.quoteId as any;
      const custName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const prodName = quote?.productId?.name ? quote.productId.name.toLowerCase() : '';
      const amountStr = p.amount.toString();
      const refId = p._id.toLowerCase();
      const advName = advisor.name.toLowerCase();
      const advEmail = advisor.email.toLowerCase();

      return (
        custName.includes(query) ||
        prodName.includes(query) ||
        amountStr.includes(query) ||
        refId.includes(query) ||
        advName.includes(query) ||
        advEmail.includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const completedCount = payments.filter((p) => p.paymentStatus === 'completed').length;
  const pendingCount = payments.filter((p) => p.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Transactions &amp; Activations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total of <span className="font-semibold text-slate-800">{total}</span> billing records and policy issuance events
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchPayments} className="space-x-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Records</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            All Transactions ({payments.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('completed');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => {
              setStatusFilter('pending');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* Search, Advisor Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, plan, advisor, reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Advisor Filter Dropdown */}
            <div className="flex items-center space-x-1">
              <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={advisorFilter}
                onChange={(e) => {
                  setAdvisorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">All Advisors ({payments.length})</option>
                {uniqueAdvisors.map((advName) => {
                  const count = payments.filter((p) => getPaymentAdvisor(p).name === advName).length;
                  return (
                    <option key={advName} value={advName}>
                      Advisor: {advName} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 h-24">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          {searchTerm || statusFilter !== 'all' || advisorFilter !== 'all'
            ? 'No payment records match your active search and filter criteria.'
            : 'No payment records created yet.'}
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedPayments.map((p) => {
            const customer = p.customerId as any;
            const quote = p.quoteId as any;
            const advisor = getPaymentAdvisor(p);
            const whatsAppUrl = getWhatsAppPaymentUrl(p);
            const isCompleted = p.paymentStatus === 'completed';

            return (
              <Card
                key={p._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {isCompleted ? <ShieldCheck className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {customer?.firstName} {customer?.lastName}
                      </h3>
                      <Badge variant={isCompleted ? 'success' : 'warning'}>
                        {p.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Plan: <span className="font-semibold text-slate-700">{quote?.productId?.name || 'Insurance Policy'}</span> • Created {formatDate(p.createdAt)}
                    </p>

                    {/* Advisor Attribution Badge & Quote Reference */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-100 text-xs font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>Quoted by Advisor: <strong className="font-semibold text-slate-900">{advisor.name}</strong></span>
                        {advisor.email && <span className="text-blue-600/80 text-[11px]">({advisor.email})</span>}
                      </div>

                      {quote?._id && (
                        <div className="inline-flex items-center space-x-1 bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-200/70 text-[11px]">
                          <FileText className="h-3 w-3 text-slate-400" />
                          <span>Quote Ref: <strong className="font-mono text-slate-700">{quote._id.slice(-6).toUpperCase()}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mt-2.5 text-xs font-semibold text-slate-700">
                      <span>Total Due: <span className="text-emerald-700 font-extrabold text-sm">{formatCurrency(p.amount)} USD</span></span>
                      {isCompleted && p.paidAt && (
                        <span className="text-emerald-600 flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Paid on {formatDate(p.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Share Payment Link via WhatsApp */}
                  {!isCompleted && (
                    <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" className="space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share on WhatsApp</span>
                      </Button>
                    </a>
                  )}

                  {/* Direct Stripe Checkout Link */}
                  {!isCompleted && (
                    <a href={p.stripePaymentLink?.replace(/^https?:\/\/(https?:\/\/)+/i, '$1') || '#'} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="space-x-1 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Checkout</span>
                      </Button>
                    </a>
                  )}

                  {/* Simulate Payment Test Button */}
                  {!isCompleted ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-700"
                      isLoading={simulatingId === p._id}
                      onClick={() => handleSimulatePayment(p._id)}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Simulate Payment &amp; Activation</span>
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <Mail className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Policy Active &amp; Email Sent</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredPayments.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
