import { Payment, PaymentDocument } from '../models/Payment';
import { PolicyActivation, PolicyActivationDocument } from '../models/PolicyActivation';
import { IPayment, IPolicyActivation } from '../types';

export class PaymentRepository {
  async create(data: Partial<IPayment>): Promise<PaymentDocument> {
    const payment = new Payment(data);
    return payment.save();
  }

  async findById(id: string): Promise<PaymentDocument | null> {
    return Payment.findById(id)
      .populate('customerId')
      .populate({
        path: 'quoteId',
        populate: { path: 'productId' },
      })
      .exec();
  }

  async findBySessionId(sessionId: string): Promise<PaymentDocument | null> {
    return Payment.findOne({ stripeSessionId: sessionId }).exec();
  }

  async findAll(query: Record<string, any> = {}, skip = 0, limit = 50): Promise<{ items: PaymentDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Payment.find(query)
        .populate('agentId', 'name email mobile licenseNumber role')
        .populate('customerId', 'firstName lastName email mobile')
        .populate({
          path: 'quoteId',
          populate: [
            { path: 'productId', select: 'name' },
            { path: 'agentId', select: 'name email mobile licenseNumber role' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Payment.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async updateStatus(id: string, status: string, paidAt?: Date): Promise<PaymentDocument | null> {
    return Payment.findByIdAndUpdate(
      id,
      { paymentStatus: status, ...(paidAt && { paidAt }) },
      { new: true }
    ).exec();
  }

  async createPolicyActivation(data: Partial<IPolicyActivation>): Promise<PolicyActivationDocument> {
    const policy = new PolicyActivation(data);
    return policy.save();
  }

  async findPolicyByPaymentId(paymentId: string): Promise<PolicyActivationDocument | null> {
    return PolicyActivation.findOne({ paymentId })
      .populate('customerId')
      .populate('productId')
      .populate('quoteId')
      .exec();
  }

  async count(query: Record<string, any> = {}): Promise<number> {
    return Payment.countDocuments(query).exec();
  }

  async countActivePolicies(): Promise<number> {
    return PolicyActivation.countDocuments({ status: 'active' }).exec();
  }
}

export const paymentRepository = new PaymentRepository();

