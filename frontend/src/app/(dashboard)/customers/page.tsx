'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Car,
  Shield,
  SlidersHorizontal,
  Filter,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Customer } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Pagination } from '../../../components/ui/pagination';
import { formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting State
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'car' | 'two-wheeler' | 'commercial' | 'none'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'under_30' | '30_50' | 'over_50'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name_asc' | 'income_desc' | 'age_asc' | 'age_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.listCustomers({ search });
      if (res.success && res.data) {
        setCustomers(res.data.items);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch customer directory');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & sort logic
  const filteredCustomers = customers
    .filter((c) => {
      // Vehicle type filter
      if (vehicleFilter !== 'all') {
        if (vehicleFilter === 'none') {
          if (c.vehicleType && c.vehicleType !== 'none') return false;
        } else if (c.vehicleType !== vehicleFilter) {
          return false;
        }
      }

      // Age bracket filter
      if (ageFilter === 'under_30' && c.age >= 30) return false;
      if (ageFilter === '30_50' && (c.age < 30 || c.age > 50)) return false;
      if (ageFilter === 'over_50' && c.age <= 50) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'income_desc') return b.annualIncome - a.annualIncome;
      if (sortBy === 'age_asc') return a.age - b.age;
      if (sortBy === 'age_desc') return b.age - a.age;
      if (sortBy === 'name_asc') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total of <span className="font-semibold text-slate-800">{total}</span> underwritten client profiles
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a href="/customers/new">
            <Button size="md" className="space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add New Customer</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Vehicle Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setVehicleFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vehicleFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            All Clients ({customers.length})
          </button>
          <button
            onClick={() => {
              setVehicleFilter('car');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vehicleFilter === 'car'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Car Owners ({customers.filter((c) => c.vehicleType === 'car').length})
          </button>
          <button
            onClick={() => {
              setVehicleFilter('two-wheeler');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vehicleFilter === 'two-wheeler'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Two-Wheeler ({customers.filter((c) => c.vehicleType === 'two-wheeler').length})
          </button>
          <button
            onClick={() => {
              setVehicleFilter('commercial');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vehicleFilter === 'commercial'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Commercial ({customers.filter((c) => c.vehicleType === 'commercial').length})
          </button>
          <button
            onClick={() => {
              setVehicleFilter('none');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              vehicleFilter === 'none'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            No Vehicle ({customers.filter((c) => !c.vehicleType || c.vehicleType === 'none').length})
          </button>
        </div>

        {/* Search, Age Bracket, and Sort Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Age Filter */}
            <div className="flex items-center space-x-1">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={ageFilter}
                onChange={(e) => {
                  setAgeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-9 px-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">Age: All</option>
                <option value="under_30">&lt; 30 Years</option>
                <option value="30_50">30 – 50 Years</option>
                <option value="over_50">&gt; 50 Years</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1">
              <SlidersHorizontal className="h-3 w-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-9 px-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="newest">Sort: Newest</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="income_desc">Income: High to Low</option>
                <option value="age_asc">Age: Youngest</option>
                <option value="age_desc">Age: Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Data Table / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 h-48">
              <Skeleton className="h-5 w-36 mb-3" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {search || vehicleFilter !== 'all' || ageFilter !== 'all'
              ? 'Try adjusting your active search and filter options.'
              : 'Start by creating your first underwritten customer profile.'}
          </p>
          <a href="/customers/new">
            <Button size="sm">+ Create Customer Profile</Button>
          </a>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCustomers.map((c) => (
            <Card key={c._id} className="p-5 flex flex-col justify-between hover:border-blue-300">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {c.firstName} {c.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{c.occupation} • Age {c.age}</p>
                  </div>
                  <Badge variant={c.vehicleType && c.vehicleType !== 'none' ? 'info' : 'outline'}>
                    {c.vehicleType ? `${c.vehicleType}` : 'No Vehicle'}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{c.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{c.city}, {c.state}</span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1 font-semibold text-slate-800">
                    <span>Income: {formatCurrency(c.annualIncome)}/yr</span>
                  </div>
                </div>
              </div>

              <a href={`/customers/${c._id}`}>
                <Button size="sm" variant="outline" className="w-full space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 border-blue-200">
                  <Shield className="h-3.5 w-3.5" />
                  <span>View Eligibility &amp; Quotes</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </a>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
