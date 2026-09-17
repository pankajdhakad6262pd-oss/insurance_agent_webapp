import { Schema, model, Document, Types } from 'mongoose';
import { IPolicyActivation } from '../types';

export interface PolicyActivationDocument extends Omit<IPolicyActivation, '_id'>, Document {}

const PolicyActivationSchema = new Schema<PolicyActivationDocument>(
  {
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      unique: true,
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
      required: [true, 'Quote ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceProduct',
      required: [true, 'Product ID is required'],
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment ID is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    certificatePdfUrl: {
      type: String,
    },
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

export const PolicyActivation = model<PolicyActivationDocument>('PolicyActivation', PolicyActivationSchema);

