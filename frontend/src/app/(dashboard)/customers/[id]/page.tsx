'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  CreditCard,
  Share2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Search,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import { api } from '../../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Dialog } from '../../../../components/ui/dialog';
import { Pagination } from '../../../../components/ui/pagination';
import { formatCurrency, formatDate, sanitizeUrl } from '../../../../lib/utils';
import { toast } from 'sonner';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [purchasedPolicies, setPurchasedPolicies] = useState<any[]>([]);
  const [eligibleProducts, setEligibleProducts] = useState<any[]>([]);
  const [ineligibleProducts, setIneligibleProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quote Generation State
  const [generatingForProductId, setGeneratingForProductId] = useState<string | null>(null);
  const [activeQuoteResult, setActiveQuoteResult] = useState<{ quote: any; whatsAppShareUrl: string } | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Payment Link Generation from Modal
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Eligible Plans Filtering & Pagination
  const [planCategoryFilter, setPlanCategoryFilter] = useState<string>('all');
  const [planSearch, setPlanSearch] = useState('');
  const [planSort, setPlanSort] = useState<'default' | 'premium_asc' | 'premium_desc' | 'coverage_desc'>('default');
  const [planPage, setPlanPage] = useState(1);
  const plansPerPage = 6;

  useEffect(() => {
    fetchEligibility();
  }, [customerId]);

  const fetchEligibility = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEligibleProducts(customerId);
      if (res.success && res.data) {
        setCustomer(res.data.customer);
        setPurchasedPolicies(res.data.purchasedPolicies || []);
        setEligibleProducts(res.data.eligibleProducts || []);
        setIneligibleProducts(res.data.ineligibleProducts || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to evaluate customer eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuote = async (productId: string) => {
    setGeneratingForProductId(productId);
    try {
      const res = await api.generateQuote({
        customerId,
        productId,
        notes: 'Personalized quotation issued from customer eligibility console.',
      });

      if (res.success && res.data) {
        setActiveQuoteResult(res.data);
        setIsQuoteModalOpen(true);
        toast.success('Quotation PDF generated and underwritten successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate quotation');
    } finally {
      setGeneratingForProductId(null);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!activeQuoteResult) return;
    setIsGeneratingPayment(true);
    try {
      const res = await api.createPaymentLink(activeQuoteResult.quote._id, customerId);
      if (res.success && res.data) {
        setPaymentResult(res.data);
        toast.success('Stripe Payment Link created!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate payment link');
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">Customer not found.</p>
        <a href="/customers" className="mt-4 inline-block">
          <Button size="sm">Return to Customers</Button>
        </a>
      </div>
    );
  }

  // Filter and sort eligible products
  const availableCategories = Array.from(
    new Set(
      eligibleProducts
        .map((p) => (typeof p.categoryId === 'object' ? p.categoryId?.name : null))
        .filter(Boolean)
    )
  );

  const filteredEligibleProducts = eligibleProducts
    .filter((product) => {
      const catName = typeof product.categoryId === 'object' ? product.categoryId?.name : '';
      const matchesCat = planCategoryFilter === 'all' || catName === planCategoryFilter;
      const matchesSearch =
        !planSearch.trim() ||
        product.name.toLowerCase().includes(planSearch.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(planSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (planSort === 'premium_asc') return a.premium - b.premium;
      if (planSort === 'premium_desc') return b.premium - a.premium;
      if (planSort === 'coverage_desc') return b.coverageAmount - a.coverageAmount;
      return 0;
    });

  const paginatedEligibleProducts = filteredEligibleProducts.slice(
    (planPage - 1) * plansPerPage,
    planPage * plansPerPage
  );

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <a
        href="/customers"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition space-x-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Customer Directory</span>
      </a>

      {/* Customer Header & Underwriting Profile Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-500/20">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {customer.firstName} {customer.lastName}
                </h1>
                <Badge variant="info">Verified Profile</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Client ID: <span className="font-mono">{customer._id}</span> • Profile Created on {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a href={`tel:${customer.mobile}`}>
              <Button size="sm" variant="outline" className="space-x-1.5 text-xs">
                <Phone className="h-3.5 w-3.5" />
                <span>Call Client</span>
              </Button>
            </a>
            <a href={`mailto:${customer.email}`}>
              <Button size="sm" variant="outline" className="space-x-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Client</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Demographics & Underwriting Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Age</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{customer.age} Years</span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Gender</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block capitalize">{customer.gender}</span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Annual Income</span>
            <span className="font-bold text-blue-700 text-sm mt-0.5 block">{formatCurrency(customer.annualIncome)}</span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Occupation</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{customer.occupation}</span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Vehicle Status</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block capitalize">
              {customer.vehicleType && customer.vehicleType !== 'none' ? customer.vehicleType : 'None Registered'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Phone Number</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{customer.mobile}</span>
          </div>
        </div>
      </div>

      {/* Active / Purchased Policies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Active / Purchased Policies</h2>
              <p className="text-xs text-slate-500">
                Plans successfully purchased and active for this client. These plans cannot be purchased twice.
              </p>
            </div>
          </div>
          <Badge variant={purchasedPolicies.length > 0 ? 'success' : 'default'} className="px-3 py-1">
            {purchasedPolicies.length} Active {purchasedPolicies.length === 1 ? 'Policy' : 'Policies'}
          </Badge>
        </div>

        {purchasedPolicies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {purchasedPolicies.map((policy) => {
              const prod = policy.productId || {};
              const cat = prod.categoryId || {};
              const catName = typeof cat === 'object' ? cat.name : 'Insurance Plan';
              const quoteId = policy.quoteId?._id || policy.quoteId;

              return (
                <div
                  key={policy._id}
                  className="glass-card rounded-2xl p-5 border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/25 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                          {catName}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2 leading-snug">
                          {prod.name || 'Purchased Policy'}
                        </h3>
                      </div>
                      <Badge variant="success" className="shrink-0 flex items-center space-x-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active</span>
                      </Badge>
                    </div>

                    <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Policy Number:</span>
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {policy.policyNumber}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Sum Assured:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(prod.coverageAmount || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Annual Premium:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(prod.premium || 0)}/yr
                        </span>
                      </div>

                      {policy.startDate && policy.endDate && (
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-500 font-medium">Active Term:</span>
                          <span className="font-semibold text-slate-700">
                            {formatDate(policy.startDate)} – {formatDate(policy.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    {quoteId ? (
                      <a
                        href={`/api/quotes/${quoteId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-block"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs font-semibold space-x-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 shadow-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Policy Document (PDF)</span>
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="w-full text-xs font-semibold space-x-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Policy Active</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5 border border-dashed border-slate-200 bg-slate-50/50 text-center">
            <p className="text-xs text-slate-500">
              No active policies have been purchased for this client yet. Select from the eligible plans below to generate an official quote.
            </p>
          </div>
        )}
      </div>

      {/* Real-time Eligible Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">New Eligible Insurance Products</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available plans this customer is eligible to purchase (already-purchased plans are automatically excluded).
            </p>
          </div>
          <Badge variant="info" className="px-3 py-1">
            {eligibleProducts.length} Match(es) Found
          </Badge>
        </div>

        {/* Filters Toolbar */}
        {eligibleProducts.length > 0 && (
          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setPlanCategoryFilter('all');
                  setPlanPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  planCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                All Categories ({eligibleProducts.length})
              </button>
              {availableCategories.map((catName) => {
                const count = eligibleProducts.filter(
                  (p) => (typeof p.categoryId === 'object' ? p.categoryId?.name : '') === catName
                ).length;
                return (
                  <button
                    key={catName as string}
                    onClick={() => {
                      setPlanCategoryFilter(catName as string);
                      setPlanPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      planCategoryFilter === catName
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {catName} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search and Sort controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter eligible plans by name or coverage..."
                  value={planSearch}
                  onChange={(e) => {
                    setPlanSearch(e.target.value);
                    setPlanPage(1);
                  }}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={planSort}
                  onChange={(e) => {
                    setPlanSort(e.target.value as any);
                    setPlanPage(1);
                  }}
                  className="h-9 px-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="premium_asc">Premium: Low to High</option>
                  <option value="premium_desc">Premium: High to Low</option>
                  <option value="coverage_desc">Coverage: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Eligible Products Grid */}
        {eligibleProducts.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No products currently match this applicant's profile under standard underwriting criteria.
          </Card>
        ) : filteredEligibleProducts.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No eligible products match your filter criteria. Try changing the category or search query.
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEligibleProducts.map((product) => (
                <Card key={product._id} className="flex flex-col justify-between p-6 hover:border-blue-400 transition-all">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {typeof product.categoryId === 'object' ? product.categoryId?.name : 'Coverage Plan'}
                      </span>
                      <Badge variant="success" className="space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Eligible</span>
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug mb-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{product.description}</p>

                    <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 mb-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sum Assured:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(product.coverageAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Policy Term:</span>
                        <span className="font-medium text-slate-800">{product.termYears} Year(s)</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Annual Premium:</span>
                        <span className="font-extrabold text-blue-700 text-sm">{formatCurrency(product.premium)}/yr</span>
                      </div>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div className="space-y-1 mb-4">
                        {product.features.slice(0, 2).map((feat: string, i: number) => (
                          <p key={i} className="text-[11px] text-slate-600 flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    size="md"
                    variant="primary"
                    className="w-full space-x-2"
                    isLoading={generatingForProductId === product._id}
                    onClick={() => handleGenerateQuote(product._id)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Quotation PDF</span>
                  </Button>
                </Card>
              ))}
            </div>

            <Pagination
              currentPage={planPage}
              totalItems={filteredEligibleProducts.length}
              itemsPerPage={plansPerPage}
              onPageChange={setPlanPage}
            />
          </>
        )}

        {/* Ineligible Products Collapsible / List */}
        {ineligibleProducts.length > 0 && (
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Ineligible Products ({ineligibleProducts.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ineligibleProducts.map(({ product, reasons }) => (
                <div
                  key={product._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 opacity-80 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{product.name}</span>
                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                      Ineligible
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{product.description}</p>
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-rose-700 text-[11px] space-y-1">
                    <span className="font-semibold block">Underwriting Constraint:</span>
                    {reasons.map((r: string, idx: number) => (
                      <p key={idx}>• {r}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Generation & Stripe Payment Modal */}
      <Dialog
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setPaymentResult(null);
        }}
        title="Quotation Issued Successfully"
        description="Your personalized quotation PDF has been rendered and underwritten."
        className="max-w-lg"
      >
        {activeQuoteResult && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated Premium:</span>
                <span className="font-extrabold text-blue-700 text-sm">{formatCurrency(activeQuoteResult.quote.premium)} USD/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Underwritten Sum Assured:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(activeQuoteResult.quote.coverageAmount)} USD</span>
              </div>
            </div>

            {/* Action Buttons: View PDF & Share WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={sanitizeUrl(activeQuoteResult.quote.generatedPdfUrl)}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full space-x-2 text-slate-800 border-slate-300">
                  <ExternalLink className="h-4 w-4" />
                  <span>View &amp; Download PDF</span>
                </Button>
              </a>

              <a
                href={sanitizeUrl(activeQuoteResult.whatsAppShareUrl)}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="w-full space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20">
                  <Share2 className="h-4 w-4" />
                  <span>Share via WhatsApp</span>
                </Button>
              </a>
            </div>

            {/* Stripe Payment Link Generator */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Step 2: Collect Payment &amp; Issue Policy
              </h4>

              {!paymentResult ? (
                <Button
                  variant="secondary"
                  className="w-full space-x-2"
                  isLoading={isGeneratingPayment}
                  onClick={handleCreatePaymentLink}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Generate Stripe Payment Link</span>
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Payment Link Active!</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={sanitizeUrl(paymentResult.stripePaymentLink)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-emerald-300 text-slate-700 font-mono"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href={sanitizeUrl(paymentResult.whatsAppPaymentUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                        <Share2 className="h-3.5 w-3.5 mr-1.5" />
                        WhatsApp
                      </Button>
                    </a>
                    <a
                      href={sanitizeUrl(paymentResult.stripePaymentLink)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline" className="w-full text-xs border-emerald-400 text-emerald-800 hover:bg-emerald-100">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Open Stripe
                      </Button>
                    </a>
                    <a href="/payments">
                      <Button size="sm" variant="ghost" className="w-full text-xs">
                        Payments Log
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
