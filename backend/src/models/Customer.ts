import { Schema, model, Document, Types } from 'mongoose';
import { ICustomer } from '../types';

export interface CustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const CustomerSchema = new Schema<CustomerDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be positive'],
      max: [120, 'Age must be realistic'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    occupation: {
      type: String,
      required: [true, 'Occupation is required'],
      trim: true,
    },
    annualIncome: {
      type: Number,
      required: [true, 'Annual income is required'],
      min: [0, 'Annual income cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['two-wheeler', 'car', 'commercial', 'none'],
      default: 'none',
    },
    createdByAgent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Created by agent is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for full name
CustomerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const Customer = model<CustomerDocument>('Customer', CustomerSchema);

