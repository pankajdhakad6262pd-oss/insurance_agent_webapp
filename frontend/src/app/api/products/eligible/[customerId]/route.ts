import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/server/db';
import { Customer, InsuranceProduct } from '../../../../../lib/server/models';
import { verifyAuth } from '../../../../../lib/server/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { customerId } = await params;
    await connectToDatabase();

    const customer = await Customer.findById(customerId).lean();
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    const products = await InsuranceProduct.find().populate('categoryId', 'name slug description icon').lean();

    const eligibleProducts: any[] = [];
    const ineligibleProducts: any[] = [];

    for (const product of products) {
      const catName = product.categoryId?.name?.toLowerCase() || '';
      const age = customer.age;
      const rules = product.eligibilityRules || {};
      const reasons: string[] = [];
      let eligible = true;

      // Category rules
      if (catName.includes('term')) {
        if (age < 18 || age > 60) {
          eligible = false;
          reasons.push(`Term Insurance requires age 18-60 (Customer is ${age}).`);
        }
      } else if (catName.includes('health')) {
        if (age < 18 || age > 70) {
          eligible = false;
          reasons.push(`Health Insurance requires age 18-70 (Customer is ${age}).`);
        }
      } else if (catName.includes('vehicle')) {
        if (!customer.vehicleType || customer.vehicleType === 'none') {
          eligible = false;
          reasons.push('Vehicle Insurance requires the customer to have a registered vehicle.');
        } else if (rules.allowedVehicleTypes?.length && !rules.allowedVehicleTypes.includes(customer.vehicleType)) {
          eligible = false;
          reasons.push(`Plan requires [${rules.allowedVehicleTypes.join(', ')}], customer has '${customer.vehicleType}'.`);
        }
      } else if (catName.includes('travel')) {
        if (age < 18 || age > 80) {
          eligible = false;
          reasons.push(`Travel Insurance requires age 18-80 (Customer is ${age}).`);
        }
      } else if (catName.includes('life')) {
        if (age < 18 || age > 65) {
          eligible = false;
          reasons.push(`Life Insurance requires age 18-65 (Customer is ${age}).`);
        }
      }

      // Min/Max age
      const minAge = rules.minAge ?? product.minAge ?? 18;
      const maxAge = rules.maxAge ?? product.maxAge ?? 100;
      if (age < minAge || age > maxAge) {
        eligible = false;
        reasons.push(`Product age limits: ${minAge} to ${maxAge}.`);
      }

      // Min income
      if (rules.minIncome && customer.annualIncome < rules.minIncome) {
        eligible = false;
        reasons.push(`Minimum annual income required: $${rules.minIncome.toLocaleString()}.`);
      }

      if (eligible) {
        eligibleProducts.push(product);
      } else {
        ineligibleProducts.push({ product, reasons });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        customer,
        eligibleProducts,
        ineligibleProducts,
        totalEligible: eligibleProducts.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

