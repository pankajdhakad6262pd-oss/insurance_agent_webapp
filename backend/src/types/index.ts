import { Types } from 'mongoose';

export type UserRole = 'agent' | 'admin';

export interface IAgent {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type Gender = 'male' | 'female' | 'other';
export type VehicleType = 'two-wheeler' | 'car' | 'commercial' | 'none';

export interface ICustomer {
  _id: Types.ObjectId | string;
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
  createdByAgent: Types.ObjectId | string | IAgent;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInsuranceCategory {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEligibilityRules {
  minAge?: number;
  maxAge?: number;
  requiresVehicle?: boolean;
  allowedVehicleTypes?: string[];
  minIncome?: number;
  gender?: Gender | 'all';
}

export interface IInsuranceProduct {
  _id: Types.ObjectId | string;
  categoryId: Types.ObjectId | string | IInsuranceCategory;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  premium: number;
  coverageAmount: number;
  termYears: number;
  eligibilityRules: IEligibilityRules;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = 'draft' | 'generated' | 'shared' | 'accepted' | 'paid';

export interface IQuote {
  _id: Types.ObjectId | string;
  customerId: Types.ObjectId | string | ICustomer;
  productId: Types.ObjectId | string | IInsuranceProduct;
  agentId: Types.ObjectId | string | IAgent;
  generatedPdfUrl: string;
  premium: number;
  coverageAmount: number;
  status: QuoteStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IPayment {
  _id: Types.ObjectId | string;
  customerId: Types.ObjectId | string | ICustomer;
  quoteId: Types.ObjectId | string | IQuote;
  agentId?: Types.ObjectId | string | IAgent;
  stripePaymentLink: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PolicyStatus = 'active' | 'expired' | 'cancelled';

export interface IPolicyActivation {
  _id: Types.ObjectId | string;
  policyNumber: string;
  customerId: Types.ObjectId | string | ICustomer;
  quoteId: Types.ObjectId | string | IQuote;
  productId: Types.ObjectId | string | IInsuranceProduct;
  paymentId: Types.ObjectId | string | IPayment;
  startDate: Date;
  endDate: Date;
  status: PolicyStatus;
  certificatePdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface EligibilityResult {
  product: IInsuranceProduct;
  isEligible: boolean;
  reasons: string[];
}

