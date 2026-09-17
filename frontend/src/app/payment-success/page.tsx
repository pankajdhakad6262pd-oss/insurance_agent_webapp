'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Download, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const quoteId = searchParams.get('quote_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (sessionId) query.set('session_id', sessionId);
        if (quoteId) query.set('quote_id', quoteId);

        const res = await fetch(`/api/payments/verify-session?${query.toString()}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Payment verification failed');
        }

        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Unable to verify payment status');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [sessionId, quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-slate-200/80 shadow-xl space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Verifying Payment...</h2>
          <p className="text-xs text-slate-500">
            Confirming your transaction with Stripe and activating your insurance policy. Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-rose-200 shadow-xl space-y-4">
          <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-9 w-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Status Notice</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <p className="text-[11px] text-slate-400 pt-2">
            If you need assistance with your payment, please reach out to your insurance advisor.
          </p>
        </div>
      </div>
    );
  }

  const { policy, customer, product, quote, payment } = data || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/30 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-2.5">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">InsureShield</span>
        </div>

        {/* Success Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-200/80 shadow-2xl shadow-emerald-500/10 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />

          {/* Badge & Title */}
          <div className="text-center space-y-3">
            <div className="h-16 w-16 bg-emerald-100/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <Badge variant="success" className="mb-2">Payment Confirmed &amp; Policy Issued</Badge>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Insurance Policy is Active!
              </h1>
              <p className="text-xs text-slate-500 mt-1.5">
                Transaction processed successfully. Below are your official policy credentials.
              </p>
            </div>
          </div>

          {/* Policy Information Box */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Policy Number</span>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {policy?.policyNumber || 'POL-2026-ACTIVE'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Insured Name</span>
              <span className="font-bold text-slate-900">
                {customer?.firstName} {customer?.lastName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Plan</span>
              <span className="font-bold text-slate-900">{product?.name || 'Comprehensive Plan'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Sum Assured</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(product?.coverageAmount || 500000)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Premium Paid</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(payment?.amount || quote?.premium || 0)} USD
              </span>
            </div>

            {policy?.startDate && policy?.endDate && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Coverage Term</span>
                <span className="font-semibold text-slate-700">
                  {formatDate(policy.startDate)} – {formatDate(policy.endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Email Confirmation Notice */}
          <div className="flex items-start space-x-3 p-3.5 bg-blue-50/80 border border-blue-200/70 rounded-xl text-blue-900 text-xs">
            <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Confirmation Email Sent</p>
              <p className="text-blue-700/90 text-[11px] mt-0.5">
                An official confirmation with subject <span className="font-medium italic">"Your Insurance Policy Is Active"</span> and your certificate has been delivered to <span className="font-semibold">{customer?.email}</span>.
              </p>
            </div>
          </div>

          {/* Action Button: Download Policy Document */}
          <div className="pt-2">
            {quote?._id && (
              <a
                href={`/api/quotes/${quote._id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block"
              >
                <Button className="w-full space-x-2 text-sm py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20">
                  <Download className="h-4 w-4" />
                  <span>Download Policy Document (PDF)</span>
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400">
          InsureShield Underwriting Platform • Encrypted &amp; Secured by Stripe
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

