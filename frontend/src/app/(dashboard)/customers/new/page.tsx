'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import { customerSchema, CustomerFormData } from '../../../../lib/validators';
import { api } from '../../../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      age: 30,
      gender: 'male',
      occupation: '',
      annualIncome: 75000,
      city: '',
      state: '',
      vehicleType: 'none',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    // Prevent multiple submissions if user double-clicks rapidly
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await api.createCustomer(data);
      if (res.success && res.data) {
        toast.success(`Customer ${data.firstName} ${data.lastName} created successfully!`);
        router.push(`/customers/${res.data._id}`);
        return;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer profile');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <a
          href="/customers"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition space-x-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Directory</span>
        </a>
      </div>

      <Card className="p-8">
        <CardHeader className="mb-6">
          <div className="flex items-center space-x-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Create Customer Profile</CardTitle>
              <CardDescription>
                Provide applicant personal, income, and vehicle data for instant eligibility calculation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="e.g. John"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                placeholder="e.g. Doe"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Phone / Mobile Number"
                placeholder="+1 (555) 000-0000"
                {...register('mobile')}
                error={errors.mobile?.message}
              />
            </div>
          </div>

          {/* Section 2: Demographics & Underwriting Attributes */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Underwriting Demographics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Age (Years)"
                type="number"
                placeholder="30"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender.message}</p>}
              </div>
              <Input
                label="Annual Income ($ USD)"
                type="number"
                placeholder="75000"
                {...register('annualIncome', { valueAsNumber: true })}
                error={errors.annualIncome?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Input
                label="Occupation"
                placeholder="e.g. Software Engineer"
                {...register('occupation')}
                error={errors.occupation?.message}
              />
              <Input
                label="City"
                placeholder="e.g. San Francisco"
                {...register('city')}
                error={errors.city?.message}
              />
              <Input
                label="State"
                placeholder="e.g. CA"
                {...register('state')}
                error={errors.state?.message}
              />
            </div>
          </div>

          {/* Section 3: Asset Ownership */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Vehicle Ownership Status</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Registered Vehicle Type</label>
              <select
                {...register('vehicleType')}
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="none">None (No Vehicle)</option>
                <option value="car">Four-Wheeler / Personal Car</option>
                <option value="two-wheeler">Two-Wheeler / Motorcycle</option>
                <option value="commercial">Commercial Vehicle / Fleet</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Required for Vehicle Insurance underwriting eligibility.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
            <a href="/customers">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </a>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="space-x-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              <span>Save &amp; Check Eligibility</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
