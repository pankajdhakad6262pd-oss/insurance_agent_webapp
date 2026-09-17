'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  ExternalLink,
  Share2,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Quote } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Dialog } from '../../../components/ui/dialog';
import { Pagination } from '../../../components/ui/pagination';
import { formatCurrency, formatDate, sanitizeUrl } from '../../../lib/utils';
import { toast } from 'sonner';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'shared' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'premium_desc' | 'coverage_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Stripe Payment Link modal
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<Quote | null>(null);
  const [paymentLinkResult, setPaymentLinkResult] = useState<any>(null);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const res = await api.listQuotes();
      if (res.success && res.data) {
        setQuotes(res.data.items);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentModal = async (quote: Quote) => {
    setSelectedQuoteForPayment(quote);
    setPaymentLinkResult(null);
    setIsPaymentModalOpen(true);
    setIsGeneratingPayment(true);

    try {
      const res = await api.createPaymentLink(quote._id);
      if (res.success && res.data) {
        setPaymentLinkResult(res.data);
        toast.success('Stripe Payment Link ready!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate payment link');
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  const getWhatsAppQuoteUrl = (quote: Quote) => {
    const customer = quote.customerId as any;
    const product = quote.productId as any;
    const phone = customer?.mobile ? customer.mobile.replace(/[^\d]/g, '') : '';
    const name = customer ? `${customer.firstName} ${customer.lastName}` : 'Client';
    const prodName = product?.name || 'Insurance Plan';

    const rawPdf = quote.generatedPdfUrl || '';
    const cleanPdf = rawPdf.replace(/^https?:\/\/(https?:\/\/)+/i, '$1');
    const pdfUrl = cleanPdf.startsWith('http')
      ? cleanPdf
      : (typeof window !== 'undefined' ? `${window.location.origin}${cleanPdf}` : cleanPdf);

    const msg =
      `Hello ${name},\n\n` +
      `Here is your official insurance quotation for *${prodName}*.\n\n` +
      `Annual Premium: *$${quote.premium.toLocaleString()} USD*\n\n` +
      `You can view and download your full quotation breakdown PDF here:\n` +
      `${pdfUrl}\n\n` +
      `Please let me know if you would like to proceed with policy activation.\n\n` +
      `Best regards,\nYour Insurance Advisor`;

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Filter & sort logic
  const filteredQuotes = quotes
    .filter((q) => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;

      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const customer = q.customerId as any;
      const product = q.productId as any;
      const advisor = (q.agentId || customer?.createdByAgent) as any;
      const custName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const prodName = product?.name ? product.name.toLowerCase() : '';
      const refId = q._id.toLowerCase();
      const advName = advisor?.name ? advisor.name.toLowerCase() : '';
      const advEmail = advisor?.email ? advisor.email.toLowerCase() : '';

      return (
        custName.includes(query) ||
        prodName.includes(query) ||
        refId.includes(query) ||
        advName.includes(query) ||
        advEmail.includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'premium_desc') return b.premium - a.premium;
      if (sortBy === 'coverage_desc') return b.coverageAmount - a.coverageAmount;
      return 0;
    });

  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations Archive</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total of <span className="font-semibold text-slate-800">{total}</span> generated policy proposals
          </p>
        </div>
        <a href="/customers">
          <Button size="sm" className="space-x-1.5">
            <span>+ Generate New Quotation</span>
          </Button>
        </a>
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
            All Proposals ({quotes.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('generated');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'generated'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Generated ({quotes.filter((q) => q.status === 'generated').length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('shared');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'shared'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Shared ({quotes.filter((q) => q.status === 'shared').length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('paid');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Paid ({quotes.filter((q) => q.status === 'paid').length})
          </button>
        </div>

        {/* Search and Sort controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, plan, or reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
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
              <option value="premium_desc">Highest Premium</option>
              <option value="coverage_desc">Highest Coverage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 h-24">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : filteredQuotes.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          {searchTerm || statusFilter !== 'all'
            ? 'No quotations match your active search and filter criteria.'
            : 'No quotations generated yet. Select a customer to underwrite and issue a quote.'}
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedQuotes.map((q) => {
            const customer = q.customerId as any;
            const product = q.productId as any;
            const advisor = (q.agentId || customer?.createdByAgent) as any;
            const advisorName = advisor?.name || 'David Miller';
            const advisorEmail = advisor?.email || 'agent@test.com';
            const whatsAppUrl = getWhatsAppQuoteUrl(q);
            const cleanPdf = sanitizeUrl(q.generatedPdfUrl);

            return (
              <Card
                key={q._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {customer?.firstName} {customer?.lastName}
                      </h3>
                      <Badge variant={q.status === 'paid' ? 'success' : q.status === 'shared' ? 'info' : 'default'}>
                        {q.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {product?.name || 'Underwritten Plan'} • Issued {formatDate(q.createdAt)}
                    </p>

                    <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100 text-[11px] font-medium mt-1.5">
                      <UserCheck className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Quoted by Advisor: <strong className="font-semibold text-slate-900">{advisorName}</strong></span>
                      {advisorEmail && <span className="text-blue-600/80">({advisorEmail})</span>}
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-xs font-semibold text-slate-700">
                      <span>Premium: <span className="text-blue-600 font-extrabold">{formatCurrency(q.premium)}</span></span>
                      <span>Coverage: {formatCurrency(q.coverageAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View PDF */}
                  <a href={cleanPdf} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="space-x-1 text-xs">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View PDF</span>
                    </Button>
                  </a>

                  {/* Share on WhatsApp */}
                  <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp Share</span>
                    </Button>
                  </a>

                  {/* Collect Payment */}
                  {q.status !== 'paid' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="space-x-1 text-xs"
                      onClick={() => openPaymentModal(q)}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Pay Link</span>
                    </Button>
                  ) : (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Paid &amp; Active
                    </span>
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
        totalItems={filteredQuotes.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Payment Link Modal */}
      <Dialog
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Stripe Payment Link Generated"
        description="Share this link with the client to collect payment and activate their policy."
        className="max-w-lg"
      >
        <div className="space-y-4 pt-2">
          {isGeneratingPayment ? (
            <div className="py-8 text-center space-y-2">
              <Skeleton className="h-8 w-full" />
              <p className="text-xs text-slate-500">Creating Stripe checkout session...</p>
            </div>
          ) : paymentLinkResult ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Premium Due:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(selectedQuoteForPayment?.premium || 0)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <Badge variant="warning">Pending Confirmation</Badge>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Direct Payment Link
                </label>
                <input
                  type="text"
                  readOnly
                  value={sanitizeUrl(paymentLinkResult.stripePaymentLink)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <a
                  href={sanitizeUrl(paymentLinkResult.whatsAppPaymentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button className="w-full space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </a>

                <a
                  href={sanitizeUrl(paymentLinkResult.stripePaymentLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full space-x-1 text-xs border-emerald-400 text-emerald-800 hover:bg-emerald-50">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Stripe</span>
                  </Button>
                </a>

                <a
                  href="/payments"
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full text-xs">
                    <span>Payments Log</span>
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500">Could not initialize payment session.</p>
          )}
        </div>
      </Dialog>
    </div>
  );
}
