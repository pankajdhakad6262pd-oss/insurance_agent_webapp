import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongod: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  // If explicit remote MongoDB Atlas URI is provided (not default localhost)
  const isCustomUri = config.mongodbUri && !config.mongodbUri.includes('127.0.0.1') && !config.mongodbUri.includes('localhost');

  if (isCustomUri) {
    try {
      console.log(`[Database] Connecting to MongoDB: ${config.mongodbUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log(`[Database] Connected successfully to remote MongoDB.`);
      return;
    } catch (error: any) {
      console.warn(`[Database] Could not connect to remote MongoDB: ${error.message}`);
    }
  } else {
    // Try connecting to local mongodb first
    try {
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to local MongoDB on ${config.mongodbUri}`);
      return;
    } catch {
      // Fall through to memory server
    }
  }

  // Graceful in-memory fallback
  try {
    console.log('[Database] Starting embedded in-memory MongoDB server for seamless zero-config execution...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded in-memory MongoDB (${uri})`);

    // Auto-seed data in in-memory mode if empty
    const { Agent } = await import('../models/Agent');
    const agentCount = await Agent.countDocuments();
    if (agentCount === 0) {
      console.log('[Database] In-memory database is empty. Auto-seeding demo data...');
      const { seedDatabase } = await import('../seeds/seed');
      // Run seed without calling process.exit
      await seedDatabaseInMemory();
    }
  } catch (memError) {
    console.error('[Database] Failed to start in-memory MongoDB:', memError);
    throw memError;
  }
};

export const seedDatabaseInMemory = async (): Promise<void> => {
  try {
    const { Agent } = await import('../models/Agent');
    const { Customer } = await import('../models/Customer');
    const { InsuranceCategory } = await import('../models/InsuranceCategory');
    const { InsuranceProduct } = await import('../models/InsuranceProduct');
    const { Quote } = await import('../models/Quote');
    const { Payment } = await import('../models/Payment');
    const { PolicyActivation } = await import('../models/PolicyActivation');

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

    const categories = await InsuranceCategory.insertMany([
      { name: 'Term Insurance', slug: 'term-insurance', description: 'Pure life protection ensuring maximum financial security for your family.', icon: 'Shield' },
      { name: 'Health Insurance', slug: 'health-insurance', description: 'Comprehensive medical coverage covering hospitalization and wellness.', icon: 'HeartPulse' },
      { name: 'Vehicle Insurance', slug: 'vehicle-insurance', description: 'Complete bumper-to-bumper protection for cars, bikes, and fleets.', icon: 'Car' },
      { name: 'Travel Insurance', slug: 'travel-insurance', description: 'Worldwide coverage for trip delays, baggage loss, and emergencies.', icon: 'Plane' },
      { name: 'Life Insurance', slug: 'life-insurance', description: 'Endowment and whole-life policies designed for disciplined wealth generation.', icon: 'Umbrella' },
    ]);
    const catMap = new Map(categories.map((c) => [c.slug, c._id]));

    const products = await InsuranceProduct.insertMany([
      // 1. Term Insurance
      {
        categoryId: catMap.get('term-insurance'),
        name: 'PureShield Term 100',
        description: 'Comprehensive pure life protection with high sum assured and accidental death accelerated benefit.',
        minAge: 18,
        maxAge: 60,
        premium: 180,
        coverageAmount: 150000,
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
        premium: 260,
        coverageAmount: 250000,
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
        premium: 120,
        coverageAmount: 100000,
        termYears: 20,
        features: ['Guaranteed Level Premiums', 'No Medical Examination Required Under 35', 'Option to Convert into Whole Life'],
        eligibilityRules: { minAge: 18, maxAge: 40, minIncome: 15000 },
      },

      // 2. Health Insurance (1 Year Annual Renewable, $180-$240 USD/yr)
      {
        categoryId: catMap.get('health-insurance'),
        name: 'MediGuard Comprehensive Health',
        description: 'Individual hospitalization cover with zero room rent cap, diagnostic coverage, and preventive health checkups.',
        minAge: 18,
        maxAge: 70,
        premium: 180,
        coverageAmount: 30000,
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
        premium: 240,
        coverageAmount: 60000,
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
        premium: 290,
        coverageAmount: 40000,
        termYears: 1,
        features: ['Pre-existing Illness Coverage After 1 Year', 'AYUSH & In-Home Nursing Care Included', 'Critical Illness & Dialysis Support'],
        eligibilityRules: { minAge: 50, maxAge: 75, minIncome: 15000 },
      },

      // 3. Vehicle Insurance (1 Year Annual Renewable)
      {
        categoryId: catMap.get('vehicle-insurance'),
        name: 'AutoSecure Comprehensive Car Cover',
        description: 'All-inclusive 360-degree protection for personal four-wheelers with zero depreciation and roadside assistance.',
        minAge: 18,
        maxAge: 75,
        premium: 160,
        coverageAmount: 15000,
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
        premium: 35,
        coverageAmount: 2000,
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
        premium: 280,
        coverageAmount: 30000,
        termYears: 1,
        features: ['Driver & Cleaner Legal Liability Protection', 'Transit Cargo & Goods Damage Cover', 'Fleet Breakdown Towing & On-Site Assistance'],
        eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['commercial'] },
      },

      // 4. Travel Insurance (1 Year Term)
      {
        categoryId: catMap.get('travel-insurance'),
        name: 'Domestic Explorer Travel Plan',
        description: 'Affordable domestic journey protection covering flight delays, baggage losses, and unexpected medical expenses.',
        minAge: 18,
        maxAge: 80,
        premium: 30,
        coverageAmount: 15000,
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
        premium: 75,
        coverageAmount: 50000,
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
        premium: 120,
        coverageAmount: 100000,
        termYears: 1,
        features: ['Tuition Fee Interruption Refund', 'Compassionate Visit Flight Cover for Family', 'Worldwide Inpatient & Outpatient Care'],
        eligibilityRules: { minAge: 18, maxAge: 35 },
      },

      // 5. Life Insurance (18-25 Years Term)
      {
        categoryId: catMap.get('life-insurance'),
        name: 'FutureGlow Guaranteed Life Return',
        description: 'Endowment life plan combining family financial security with guaranteed annual payouts and maturity bonus.',
        minAge: 18,
        maxAge: 60,
        premium: 360,
        coverageAmount: 50000,
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
        premium: 280,
        coverageAmount: 40000,
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
        premium: 520,
        coverageAmount: 80000,
        termYears: 25,
        features: ['Lifelong Whole Life Protection up to Age 100', 'Cash Value Surrender & Low-Interest Loan Facility', 'Generational Legacy Wealth Transfer'],
        eligibilityRules: { minAge: 25, maxAge: 65, minIncome: 40000 },
      },
    ]);

    const customers = await Customer.insertMany([
      { firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com', mobile: '+1 (555) 301-4411', age: 34, gender: 'male', occupation: 'Software Architect', annualIncome: 145000, city: 'San Francisco', state: 'CA', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Sophia', lastName: 'Martinez', email: 'sophia.m@example.com', mobile: '+1 (555) 302-5522', age: 29, gender: 'female', occupation: 'Product Designer', annualIncome: 98000, city: 'Austin', state: 'TX', vehicleType: 'two-wheeler', createdByAgent: agent._id },
      { firstName: 'Liam', lastName: 'O\'Connor', email: 'liam.oc@example.com', mobile: '+1 (555) 303-6633', age: 48, gender: 'male', occupation: 'Civil Engineer', annualIncome: 120000, city: 'Seattle', state: 'WA', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Olivia', lastName: 'Chen', email: 'olivia.chen@example.com', mobile: '+1 (555) 304-7744', age: 24, gender: 'female', occupation: 'Graduate Student', annualIncome: 22000, city: 'Boston', state: 'MA', vehicleType: 'none', createdByAgent: agent._id },
      { firstName: 'Ethan', lastName: 'Wright', email: 'ethan.w@example.com', mobile: '+1 (555) 305-8855', age: 58, gender: 'male', occupation: 'Corporate Director', annualIncome: 210000, city: 'New York', state: 'NY', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@example.com', mobile: '+1 (555) 306-9966', age: 67, gender: 'female', occupation: 'Retired Professor', annualIncome: 45000, city: 'Denver', state: 'CO', vehicleType: 'none', createdByAgent: agent._id },
      { firstName: 'Noah', lastName: 'Kim', email: 'noah.kim@example.com', mobile: '+1 (555) 307-1177', age: 31, gender: 'male', occupation: 'Logistics Manager', annualIncome: 85000, city: 'Chicago', state: 'IL', vehicleType: 'commercial', createdByAgent: agent._id },
      { firstName: 'Ava', lastName: 'Taylor', email: 'ava.taylor@example.com', mobile: '+1 (555) 308-2288', age: 22, gender: 'female', occupation: 'Marketing Associate', annualIncome: 52000, city: 'Atlanta', state: 'GA', vehicleType: 'two-wheeler', createdByAgent: agent._id },
      { firstName: 'Lucas', lastName: 'Garcia', email: 'lucas.garcia@example.com', mobile: '+1 (555) 309-3399', age: 41, gender: 'male', occupation: 'Dentist', annualIncome: 175000, city: 'Miami', state: 'FL', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Isabella', lastName: 'Brown', email: 'isabella.b@example.com', mobile: '+1 (555) 310-4400', age: 37, gender: 'female', occupation: 'Data Scientist', annualIncome: 130000, city: 'San Jose', state: 'CA', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Mason', lastName: 'Wilson', email: 'mason.wilson@example.com', mobile: '+1 (555) 311-5511', age: 19, gender: 'male', occupation: 'College Student', annualIncome: 14000, city: 'Tempe', state: 'AZ', vehicleType: 'two-wheeler', createdByAgent: agent._id },
      { firstName: 'Mia', lastName: 'Johnson', email: 'mia.johnson@example.com', mobile: '+1 (555) 312-6622', age: 52, gender: 'female', occupation: 'High School Principal', annualIncome: 95000, city: 'Portland', state: 'OR', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Alexander', lastName: 'Patel', email: 'alex.patel@example.com', mobile: '+1 (555) 313-7733', age: 45, gender: 'male', occupation: 'Retail Entrepreneur', annualIncome: 160000, city: 'Dallas', state: 'TX', vehicleType: 'commercial', createdByAgent: agent._id },
      { firstName: 'Charlotte', lastName: 'White', email: 'charlotte.w@example.com', mobile: '+1 (555) 314-8844', age: 72, gender: 'female', occupation: 'Retired Architect', annualIncome: 38000, city: 'Scottsdale', state: 'AZ', vehicleType: 'none', createdByAgent: agent._id },
      { firstName: 'Benjamin', lastName: 'Hall', email: 'benjamin.hall@example.com', mobile: '+1 (555) 315-9955', age: 27, gender: 'male', occupation: 'Financial Analyst', annualIncome: 88000, city: 'Philadelphia', state: 'PA', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Amelia', lastName: 'Lewis', email: 'amelia.lewis@example.com', mobile: '+1 (555) 316-1010', age: 39, gender: 'female', occupation: 'Attorney', annualIncome: 155000, city: 'Washington', state: 'DC', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Henry', lastName: 'Clark', email: 'henry.clark@example.com', mobile: '+1 (555) 317-2020', age: 63, gender: 'male', occupation: 'Consultant', annualIncome: 110000, city: 'San Diego', state: 'CA', vehicleType: 'none', createdByAgent: agent._id },
      { firstName: 'Harper', lastName: 'Walker', email: 'harper.walker@example.com', mobile: '+1 (555) 318-3030', age: 33, gender: 'female', occupation: 'UX Researcher', annualIncome: 105000, city: 'Minneapolis', state: 'MN', vehicleType: 'car', createdByAgent: agent._id },
      { firstName: 'Daniel', lastName: 'Young', email: 'daniel.young@example.com', mobile: '+1 (555) 319-4040', age: 26, gender: 'male', occupation: 'Freelance Videographer', annualIncome: 48000, city: 'Nashville', state: 'TN', vehicleType: 'two-wheeler', createdByAgent: agent._id },
      { firstName: 'Evelyn', lastName: 'King', email: 'evelyn.king@example.com', mobile: '+1 (555) 320-5050', age: 43, gender: 'female', occupation: 'Pharmacist', annualIncome: 135000, city: 'Columbus', state: 'OH', vehicleType: 'car', createdByAgent: agent._id },
    ]);

    const sampleQuote1 = await Quote.create({
      customerId: customers[0]._id,
      productId: products[0]._id,
      agentId: agent._id,
      generatedPdfUrl: 'http://localhost:5000/uploads/quotes/sample_quote_1.pdf',
      premium: 180,
      coverageAmount: 150000,
      status: 'paid',
      notes: 'Customer opted for comprehensive term plan.',
    });

    const samplePayment1 = await Payment.create({
      customerId: customers[0]._id,
      quoteId: sampleQuote1._id,
      stripePaymentLink: 'https://checkout.stripe.com/pay/cs_test_sample_1',
      stripeSessionId: 'cs_test_sample_1',
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
      certificatePdfUrl: 'http://localhost:5000/uploads/quotes/sample_quote_1.pdf',
    });

    const sampleQuote2 = await Quote.create({
      customerId: customers[1]._id,
      productId: products[7]._id,
      agentId: agent._id,
      generatedPdfUrl: 'http://localhost:5000/uploads/quotes/sample_quote_2.pdf',
      premium: 35,
      coverageAmount: 2000,
      status: 'shared',
      notes: 'Quotation sent via WhatsApp to client.',
    });

    await Payment.create({
      customerId: customers[1]._id,
      quoteId: sampleQuote2._id,
      stripePaymentLink: 'https://checkout.stripe.com/pay/cs_test_sample_2',
      amount: 35,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    console.log('[Database] Auto-seeding completed with 1 Admin, 1 Agent, 5 Categories, 15 Products, 20 Customers, and sample telemetry!');
  } catch (seedErr) {
    console.error('[Database] In-memory auto-seed failed:', seedErr);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
