export type UserRole = 'agent' | 'admin';

export interface Agent {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt: string;
}

export type Gender = 'male' | 'female' | 'other';
export type VehicleType = 'two-wheeler' | 'car' | 'commercial' | 'none';

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  age: number;
  gender: Gender;
  occupation: string;
  annualIncome: number;
  city: string;
  state: string;
  vehicleType?: VehicleType;
  createdByAgent: string | Agent;
  createdAt: string;
}

export interface InsuranceCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  productCount?: number;
}

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  requiresVehicle?: boolean;
  allowedVehicleTypes?: string[];
  minIncome?: number;
  gender?: Gender | 'all';
}

export interface InsuranceProduct {
  _id: string;
  categoryId: string | InsuranceCategory;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  premium: number;
  coverageAmount: number;
  termYears: number;
  features: string[];
  eligibilityRules: EligibilityRules;
}

export type QuoteStatus = 'draft' | 'generated' | 'shared' | 'accepted' | 'paid';

export interface Quote {
  _id: string;
  customerId: string | Customer;
  productId: string | InsuranceProduct;
  agentId: string | Agent;
  generatedPdfUrl: string;
  premium: number;
  coverageAmount: number;
  status: QuoteStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  _id: string;
  customerId: string | Customer;
  quoteId: string | Quote;
  agentId?: string | Agent;
  stripePaymentLink: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface PolicyActivation {
  _id: string;
  policyNumber: string;
  customerId: string | Customer;
  quoteId: string | Quote;
  productId: string | InsuranceProduct;
  paymentId: string | Payment;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  certificatePdfUrl?: string;
}

export interface DashboardStats {
  metrics: {
    totalCustomers: number;
    totalQuotes: number;
    totalPayments: number;
    totalActivePolicies: number;
    totalRevenue: number;
  };
  categories: InsuranceCategory[];
  recentQuotes: Quote[];
  recentPayments: Payment[];
}

