import { InsuranceProduct, InsuranceProductDocument } from '../models/InsuranceProduct';
import { InsuranceCategory, InsuranceCategoryDocument } from '../models/InsuranceCategory';
import { IInsuranceProduct } from '../types';

export class ProductRepository {
  async findAll(query: Record<string, any> = {}): Promise<InsuranceProductDocument[]> {
    return InsuranceProduct.find(query)
      .populate('categoryId', 'name slug description icon')
      .sort({ premium: 1 })
      .exec();
  }

  async findById(id: string): Promise<InsuranceProductDocument | null> {
    return InsuranceProduct.findById(id)
      .populate('categoryId', 'name slug description icon')
      .exec();
  }

  async findAllCategories(): Promise<InsuranceCategoryDocument[]> {
    return InsuranceCategory.find().sort({ name: 1 }).exec();
  }

  async findCategoryById(id: string): Promise<InsuranceCategoryDocument | null> {
    return InsuranceCategory.findById(id).exec();
  }

  async findCategoryBySlug(slug: string): Promise<InsuranceCategoryDocument | null> {
    return InsuranceCategory.findOne({ slug }).exec();
  }

  async count(): Promise<number> {
    return InsuranceProduct.countDocuments().exec();
  }
}

export const productRepository = new ProductRepository();

