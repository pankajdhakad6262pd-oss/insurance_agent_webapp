import { Schema, model, Document, Types } from 'mongoose';
import { IQuote } from '../types';

export interface QuoteDocument extends Omit<IQuote, '_id'>, Document {}

const QuoteSchema = new Schema<QuoteDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceProduct',
      required: [true, 'Product ID is required'],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Agent ID is required'],
    },
    generatedPdfUrl: {
      type: String,
      required: [true, 'Generated PDF URL is required'],
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
    status: {
      type: String,
      enum: ['draft', 'generated', 'shared', 'accepted', 'paid'],
      default: 'generated',
    },
    notes: {
      type: String,
      trim: true,
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

export const Quote = model<QuoteDocument>('Quote', QuoteSchema);

