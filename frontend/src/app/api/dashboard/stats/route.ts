import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { Customer, Quote, Payment, PolicyActivation, InsuranceCategory, InsuranceProduct } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

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
      Customer.countDocuments({ createdByAgent: user.id }),
      Quote.countDocuments({ agentId: user.id }),
      Payment.countDocuments(),
      PolicyActivation.countDocuments({ status: 'active' }),
      InsuranceCategory.find().lean(),
      InsuranceProduct.find().lean(),
      Quote.find({ agentId: user.id })
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

    const completed = await Payment.find({ paymentStatus: 'completed' }).select('amount');
    const totalRevenue = completed.reduce((acc, c) => acc + (c.amount || 0), 0);

    const categoryBreakdown = categories.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      productCount: products.filter((p: any) => p.categoryId.toString() === cat._id.toString()).length,
    }));

    return NextResponse.json({
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
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

