import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customerService';

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    age: z.coerce.number().min(1, 'Age must be positive').max(120, 'Age must be realistic'),
    gender: z.enum(['male', 'female', 'other']),
    occupation: z.string().min(1, 'Occupation is required'),
    annualIncome: z.coerce.number().min(0, 'Income cannot be negative'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    vehicleType: z.enum(['two-wheeler', 'car', 'commercial', 'none']).optional().default('none'),
  }),
});

export class CustomerController {
  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentId = req.user!.id;
      const customer = await customerService.createCustomer(req.body, agentId);
      res.status(201).json({
        success: true,
        message: 'Customer profile created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentId = req.user!.id;
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const skip = (page - 1) * limit;

      const { items, total } = await customerService.listCustomers(agentId, search, skip, limit);
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
}

export const customerController = new CustomerController();

