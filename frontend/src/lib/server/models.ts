import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Agent Model
const AgentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['agent', 'admin'], default: 'agent' },
  },
  { timestamps: true }
);

AgentSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AgentSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const Agent = models.Agent || model('Agent', AgentSchema);

// 2. Customer Model
const CustomerSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    occupation: { type: String, required: true, trim: true },
    annualIncome: { type: Number, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ['two-wheeler', 'car', 'commercial', 'none'], default: 'none' },
    createdByAgent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  },
  { timestamps: true }
);

export const Customer = models.Customer || model('Customer', CustomerSchema);

// 3. Category Model
const InsuranceCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: 'Shield' },
  },
  { timestamps: true }
);

export const InsuranceCategory = models.InsuranceCategory || model('InsuranceCategory', InsuranceCategorySchema);

// 4. Product Model
const InsuranceProductSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'InsuranceCategory', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    minAge: { type: Number, required: true },
    maxAge: { type: Number, required: true },
    premium: { type: Number, required: true },
    coverageAmount: { type: Number, required: true },
    termYears: { type: Number, required: true },
    eligibilityRules: {
      minAge: { type: Number },
      maxAge: { type: Number },
      minIncome: { type: Number },
      requiresVehicle: { type: Boolean, default: false },
      allowedVehicleTypes: [{ type: String }],
      gender: { type: String, enum: ['male', 'female', 'other', 'all'], default: 'all' },
    },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export const InsuranceProduct = models.InsuranceProduct || model('InsuranceProduct', InsuranceProductSchema);

// 5. Quote Model
const QuoteSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'InsuranceProduct', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    generatedPdfUrl: { type: String, required: true },
    premium: { type: Number, required: true },
    coverageAmount: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'generated', 'shared', 'accepted', 'paid'], default: 'generated' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Quote = models.Quote || model('Quote', QuoteSchema);

// 6. Payment Model
const PaymentSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    quoteId: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    stripePaymentLink: { type: String, required: true },
    stripeSessionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model('Payment', PaymentSchema);

// 7. PolicyActivation Model
const PolicyActivationSchema = new Schema(
  {
    policyNumber: { type: String, required: true, unique: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    quoteId: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'InsuranceProduct', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    certificatePdfUrl: { type: String },
  },
  { timestamps: true }
);

export const PolicyActivation = models.PolicyActivation || model('PolicyActivation', PolicyActivationSchema);
