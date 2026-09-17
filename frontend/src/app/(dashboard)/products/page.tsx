'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, HeartPulse, Car, Plane, Umbrella, CheckCircle, Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { api } from '../../../lib/api';
import { InsuranceProduct, InsuranceCategory } from '../../../types';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Pagination } from '../../../components/ui/pagination';
import { formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [categories, setCategories] = useState<InsuranceCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'premium_asc' | 'premium_desc' | 'coverage_desc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategoryId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        api.listCategories(),
        api.listProducts(selectedCategoryId === 'all' ? undefined : selectedCategoryId),
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (prodsRes.success) setProducts(prodsRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load insurance products');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'premium_asc') return a.premium - b.premium;
      if (sortBy === 'premium_desc') return b.premium - a.premium;
      if (sortBy === 'coverage_desc') return b.coverageAmount - a.coverageAmount;
      return 0;
    });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Insurance Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse underwritten products across Term, Health, Auto, Travel, and Life lines.
          </p>
        </div>
        <a href="/customers">
          <Button size="sm" className="space-x-1.5">
            <span>Select Customer to Underwrite</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedCategoryId('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategoryId(cat._id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategoryId === cat._id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search plans by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
              <option value="default">Sort: Default</option>
              <option value="premium_asc">Premium: Low to High</option>
              <option value="premium_desc">Premium: High to Low</option>
              <option value="coverage_desc">Coverage: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 h-64">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs">
          No insurance products found matching your search and filter criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((p) => {
            const catName = typeof p.categoryId === 'object' ? (p.categoryId as any).name : 'Standard Plan';

            return (
              <Card key={p._id} className="p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-[11px] font-bold text-blue-700 bg-blue-50/60 border-blue-200">
                      {catName}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Age: {p.minAge}–{p.maxAge} yrs
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug mt-1 mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{p.description}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coverage Sum Assured:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(p.coverageAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Policy Term Duration:</span>
                      <span className="font-medium text-slate-800">{p.termYears} Year(s)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Premium:</span>
                      <span className="font-extrabold text-blue-700 text-sm">{formatCurrency(p.premium)}/yr</span>
                    </div>
                  </div>

                  {p.features && p.features.length > 0 && (
                    <div className="space-y-1 mb-4">
                      {p.features.map((feat, i) => (
                        <p key={i} className="text-[11px] text-slate-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-emerald-500 mr-1.5 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <a href="/customers" className="w-full">
                  <Button size="sm" variant="outline" className="w-full text-xs text-slate-700 hover:bg-slate-50">
                    Quote for a Customer
                  </Button>
                </a>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
