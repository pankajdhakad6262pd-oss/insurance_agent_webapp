'use client';

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Shield, User, Mail, Phone, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const { agent } = useAuth();

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings &amp; Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your licensed advisor credentials, account identity, and system access levels.
        </p>
      </div>

      {/* Agent Profile Card */}
      <Card className="p-6">
        <CardHeader className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Advisor Profile Credentials</CardTitle>
              <CardDescription>Official registration details underwritten for customer quotes.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <User className="h-3 w-3" />
              <span>Full Advisor Name</span>
            </div>
            <span className="font-bold text-slate-900 text-sm block">{agent?.name || 'David Miller'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <Mail className="h-3 w-3" />
              <span>Authorized Email</span>
            </div>
            <span className="font-bold text-slate-900 text-sm block">{agent?.email || 'agent@test.com'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <Phone className="h-3 w-3" />
              <span>Mobile Contact</span>
            </div>
            <span className="font-bold text-slate-900 text-sm block">{agent?.mobile || '+1 (555) 234-5678'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase text-[10px]">
              <KeyRound className="h-3 w-3" />
              <span>System Access Level</span>
            </div>
            <div className="mt-0.5">
              <Badge variant="success" className="capitalize">{agent?.role || 'agent'} Role</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
