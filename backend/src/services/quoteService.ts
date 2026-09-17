import { quoteRepository, QuoteRepository } from '../repositories/quoteRepository';
import { customerRepository, CustomerRepository } from '../repositories/customerRepository';
import { productRepository, ProductRepository } from '../repositories/productRepository';
import { agentRepository, AgentRepository } from '../repositories/agentRepository';
import { pdfService, PdfService } from './pdfService';
import { storageService, StorageService } from './storageService';
import { eligibilityService, EligibilityService } from './eligibilityService';
import { generateWhatsAppQuoteLink } from '../utils/whatsapp';
import { IQuote } from '../types';
import { AppError } from '../middleware/errorMiddleware';

export class QuoteService {
  constructor(
    private quoteRepo: QuoteRepository = quoteRepository,
    private customerRepo: CustomerRepository = customerRepository,
    private productRepo: ProductRepository = productRepository,
    private agentRepo: AgentRepository = agentRepository,
    private pdfSvc: PdfService = pdfService,
    private storageSvc: StorageService = storageService,
    private eligibilitySvc: EligibilityService = eligibilityService
  ) {}

  async generateQuote(data: {
    customerId: string;
    productId: string;
    agentId: string;
    notes?: string;
  }): Promise<{ quote: IQuote; whatsAppShareUrl: string }> {
    const [customer, product, agent] = await Promise.all([
      this.customerRepo.findById(data.customerId),
      this.productRepo.findById(data.productId),
      this.agentRepo.findById(data.agentId),
    ]);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    if (!product) {
      throw new AppError('Insurance product not found', 404);
    }
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Evaluate eligibility
    const eligibility = this.eligibilitySvc.evaluate(customer, product);
    if (!eligibility.isEligible) {
      throw new AppError(
        `Customer is ineligible for this product: ${eligibility.reasons.join('; ')}`,
        400
      );
    }

    const premium = product.premium;
    const coverageAmount = product.coverageAmount;
    const quoteRef = `quote_${customer._id}_${Date.now()}`;

    // 1. Generate PDF
    const pdfBuffer = await this.pdfSvc.generateQuotationPdf({
      customer,
      product,
      agent,
      quoteId: quoteRef,
      calculatedPremium: premium,
    });

    // 2. Upload PDF
    const filename = `${quoteRef}.pdf`;
    const generatedPdfUrl = await this.storageSvc.uploadPdfBuffer(pdfBuffer, filename);

    // 3. Save Quote Record
    const quote = await this.quoteRepo.create({
      customerId: customer._id,
      productId: product._id,
      agentId: agent._id,
      generatedPdfUrl,
      premium,
      coverageAmount,
      status: 'generated',
      notes: data.notes,
    });

    // 4. Generate WhatsApp Share Link
    const whatsAppShareUrl = generateWhatsAppQuoteLink(
      customer.mobile,
      `${customer.firstName} ${customer.lastName}`,
      product.name,
      generatedPdfUrl,
      premium
    );

    return {
      quote,
      whatsAppShareUrl,
    };
  }

  async listQuotes(agentId: string, skip = 0, limit = 50): Promise<{ items: IQuote[]; total: number }> {
    return this.quoteRepo.findAll({ agentId }, skip, limit);
  }

  async getQuoteById(id: string): Promise<{ quote: IQuote; whatsAppShareUrl: string }> {
    const quote = await this.quoteRepo.findById(id);
    if (!quote) {
      throw new AppError('Quote not found', 404);
    }

    const customer = quote.customerId as any;
    const product = quote.productId as any;

    const whatsAppShareUrl = generateWhatsAppQuoteLink(
      customer?.mobile || '',
      customer ? `${customer.firstName} ${customer.lastName}` : 'Valued Customer',
      product?.name || 'Selected Insurance Plan',
      quote.generatedPdfUrl,
      quote.premium
    );

    return {
      quote,
      whatsAppShareUrl,
    };
  }
}

export const quoteService = new QuoteService();

