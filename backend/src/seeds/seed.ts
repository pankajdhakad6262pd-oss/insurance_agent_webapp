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
        description: 'High-sum assured term plan offering comprehensive pure life coverage with accidental death benefit.',
        minAge: 18,
        maxAge: 60,
        premium: 550,
        coverageAmount: 1000000,
        termYears: 30,
        features: ['100% Tax Benefits', 'Accidental Death Rider Included', 'Terminal Illness Payout'],
        eligibilityRules: { minAge: 18, maxAge: 60, minIncome: 25000 },
      },
      {
        categoryId: catMap.get('term-insurance'),
        name: 'Elite Income Term Protector',
        description: 'Designed for high net-worth professionals, providing monthly income payout to beneficiaries.',
        minAge: 25,
        maxAge: 55,
        premium: 890,
        coverageAmount: 2000000,
        termYears: 25,
        features: ['Staggered Monthly Payout', 'Waiver of Premium on Disability', 'Inflation Adjusted Benefit'],
        eligibilityRules: { minAge: 25, maxAge: 55, minIncome: 60000 },
      },
      {
        categoryId: catMap.get('term-insurance'),
        name: 'Young Professional Term Saver',
        description: 'Budget-friendly term plan for early career starters locking in low lifetime premiums.',
        minAge: 18,
        maxAge: 40,
        premium: 320,
        coverageAmount: 500000,
        termYears: 20,
        features: ['Guaranteed Level Premiums', 'No Medical Exam under 35', 'Convertible to Whole Life'],
        eligibilityRules: { minAge: 18, maxAge: 40, minIncome: 15000 },
      },

      // Health Insurance (Category 2) - Age 18-70
      {
        categoryId: catMap.get('health-insurance'),
        name: 'MediGuard Comprehensive Health',
        description: 'Zero room-rent sublimit hospitalization plan with outpatient benefits and preventive checkups.',
        minAge: 18,
        maxAge: 70,
        premium: 720,
        coverageAmount: 500000,
        termYears: 1,
        features: ['Cashless Treatment in 10,000+ Hospitals', 'No Co-Payment', 'Free Annual Health Checkup'],
        eligibilityRules: { minAge: 18, maxAge: 70, minIncome: 20000 },
      },
      {
        categoryId: catMap.get('health-insurance'),
        name: 'Senior Vitality Health Care',
        description: 'Specially crafted health policy for senior citizens covering pre-existing conditions and AYUSH care.',
        minAge: 50,
        maxAge: 70,
        premium: 1450,
        coverageAmount: 750000,
        termYears: 1,
        features: ['Pre-existing Disease Coverage after 1 yr', 'Home Healthcare Cover', 'Critical Illness Cover'],
        eligibilityRules: { minAge: 50, maxAge: 70, minIncome: 15000 },
      },
      {
        categoryId: catMap.get('health-insurance'),
        name: 'Family Floater Super Shield',
        description: 'One single plan covering self, spouse, and children with unlimited automatic restoration.',
        minAge: 21,
        maxAge: 65,
        premium: 980,
        coverageAmount: 1000000,
        termYears: 1,
        features: ['Unlimited Sum Assured Restoration', 'Maternity Cover Included', 'Bariatric Surgery Cover'],
        eligibilityRules: { minAge: 21, maxAge: 65, minIncome: 35000 },
      },

      // Vehicle Insurance (Category 3) - Requires vehicleType
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'AutoSecure Comprehensive Car Cover',
        description: 'All-inclusive 360-degree protection for personal 4-wheelers with roadside assistance.',
        minAge: 18,
        maxAge: 75,
        premium: 450,
        coverageAmount: 40000,
        termYears: 1,
        features: ['Zero Depreciation Included', 'Engine & Gearbox Protection', '24x7 Roadside Assistance'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['car'] },
      },
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'MotoRide Two-Wheeler Shield',
        description: 'Instant bike policy with collision damage, third-party liability, and rider personal accident cover.',
        minAge: 18,
        maxAge: 70,
        premium: 180,
        coverageAmount: 10000,
        termYears: 1,
        features: ['Instant Digital Policy', 'Personal Accident Cover of $15,000', 'Loss of Helmet & Keys Cover'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['two-wheeler'] },
      },
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'FleetGuard Commercial Vehicle Cover',
        description: 'Engineered for commercial vans, pickups, and fleet trucks with cargo protection.',
        minAge: 21,
        maxAge: 70,
        premium: 1100,
        coverageAmount: 100000,
        termYears: 1,
        features: ['Driver & Cleaner Legal Cover', 'In-Transit Cargo Damage Protection', 'Zero-Downtime Towing'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['commercial'] },
      },

      // Travel Insurance (Category 4) - Age 18-80
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Global Voyager International Cover',
        description: 'Comprehensive worldwide travel insurance meeting all Schengen, US, and UK visa requirements.',
        minAge: 18,
        maxAge: 80,
        premium: 240,
        coverageAmount: 250000,
        termYears: 1,
        features: ['Medical Evacuation up to $100k', 'Passport Loss Assistance', 'Flight Interruption Cover'],
        eligibilityRules: { minAge: 18, maxAge: 80 },
      },
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Student Abroad Travel Shield',
        description: 'Tailored for university students studying overseas, covering tuition fee continuation and health.',
        minAge: 18,
        maxAge: 35,
        premium: 380,
        coverageAmount: 300000,
        termYears: 1,
        features: ['Tuition Fee Interruption Refund', 'Compassionate Visit Cover', 'Worldwide Hospitalization'],
        eligibilityRules: { minAge: 18, maxAge: 35 },
      },
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Domestic Explorer Travel Plan',
        description: 'Affordable domestic trip protection covering flight cancellations, luggage delays, and hotel issues.',
        minAge: 18,
        maxAge: 80,
        premium: 85,
        coverageAmount: 50000,
        termYears: 1,
        features: ['Baggage Delay Compensation', 'Flight Missed Connection Cover', 'Adventure Sports Add-on'],
        eligibilityRules: { minAge: 18, maxAge: 80 },
      },

      // Life Insurance (Category 5) - Age 18-65
      {
        categoryId: catMap.get('life-insurance'),
        name: 'FutureGlow Guaranteed Life Return',
        description: 'Endowment life plan that pairs full family protection with tax-free guaranteed annual bonuses.',
        minAge: 18,
        maxAge: 60,
        premium: 1200,
        coverageAmount: 750000,
        termYears: 20,
        features: ['Guaranteed Annual Payouts', 'Maturity Lump Sum Benefit', 'Critical Illness Cover'],
        eligibilityRules: { minAge: 18, maxAge: 60, minIncome: 30000 },
      },
      {
        categoryId: catMap.get('life-insurance'),
        name: 'Heritage Whole Life Assurance',
        description: 'Lifelong protection until age 100 with escalating cash value accumulation and loan facility.',
        minAge: 25,
        maxAge: 65,
        premium: 1850,
        coverageAmount: 1500000,
        termYears: 40,
        features: ['Coverage up to Age 100', 'Cash Value Surrender Privilege', 'Estate Planning Support'],
        eligibilityRules: { minAge: 25, maxAge: 65, minIncome: 50000 },
      },
      {
        categoryId: catMap.get('life-insurance'),
        name: 'Child Career Life Builder',
        description: 'Dual benefit policy financing higher education milestones while securing child future.',
        minAge: 21,
        maxAge: 50,
        premium: 950,
        coverageAmount: 600000,
        termYears: 18,
        features: ['College Milestone Cash Drops', 'Premium Waiver on Parent Demise', 'Guaranteed Bonus Rates'],
        eligibilityRules: { minAge: 21, maxAge: 50, minIncome: 25000 },
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
      premium: 550,
      coverageAmount: 1000000,
      status: 'paid',
      notes: 'Customer preferred annual premium debit.',
    });

    const samplePayment1 = await Payment.create({
      customerId: customers[0]._id,
      quoteId: sampleQuote1._id,
      agentId: agent._id,
      stripePaymentLink: 'https://buy.stripe.com/test_sample_link_1',
      stripeSessionId: 'cs_test_sample_session_1001',
      amount: 550,
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
      premium: 180,
      coverageAmount: 10000,
      status: 'shared',
      notes: 'Quotation link shared over WhatsApp.',
    });

    await Payment.create({
      customerId: customers[1]._id,
      quoteId: sampleQuote2._id,
      stripePaymentLink: 'https://buy.stripe.com/test_sample_link_2',
      amount: 180,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const sampleQuote3 = await Quote.create({
      customerId: customers[2]._id, // Liam O'Connor (48, car)
      productId: products[3]._id,  // MediGuard Comprehensive Health
      agentId: agent._id,
      generatedPdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample_quote_3.pdf',
      premium: 720,
      coverageAmount: 500000,
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

