import { Customer, CustomerDocument } from '../models/Customer';
import { ICustomer } from '../types';

export class CustomerRepository {
  async create(data: Partial<ICustomer>): Promise<CustomerDocument> {
    const customer = new Customer(data);
    return customer.save();
  }

  async findById(id: string): Promise<CustomerDocument | null> {
    return Customer.findById(id).populate('createdByAgent', 'name email').exec();
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return Customer.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findAll(query: Record<string, any> = {}, skip = 0, limit = 50): Promise<{ items: CustomerDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Customer.find(query)
        .populate('createdByAgent', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Customer.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    return Customer.countDocuments(query).exec();
  }
}

export const customerRepository = new CustomerRepository();

