import { ICustomer, IInsuranceProduct, IInsuranceCategory, EligibilityResult } from '../types';

export class EligibilityService {
  /**
   * Evaluate whether a customer is eligible for a specific insurance product.
   */
  evaluate(customer: ICustomer, product: IInsuranceProduct): EligibilityResult {
    const reasons: string[] = [];
    let isEligible = true;

    const category = typeof product.categoryId === 'object' && product.categoryId !== null
      ? (product.categoryId as IInsuranceCategory).name.toLowerCase()
      : '';

    const customerAge = customer.age;
    const rules = product.eligibilityRules || {};

    // 1. Category-specific Core Business Rules
    if (category.includes('term')) {
      if (customerAge < 18 || customerAge > 60) {
        isEligible = false;
        reasons.push(`Term Insurance requires applicant age to be between 18 and 60 (Applicant is ${customerAge}).`);
      }
    } else if (category.includes('health')) {
      if (customerAge < 18 || customerAge > 70) {
        isEligible = false;
        reasons.push(`Health Insurance requires applicant age to be between 18 and 70 (Applicant is ${customerAge}).`);
      }
    } else if (category.includes('vehicle')) {
      const hasVehicle = customer.vehicleType && customer.vehicleType !== 'none';
      if (!hasVehicle) {
        isEligible = false;
        reasons.push('Vehicle Insurance requires the customer to have a registered vehicle.');
      } else if (rules.allowedVehicleTypes && rules.allowedVehicleTypes.length > 0) {
        if (!rules.allowedVehicleTypes.includes(customer.vehicleType!)) {
          isEligible = false;
          reasons.push(
            `Product only covers [${rules.allowedVehicleTypes.join(', ')}], but customer has '${customer.vehicleType}'.`
          );
        }
      }
    } else if (category.includes('travel')) {
      if (customerAge < 18 || customerAge > 80) {
        isEligible = false;
        reasons.push(`Travel Insurance requires applicant age to be between 18 and 80 (Applicant is ${customerAge}).`);
      }
    } else if (category.includes('life')) {
      if (customerAge < 18 || customerAge > 65) {
        isEligible = false;
        reasons.push(`Life Insurance requires applicant age to be between 18 and 65 (Applicant is ${customerAge}).`);
      }
    }

    // 2. Product-level Min/Max Age Check
    const effectiveMinAge = rules.minAge ?? product.minAge ?? 18;
    const effectiveMaxAge = rules.maxAge ?? product.maxAge ?? 100;

    if (customerAge < effectiveMinAge) {
      isEligible = false;
      reasons.push(`Minimum age required for this plan is ${effectiveMinAge} (Applicant is ${customerAge}).`);
    }

    if (customerAge > effectiveMaxAge) {
      isEligible = false;
      reasons.push(`Maximum age limit for this plan is ${effectiveMaxAge} (Applicant is ${customerAge}).`);
    }

    // 3. Minimum Annual Income Rule
    if (rules.minIncome && customer.annualIncome < rules.minIncome) {
      isEligible = false;
      reasons.push(
        `Minimum annual income requirement is $${rules.minIncome.toLocaleString()} (Applicant has $${customer.annualIncome.toLocaleString()}).`
      );
    }

    // 4. Gender-specific Rule (if any)
    if (rules.gender && rules.gender !== 'all' && rules.gender !== customer.gender) {
      isEligible = false;
      reasons.push(`This specialized plan is tailored for ${rules.gender} applicants.`);
    }

    if (isEligible) {
      reasons.push('Meets all eligibility and underwriting criteria.');
    }

    return {
      product,
      isEligible,
      reasons,
    };
  }

  /**
   * Filter and evaluate a list of products against a customer profile.
   */
  evaluateAll(customer: ICustomer, products: IInsuranceProduct[]): {
    eligible: IInsuranceProduct[];
    ineligible: { product: IInsuranceProduct; reasons: string[] }[];
    allEvaluations: EligibilityResult[];
  } {
    const eligible: IInsuranceProduct[] = [];
    const ineligible: { product: IInsuranceProduct; reasons: string[] }[] = [];
    const allEvaluations: EligibilityResult[] = [];

    for (const product of products) {
      const result = this.evaluate(customer, product);
      allEvaluations.push(result);

      if (result.isEligible) {
        eligible.push(product);
      } else {
        ineligible.push({ product, reasons: result.reasons });
      }
    }

    return {
      eligible,
      ineligible,
      allEvaluations,
    };
  }
}

export const eligibilityService = new EligibilityService();

