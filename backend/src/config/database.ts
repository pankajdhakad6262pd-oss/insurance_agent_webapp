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
      premium: 550,
      coverageAmount: 1000000,
      status: 'paid',
      notes: 'Customer opted for annual premium debit.',
    });

    const samplePayment1 = await Payment.create({
      customerId: customers[0]._id,
      quoteId: sampleQuote1._id,
      stripePaymentLink: 'https://checkout.stripe.com/pay/cs_test_sample_1',
      stripeSessionId: 'cs_test_sample_1',
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
      certificatePdfUrl: 'http://localhost:5000/uploads/quotes/sample_quote_1.pdf',
    });

    const sampleQuote2 = await Quote.create({
      customerId: customers[1]._id,
      productId: products[7]._id,
      agentId: agent._id,
      generatedPdfUrl: 'http://localhost:5000/uploads/quotes/sample_quote_2.pdf',
      premium: 180,
      coverageAmount: 10000,
      status: 'shared',
      notes: 'Quotation sent via WhatsApp to client.',
    });

    await Payment.create({
      customerId: customers[1]._id,
      quoteId: sampleQuote2._id,
      stripePaymentLink: 'https://checkout.stripe.com/pay/cs_test_sample_2',
      amount: 180,
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
