import { EligibilityService } from '../src/services/eligibilityService';
import { ICustomer, IInsuranceProduct, IInsuranceCategory } from '../src/types';

describe('EligibilityService Business Rules Engine', () => {
  const service = new EligibilityService();

  const termCategory: IInsuranceCategory = {
    _id: 'cat_term',
    name: 'Term Insurance',
    slug: 'term-insurance',
    description: 'Term plans',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const healthCategory: IInsuranceCategory = {
    _id: 'cat_health',
    name: 'Health Insurance',
    slug: 'health-insurance',
    description: 'Health plans',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const vehicleCategory: IInsuranceCategory = {
    _id: 'cat_vehicle',
    name: 'Vehicle Insurance',
    slug: 'vehicle-insurance',
    description: 'Vehicle plans',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const travelCategory: IInsuranceCategory = {
    _id: 'cat_travel',
    name: 'Travel Insurance',
    slug: 'travel-insurance',
    description: 'Travel plans',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const lifeCategory: IInsuranceCategory = {
    _id: 'cat_life',
    name: 'Life Insurance',
    slug: 'life-insurance',
    description: 'Life plans',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseCustomer: ICustomer = {
    _id: 'cust_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '+15551234567',
    age: 30,
    gender: 'male',
    occupation: 'Engineer',
    annualIncome: 80000,
    city: 'New York',
    state: 'NY',
    vehicleType: 'car',
    createdByAgent: 'agent_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Term Insurance Rules (18-60)', () => {
    const termProduct: IInsuranceProduct = {
      _id: 'prod_term_1',
      categoryId: termCategory,
      name: 'Pure Term 100',
      description: 'Term plan',
      minAge: 18,
      maxAge: 60,
      premium: 500,
      coverageAmount: 1000000,
      termYears: 20,
      features: ['Tax benefit'],
      eligibilityRules: { minAge: 18, maxAge: 60 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should approve customer within 18-60 years old', () => {
      const res = service.evaluate({ ...baseCustomer, age: 35 }, termProduct);
      expect(res.isEligible).toBe(true);
    });

    it('should reject applicant older than 60', () => {
      const res = service.evaluate({ ...baseCustomer, age: 62 }, termProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('18 and 60'))).toBe(true);
    });

    it('should reject applicant younger than 18', () => {
      const res = service.evaluate({ ...baseCustomer, age: 17 }, termProduct);
      expect(res.isEligible).toBe(false);
    });
  });

  describe('Health Insurance Rules (18-70)', () => {
    const healthProduct: IInsuranceProduct = {
      _id: 'prod_health_1',
      categoryId: healthCategory,
      name: 'Health Guard',
      description: 'Comprehensive health',
      minAge: 18,
      maxAge: 70,
      premium: 700,
      coverageAmount: 500000,
      termYears: 1,
      features: ['Cashless'],
      eligibilityRules: { minAge: 18, maxAge: 70 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should approve applicant aged 68', () => {
      const res = service.evaluate({ ...baseCustomer, age: 68 }, healthProduct);
      expect(res.isEligible).toBe(true);
    });

    it('should reject applicant aged 72', () => {
      const res = service.evaluate({ ...baseCustomer, age: 72 }, healthProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('18 and 70'))).toBe(true);
    });
  });

  describe('Vehicle Insurance Rules (Requires vehicleType)', () => {
    const carProduct: IInsuranceProduct = {
      _id: 'prod_car_1',
      categoryId: vehicleCategory,
      name: 'Auto Comprehensive',
      description: 'Car insurance',
      minAge: 18,
      maxAge: 75,
      premium: 450,
      coverageAmount: 40000,
      termYears: 1,
      features: ['Zero Dep'],
      eligibilityRules: { requiresVehicle: true, allowedVehicleTypes: ['car'] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should approve customer with matching vehicle type "car"', () => {
      const res = service.evaluate({ ...baseCustomer, vehicleType: 'car' }, carProduct);
      expect(res.isEligible).toBe(true);
    });

    it('should reject customer with vehicleType "none"', () => {
      const res = service.evaluate({ ...baseCustomer, vehicleType: 'none' }, carProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('registered vehicle'))).toBe(true);
    });

    it('should reject two-wheeler owner for car-specific product', () => {
      const res = service.evaluate({ ...baseCustomer, vehicleType: 'two-wheeler' }, carProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('Product only covers [car]'))).toBe(true);
    });
  });

  describe('Travel Insurance Rules (18-80)', () => {
    const travelProduct: IInsuranceProduct = {
      _id: 'prod_travel_1',
      categoryId: travelCategory,
      name: 'Global Traveler',
      description: 'Travel insurance',
      minAge: 18,
      maxAge: 80,
      premium: 200,
      coverageAmount: 250000,
      termYears: 1,
      features: ['Evacuation'],
      eligibilityRules: { minAge: 18, maxAge: 80 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should approve senior traveler aged 78', () => {
      const res = service.evaluate({ ...baseCustomer, age: 78 }, travelProduct);
      expect(res.isEligible).toBe(true);
    });

    it('should reject traveler aged 82', () => {
      const res = service.evaluate({ ...baseCustomer, age: 82 }, travelProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('18 and 80'))).toBe(true);
    });
  });

  describe('Life Insurance Rules (18-65)', () => {
    const lifeProduct: IInsuranceProduct = {
      _id: 'prod_life_1',
      categoryId: lifeCategory,
      name: 'Whole Life Heritage',
      description: 'Endowment life plan',
      minAge: 18,
      maxAge: 65,
      premium: 1200,
      coverageAmount: 750000,
      termYears: 20,
      features: ['Bonuses'],
      eligibilityRules: { minAge: 18, maxAge: 65 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should approve applicant aged 64', () => {
      const res = service.evaluate({ ...baseCustomer, age: 64 }, lifeProduct);
      expect(res.isEligible).toBe(true);
    });

    it('should reject applicant aged 66', () => {
      const res = service.evaluate({ ...baseCustomer, age: 66 }, lifeProduct);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('18 and 65'))).toBe(true);
    });
  });

  describe('Income & Special Thresholds', () => {
    const highIncomePlan: IInsuranceProduct = {
      _id: 'prod_elite',
      categoryId: termCategory,
      name: 'Ultra Elite Term',
      description: 'Elite plan',
      minAge: 25,
      maxAge: 55,
      premium: 2000,
      coverageAmount: 5000000,
      termYears: 30,
      features: ['Private concierge'],
      eligibilityRules: { minAge: 25, maxAge: 55, minIncome: 100000 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should reject applicant earning less than minIncome threshold', () => {
      const res = service.evaluate({ ...baseCustomer, age: 30, annualIncome: 50000 }, highIncomePlan);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.includes('Minimum annual income requirement is $100,000'))).toBe(true);
    });

    it('should approve applicant meeting minIncome threshold', () => {
      const res = service.evaluate({ ...baseCustomer, age: 30, annualIncome: 120000 }, highIncomePlan);
      expect(res.isEligible).toBe(true);
    });
  });
});

