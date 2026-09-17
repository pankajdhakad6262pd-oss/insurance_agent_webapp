import { Quote, QuoteDocument } from '../models/Quote';
import { IQuote } from '../types';

export class QuoteRepository {
  async create(data: Partial<IQuote>): Promise<QuoteDocument> {
    const quote = new Quote(data);
    return quote.save();
  }

  async findById(id: string): Promise<QuoteDocument | null> {
    return Quote.findById(id)
      .populate('customerId')
      .populate({
        path: 'productId',
        populate: { path: 'categoryId' },
      })
      .populate('agentId', 'name email mobile')
      .exec();
  }

  async findAll(query: Record<string, any> = {}, skip = 0, limit = 50): Promise<{ items: QuoteDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Quote.find(query)
        .populate('customerId', 'firstName lastName email mobile')
        .populate({
          path: 'productId',
          populate: { path: 'categoryId', select: 'name slug' },
        })
        .populate('agentId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Quote.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async updateStatus(id: string, status: string): Promise<QuoteDocument | null> {
    return Quote.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    return Quote.countDocuments(query).exec();
  }
}

export const quoteRepository = new QuoteRepository();

