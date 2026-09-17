import { Schema, model, Document, Types } from 'mongoose';
import { IInsuranceProduct } from '../types';

export interface InsuranceProductDocument extends Omit<IInsuranceProduct, '_id'>, Document {}

const EligibilityRulesSchema = new Schema(
  {
    minAge: { type: Number },
    maxAge: { type: Number },
    requiresVehicle: { type: Boolean, default: false },
    allowedVehicleTypes: [{ type: String }],
    minIncome: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'other', 'all'], default: 'all' },
  },
  { _id: false }
);

const InsuranceProductSchema = new Schema<InsuranceProductDocument>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceCategory',
      required: [true, 'Category ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    minAge: {
      type: Number,
      required: [true, 'Minimum age is required'],
      default: 18,
    },
    maxAge: {
      type: Number,
      required: [true, 'Maximum age is required'],
    },
    premium: {
      type: Number,
      required: [true, 'Premium is required'],
      min: [0, 'Premium cannot be negative'],
    },
    coverageAmount: {
      type: Number,
      required: [true, 'Coverage amount is required'],
      min: [0, 'Coverage amount cannot be negative'],
    },
    termYears: {
      type: Number,
      default: 1,
    },
    eligibilityRules: {
      type: EligibilityRulesSchema,
      default: () => ({}),
    },
    features: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const InsuranceProduct = model<InsuranceProductDocument>('InsuranceProduct', InsuranceProductSchema);

