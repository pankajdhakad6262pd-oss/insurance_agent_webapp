import { Schema, model, Document } from 'mongoose';
import { IInsuranceCategory } from '../types';

export interface InsuranceCategoryDocument extends Omit<IInsuranceCategory, '_id'>, Document {}

const InsuranceCategorySchema = new Schema<InsuranceCategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Shield',
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

export const InsuranceCategory = model<InsuranceCategoryDocument>('InsuranceCategory', InsuranceCategorySchema);

