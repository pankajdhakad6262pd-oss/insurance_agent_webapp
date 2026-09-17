import { Request, Response, NextFunction } from 'express';
import { Customer } from '../models/Customer';
import { Quote } from '../models/Quote';
import { Payment } from '../models/Payment';
import { InsuranceCategory } from '../models/InsuranceCategory';
import { InsuranceProduct } from '../models/InsuranceProduct';
import { PolicyActivation } from '../models/PolicyActivation';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const agentId = req.user!.id;

      const [
        totalCustomers,
        totalQuotes,
        totalPayments,
        totalActivePolicies,
        categories,
        products,
        recentQuotes,
        recentPayments,
      ] = await Promise.all([
        Customer.countDocuments({ createdByAgent: agentId }),
        Quote.countDocuments({ agentId }),
        Payment.countDocuments(),
        PolicyActivation.countDocuments({ status: 'active' }),
        InsuranceCategory.find().lean(),
        InsuranceProduct.find().lean(),
        Quote.find({ agentId })
          .populate('customerId', 'firstName lastName email')
          .populate('productId', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Payment.find()
          .populate('customerId', 'firstName lastName')
          .populate({ path: 'quoteId', populate: { path: 'productId', select: 'name' } })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      // Category breakdown with product counts
      const categoryBreakdown = categories.map((cat) => {
        const productCount = products.filter(
          (p) => p.categoryId.toString() === cat._id.toString()
        ).length;
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          productCount,
        };
      });

      // Calculate total completed revenue
      const completedPayments = await Payment.find({ paymentStatus: 'completed' }).select('amount');
      const totalRevenue = completedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalCustomers,
            totalQuotes,
            totalPayments,
            totalActivePolicies,
            totalRevenue,
          },
          categories: categoryBreakdown,
          recentQuotes,
          recentPayments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

