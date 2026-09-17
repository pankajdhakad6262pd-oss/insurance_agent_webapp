import { productRepository, ProductRepository } from '../repositories/productRepository';
import { customerRepository, CustomerRepository } from '../repositories/customerRepository';
import { eligibilityService, EligibilityService } from './eligibilityService';
import { IInsuranceProduct, IInsuranceCategory, ICustomer } from '../types';
import { AppError } from '../middleware/errorMiddleware';

export class ProductService {
  constructor(
    private productRepo: ProductRepository = productRepository,
    private customerRepo: CustomerRepository = customerRepository,
    private eligibilitySvc: EligibilityService = eligibilityService
  ) {}

  async getAllCategories(): Promise<IInsuranceCategory[]> {
    return this.productRepo.findAllCategories();
  }

  async getAllProducts(categoryId?: string): Promise<IInsuranceProduct[]> {
    const query: Record<string, any> = {};
    if (categoryId) {
      query.categoryId = categoryId;
    }
    return this.productRepo.findAll(query);
  }

  async getProductById(id: string): Promise<IInsuranceProduct> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new AppError('Insurance product not found', 404);
    }
    return product;
  }

  async getEligibleProductsForCustomer(customerId: string): Promise<{
    customer: ICustomer;
    eligibleProducts: IInsuranceProduct[];
    ineligibleProducts: { product: IInsuranceProduct; reasons: string[] }[];
    totalEligible: number;
  }> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const allProducts = await this.productRepo.findAll();
    const evaluation = this.eligibilitySvc.evaluateAll(customer, allProducts);

    return {
      customer,
      eligibleProducts: evaluation.eligible,
      ineligibleProducts: evaluation.ineligible,
      totalEligible: evaluation.eligible.length,
    };
  }
}

export const productService = new ProductService();

