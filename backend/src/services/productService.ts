import { productRepository, ProductRepository } from '../repositories/productRepository';
import { customerRepository, CustomerRepository } from '../repositories/customerRepository';
import { eligibilityService, EligibilityService } from './eligibilityService';
import { IInsuranceProduct, IInsuranceCategory, ICustomer } from '../types';
import { AppError } from '../middleware/errorMiddleware';
import { PolicyActivation } from '../models/PolicyActivation';
import { Payment } from '../models/Payment';

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
    purchasedPolicies: any[];
    eligibleProducts: IInsuranceProduct[];
    ineligibleProducts: { product: IInsuranceProduct; reasons: string[] }[];
    totalEligible: number;
    totalPurchased: number;
  }> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const purchasedPolicies = await PolicyActivation.find({
      customerId,
      status: 'active',
    })
      .populate({
        path: 'productId',
        populate: { path: 'categoryId', select: 'name slug icon' },
      })
      .populate({
        path: 'quoteId',
        populate: { path: 'productId' },
      })
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .lean();

    const purchasedProductIds = new Set<string>();
    for (const policy of purchasedPolicies) {
      if (policy.productId) {
        purchasedProductIds.add(String((policy.productId as any)._id || policy.productId));
      }
      if (policy.quoteId && (policy.quoteId as any).productId) {
        purchasedProductIds.add(String((policy.quoteId as any).productId._id || (policy.quoteId as any).productId));
      }
    }

    const completedPayments = await Payment.find({
      customerId,
      paymentStatus: 'completed',
    })
      .populate('quoteId')
      .lean();

    for (const payment of completedPayments) {
      const quote = (payment as any).quoteId;
      if (quote && quote.productId) {
        purchasedProductIds.add(String(quote.productId._id || quote.productId));
      }
    }

    const allProducts = await this.productRepo.findAll();
    const evaluation = this.eligibilitySvc.evaluateAll(customer, allProducts);

    // Exclude already purchased products from eligible products
    const filteredEligible = evaluation.eligible.filter(
      (p) => !purchasedProductIds.has(String(p._id))
    );

    return {
      customer,
      purchasedPolicies,
      eligibleProducts: filteredEligible,
      ineligibleProducts: evaluation.ineligible,
      totalEligible: filteredEligible.length,
      totalPurchased: purchasedPolicies.length,
    };
  }
}

export const productService = new ProductService();
