import mongoose from 'mongoose';
import { config } from '../config/env';
import { Agent } from '../models/Agent';
import { Customer } from '../models/Customer';
import { InsuranceCategory } from '../models/InsuranceCategory';
import { InsuranceProduct } from '../models/InsuranceProduct';
import { Quote } from '../models/Quote';
import { Payment } from '../models/Payment';
import { PolicyActivation } from '../models/PolicyActivation';

export async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB:', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log('[Seed] Connected. Clearing existing collections...');

    await Promise.all([
      Agent.deleteMany({}),
      Customer.deleteMany({}),
      InsuranceCategory.deleteMany({}),
      InsuranceProduct.deleteMany({}),
      Quote.deleteMany({}),
      Payment.deleteMany({}),
      PolicyActivation.deleteMany({}),
    ]);

    // 1. Create 1 Admin and 1 Agent
    console.log('[Seed] Creating Admin and Agent...');
    const admin = await Agent.create({
      name: 'System Administrator',
      email: 'admin@test.com',
      mobile: '+1 (555) 100-2000',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const agent = await Agent.create({
      name: 'David Miller',
      email: 'agent@test.com',
      mobile: '+1 (555) 234-5678',
      password: 'Password123!',
      role: 'agent',
    });

    // 2. Create 5 Categories
    console.log('[Seed] Creating 5 Insurance Categories...');
    const categoriesData = [
      {
        name: 'Term Insurance',
        slug: 'term-insurance',
        description: 'Pure life protection ensuring maximum financial security for your family against unforeseen events.',
        icon: 'Shield',
      },
      {
        name: 'Health Insurance',
        slug: 'health-insurance',
        description: 'Comprehensive medical coverage covering hospitalization, pre/post care, critical illness, and wellness.',
        icon: 'HeartPulse',
      },
      {
        name: 'Vehicle Insurance',
        slug: 'vehicle-insurance',
        description: 'Complete bumper-to-bumper protection for cars, bikes, and commercial fleets with zero depreciation.',
        icon: 'Car',
      },
      {
        name: 'Travel Insurance',
        slug: 'travel-insurance',
        description: 'Worldwide coverage for trip delays, baggage loss, emergency medical evacuations, and cancellations.',
        icon: 'Plane',
      },
      {
        name: 'Life Insurance',
        slug: 'life-insurance',
        description: 'Endowment and whole-life policies designed for disciplined wealth generation and family legacy planning.',
        icon: 'Umbrella',
      },
    ];

    const categories = await InsuranceCategory.insertMany(categoriesData);
    const catMap = new Map(categories.map((c) => [c.slug, c._id]));

    // 3. Create 15 Products (3 per category)
    console.log('[Seed] Creating 15 Insurance Products...');
    const productsData = [
      // Term Insurance (Category 1) - Age 18-60
      {
        categoryId: catMap.get('term-insurance'),
        name: 'PureShield Term 100',
        description: 'Comprehensive pure life protection with high sum assured and accidental death accelerated benefit.',
        minAge: 18,
        maxAge: 60,
        premium: 180, // ~$180 USD/yr (approx ₹15,000 INR/yr)
        coverageAmount: 150000, // $150,000 USD (approx ₹1.25 Crore)
        termYears: 30,
        features: ['100% Tax Benefits (80C / 10(10D))', 'Accidental Death Rider Included', 'Terminal Illness Accelerated Payout'],
        eligibilityRules: { minAge: 18, maxAge: 60, minIncome: 25000 },
      },
      {
        categoryId: catMap.get('term-insurance'),
        name: 'Elite Income Term Protector',
        description: 'Designed for established professionals providing guaranteed monthly income replacement for family stability.',
        minAge: 25,
        maxAge: 55,
        premium: 260, // ~$260 USD/yr (approx ₹21,500 INR/yr)
        coverageAmount: 250000, // $250,000 USD (approx ₹2.0 Crore)
        termYears: 25,
        features: ['Staggered Monthly Income Payout', 'Waiver of Premium on Critical Illness', 'Inflation Adjusted Cover'],
        eligibilityRules: { minAge: 25, maxAge: 55, minIncome: 50000 },
      },
      {
        categoryId: catMap.get('term-insurance'),
        name: 'Young Professional Term Saver',
        description: 'Budget-friendly term plan for early career starters locking in low guaranteed lifetime premiums.',
        minAge: 18,
        maxAge: 40,
        premium: 120, // ~$120 USD/yr (approx ₹10,000 INR/yr)
        coverageAmount: 100000, // $100,000 USD (approx ₹80 Lakh)
        termYears: 20,
        features: ['Guaranteed Level Premiums', 'No Medical Examination Required Under 35', 'Option to Convert into Whole Life'],
        eligibilityRules: { minAge: 18, maxAge: 40, minIncome: 15000 },
      },

      // Health Insurance (Category 2) - Age 18-70, $180-$240 USD/yr matching ₹15k-20k INR benchmark
      {
        categoryId: catMap.get('health-insurance'),
        name: 'MediGuard Comprehensive Health',
        description: 'Individual hospitalization cover with zero room rent cap, diagnostic coverage, and preventive health checkups.',
        minAge: 18,
        maxAge: 70,
        premium: 180, // Exact Indian benchmark: ₹15,000 INR/yr -> ~$180 USD/yr
        coverageAmount: 30000, // $30,000 USD (approx ₹25 Lakh cover)
        termYears: 1,
        features: ['Cashless Treatment in 10,000+ Network Hospitals', 'Zero Co-Payment & No Room Rent Cap', 'Free Annual Preventative Health Checkup'],
        eligibilityRules: { minAge: 18, maxAge: 70, minIncome: 20000 },
      },
      {
        categoryId: catMap.get('health-insurance'),
        name: 'Family Floater Super Shield',
        description: 'Single floater plan covering self, spouse, and dependent children with automatic restoration of sum assured.',
        minAge: 21,
        maxAge: 65,
        premium: 240, // Exact Indian benchmark: ₹20,000 INR/yr -> ~$240 USD/yr
        coverageAmount: 60000, // $60,000 USD (approx ₹50 Lakh cover)
        termYears: 1,
        features: ['Unlimited 100% Sum Assured Restoration', 'Comprehensive Maternity & Newborn Cover', 'Bariatric & Robotic Surgery Coverage'],
        eligibilityRules: { minAge: 21, maxAge: 65, minIncome: 30000 },
      },
      {
        categoryId: catMap.get('health-insurance'),
        name: 'Senior Vitality Health Care',
        description: 'Specialized health coverage for parents and seniors with pre-existing disease cover and in-home attendant care.',
        minAge: 50,
        maxAge: 75,
        premium: 290, // ~$290 USD/yr (approx ₹24,000 INR/yr)
        coverageAmount: 40000, // $40,000 USD (approx ₹33 Lakh cover)
        termYears: 1,
        features: ['Pre-existing Illness Coverage After 1 Year', 'AYUSH & In-Home Nursing Care Included', 'Critical Illness & Dialysis Support'],
        eligibilityRules: { minAge: 50, maxAge: 75, minIncome: 15000 },
      },

      // Vehicle Insurance (Category 3) - Requires vehicleType
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'AutoSecure Comprehensive Car Cover',
        description: 'All-inclusive 360-degree protection for personal four-wheelers with zero depreciation and roadside assistance.',
        minAge: 18,
        maxAge: 75,
        premium: 160, // ~$160 USD/yr (approx ₹13,200 INR/yr)
        coverageAmount: 15000, // $15,000 IDV (approx ₹12.5 Lakh vehicle value)
        termYears: 1,
        features: ['Zero Depreciation (Bumper to Bumper)', 'Engine & Gearbox Hydrostatic Lock Protection', '24x7 Pan-India Roadside Emergency Assistance'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['car'] },
      },
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'MotoRide Two-Wheeler Shield',
        description: 'Instant motorcycle and scooter policy with collision damage, third-party liability, and owner personal accident cover.',
        minAge: 18,
        maxAge: 70,
        premium: 35, // ~$35 USD/yr (approx ₹2,900 INR/yr)
        coverageAmount: 2000, // $2,000 IDV (approx ₹1.65 Lakh bike value)
        termYears: 1,
        features: ['Instant Digital Policy Issuance', 'Personal Accident Cover of $15,000', 'Loss of Helmet, Key & Consumables Protection'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['two-wheeler'] },
      },
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'FleetGuard Commercial Vehicle Cover',
        description: 'Engineered for commercial vans, pickups, and fleet trucks with cargo protection and legal liability coverage.',
        minAge: 21,
        maxAge: 70,
        premium: 280, // ~$280 USD/yr (approx ₹23,000 INR/yr)
        coverageAmount: 30000, // $30,000 IDV (approx ₹25 Lakh commercial vehicle value)
        termYears: 1,
        features: ['Driver & Cleaner Legal Liability Protection', 'Transit Cargo & Goods Damage Cover', 'Fleet Breakdown Towing & On-Site Assistance'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['commercial'] },
      },

      // Travel Insurance (Category 4) - Age 18-80
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Domestic Explorer Travel Plan',
        description: 'Affordable domestic journey protection covering flight delays, baggage losses, and unexpected medical expenses.',
        minAge: 18,
        maxAge: 80,
        premium: 30, // ~$30 USD/yr (approx ₹2,500 INR)
        coverageAmount: 15000, // $15,000 USD cover
        termYears: 1,
        features: ['Flight Delay & Missed Connection Compensation', 'Baggage Loss & Transit Theft Cover', 'Emergency Domestic Hospitalization'],
        eligibilityRules: { minAge: 18, maxAge: 80 },
      },
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Global Voyager International Cover',
        description: 'Worldwide travel coverage meeting 100% Schengen, USA, and UK visa requirements with emergency evacuation.',
        minAge: 18,
        maxAge: 80,
        premium: 75, // ~$75 USD/yr (approx ₹6,200 INR)
        coverageAmount: 50000, // $50,000 USD cover
        termYears: 1,
        features: ['Meets 100% Schengen, US & UK Visa Medical Reqs', 'Medical Evacuation & Repatriation Cover', 'Passport Loss Assistance & Trip Cancellation'],
        eligibilityRules: { minAge: 18, maxAge: 80 },
      },
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Student Abroad Travel Shield',
        description: 'Tailored for university students studying overseas, covering tuition continuation, health, and family visits.',
        minAge: 18,
        maxAge: 35,
        premium: 120, // ~$120 USD/yr (approx ₹10,000 INR)
        coverageAmount: 100000, // $100,000 USD cover
        termYears: 1,
        features: ['Tuition Fee Interruption Refund', 'Compassionate Visit Flight Cover for Family', 'Worldwide Inpatient & Outpatient Care'],
        eligibilityRules: { minAge: 18, maxAge: 35 },
      },

      // Life Insurance (Category 5) - Age 18-65
      {
        categoryId: catMap.get('life-insurance'),
        name: 'FutureGlow Guaranteed Life Return',
        description: 'Endowment life plan combining family financial security with guaranteed annual payouts and maturity bonus.',
        minAge: 18,
        maxAge: 60,
        premium: 360, // ~$360 USD/yr (approx ₹30,000 INR/yr)
        coverageAmount: 50000, // $50,000 USD (approx ₹41 Lakh cover)
        termYears: 20,
        features: ['Guaranteed Annual Cash Payouts', 'Tax-Free Maturity Lump Sum Benefit', 'Critical Illness & Disability Rider'],
        eligibilityRules: { minAge: 18, maxAge: 60, minIncome: 25000 },
      },
      {
        categoryId: catMap.get('life-insurance'),
        name: 'Child Career Life Builder',
        description: 'Dual-benefit policy funding higher education milestones while securing child future even in parent absence.',
        minAge: 21,
        maxAge: 50,
        premium: 280, // ~$280 USD/yr (approx ₹23,000 INR/yr)
        coverageAmount: 40000, // $40,000 USD (approx ₹33 Lakh cover)
        termYears: 18,
        features: ['Higher Education College Milestone Payouts', 'Waiver of Future Premiums on Parent Demise', 'Guaranteed Bonus & Compounding Additions'],
        eligibilityRules: { minAge: 21, maxAge: 50, minIncome: 25000 },
      },
      {
        categoryId: catMap.get('life-insurance'),
        name: 'Heritage Whole Life Assurance',
        description: 'Lifelong protection until age 100 with escalating surrender cash value, loan access, and estate inheritance planning.',
        minAge: 25,
        maxAge: 65,
        premium: 520, // ~$520 USD/yr (approx ₹43,000 INR/yr)
        coverageAmount: 80000, // $80,000 USD (approx ₹66 Lakh cover)
        termYears: 25,
        features: ['Lifelong Whole Life Protection up to Age 100', 'Cash Value Surrender & Low-Interest Loan Facility', 'Generational Legacy Wealth Transfer'],
        eligibilityRules: { minAge: 25, maxAge: 65, minIncome: 40000 },
      },
    ];

    const products = await InsuranceProduct.insertMany(productsData);

    // 4. Create 3 Customers
    console.log('[Seed] Creating 3 Diverse Customers...');
    const customersData = [
      { firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com', mobile: '+1 (555) 301-4411', age: 34, gender: 'male', occupation: 'Software Architect', annualIncome: 145000, city: 'San Francisco', state: 'CA', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Sophia', lastName: 'Martinez', email: 'sophia.m@example.com', mobile: '+1 (555) 302-5522', age: 29, gender: 'female', occupation: 'Product Designer', annualIncome: 98000, city: 'Austin', state: 'TX', vehicleType: 'two-wheeler', createdByAgent: agent._id },
      { firstName: 'Olivia', lastName: 'Chen', email: 'olivia.chen@example.com', mobile: '+1 (555) 304-7744', age: 24, gender: 'female', occupation: 'Graduate Student', annualIncome: 22000, city: 'Boston', state: 'MA', vehicleType: 'none', createdByAgent: agent._id },
    ];

    const customers = await Customer.insertMany(customersData);

    // 5. Create Sample Quotes and Payments for initial Dashboard telemetry
    console.log('[Seed] Generating sample Quotes and Payments for Dashboard telemetry...');
    const sampleQuote1 = await Quote.create({
      customerId: customers[0]._id, // James Anderson (34, car)
      productId: products[0]._id,  // PureShield Term 100
      agentId: agent._id,
      generatedPdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample_quote_1.pdf',
      premium: 180,
      coverageAmount: 150000,
      status: 'paid',
      notes: 'Customer opted for comprehensive term plan.',
    });

    const samplePayment1 = await Payment.create({
      customerId: customers[0]._id,
      quoteId: sampleQuote1._id,
      agentId: agent._id,
      stripePaymentLink: 'https://buy.stripe.com/test_sample_link_1',
      stripeSessionId: 'cs_test_sample_session_1001',
      amount: 180,
      currency: 'USD',
      paymentStatus: 'completed',
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await PolicyActivation.create({
      policyNumber: 'POL-2026-98124',
      customerId: customers[0]._id,
      quoteId: sampleQuote1._id,
      productId: products[0]._id,
      paymentId: samplePayment1._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      certificatePdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample_policy_certificate.pdf',
    });

    const sampleQuote2 = await Quote.create({
      customerId: customers[1]._id, // Sophia Martinez (29, bike)
      productId: products[7]._id,  // MotoRide Two-Wheeler Shield
      agentId: agent._id,
      generatedPdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample_quote_2.pdf',
      premium: 35,
      coverageAmount: 2000,
      status: 'shared',
      notes: 'Quotation link shared over WhatsApp.',
    });

    await Payment.create({
      customerId: customers[1]._id,
      quoteId: sampleQuote2._id,
      stripePaymentLink: 'https://buy.stripe.com/test_sample_link_2',
      amount: 35,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const sampleQuote3 = await Quote.create({
      customerId: customers[2]._id, // Olivia Chen
      productId: products[3]._id,  // MediGuard Comprehensive Health
      agentId: agent._id,
      generatedPdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample_quote_3.pdf',
      premium: 180,
      coverageAmount: 30000,
      status: 'generated',
    });

    console.log('[Seed] Database seeding completed successfully!');
    console.log(`[Seed] Summary:
    - 1 Admin (admin@test.com / AdminPassword123!)
    - 1 Agent (agent@test.com / Password123!)
    - 5 Categories
    - ${products.length} Products
    - ${customers.length} Customers
    - 3 Initial Quotes & 2 Payments`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding failed with error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

