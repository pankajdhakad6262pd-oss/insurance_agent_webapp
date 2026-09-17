import { Schema, model, Document, Types } from 'mongoose';
import { IPayment } from '../types';

export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<PaymentDocument>(
  {
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
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
    },
    stripePaymentLink: {
      type: String,
      required: [true, 'Stripe payment link is required'],
    },
    stripeSessionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
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

export const Payment = model<PaymentDocument>('Payment', PaymentSchema);

