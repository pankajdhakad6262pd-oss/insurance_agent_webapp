import { customerRepository, CustomerRepository } from '../repositories/customerRepository';
import { ICustomer } from '../types';
import { AppError } from '../middleware/errorMiddleware';

export class CustomerService {
  constructor(private customerRepo: CustomerRepository = customerRepository) {}

  async createCustomer(data: Partial<ICustomer>, agentId: string): Promise<ICustomer> {
    if (data.email) {
      const cleanEmail = data.email.toLowerCase().trim();
      const existing = await this.customerRepo.findByEmail(cleanEmail);
      if (existing) {
        throw new AppError(`A customer with email '${cleanEmail}' already exists. Please use a unique email address.`, 409);
      }
      data.email = cleanEmail;
    }

    const customer = await this.customerRepo.create({
      ...data,
      createdByAgent: agentId,
    });
    return customer;
  }

  async getCustomerById(id: string): Promise<ICustomer> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  async listCustomers(agentId: string, search?: string, skip = 0, limit = 50): Promise<{ items: ICustomer[]; total: number }> {
    const query: Record<string, any> = { createdByAgent: agentId };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { mobile: regex },
        { city: regex },
      ];
    }

    return this.customerRepo.findAll(query, skip, limit);
  }

  async countAgentCustomers(agentId: string): Promise<number> {
    return this.customerRepo.count({ createdByAgent: agentId });
  }
}

export const customerService = new CustomerService();

