import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quoteService } from '../services/quoteService';

export const generateQuoteSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer ID is required'),
    productId: z.string().min(1, 'Product ID is required'),
    notes: z.string().optional(),
  }),
});

export class QuoteController {
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentId = req.user!.id;
      const { customerId, productId, notes } = req.body;

      const result = await quoteService.generateQuote({
        customerId,
        productId,
        agentId,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Personalized quotation PDF generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentId = req.user!.id;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const skip = (page - 1) * limit;

      const { items, total } = await quoteService.listQuotes(agentId, skip, limit);
      res.status(200).json({
        success: true,
        data: {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await quoteService.getQuoteById(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const quoteController = new QuoteController();

