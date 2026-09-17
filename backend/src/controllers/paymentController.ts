import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentService } from '../services/paymentService';

export const createPaymentLinkSchema = z.object({
  body: z.object({
    quoteId: z.string().min(1, 'Quote ID is required'),
    customerId: z.string().optional(),
  }),
});

export class PaymentController {
  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quoteId, customerId } = req.body;
      const result = await paymentService.createPaymentLink(quoteId, customerId);

      res.status(201).json({
        success: true,
        message: 'Payment link generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await paymentService.handleWebhook(req.body, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const skip = (page - 1) * limit;

      const { items, total } = await paymentService.listPayments(skip, limit);
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

  async getDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.getPaymentDetails(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async simulateSuccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await paymentService.activatePolicyAndNotify(id);
      res.status(200).json({
        success: true,
        message: 'Payment simulated successfully. Policy has been activated and confirmation email dispatched!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();

