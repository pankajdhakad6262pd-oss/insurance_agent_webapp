import PDFDocument from 'pdfkit';
import { ICustomer, IInsuranceProduct, IAgent } from '../types';

export interface GeneratePdfOptions {
  customer: ICustomer;
  product: IInsuranceProduct;
  agent: IAgent;
  quoteId: string;
  calculatedPremium: number;
}

export class PdfService {
  /**
   * Generates a personalized Insurance Quotation PDF as a Buffer.
   */
  async generateQuotationPdf(options: GeneratePdfOptions): Promise<Buffer> {
    const { customer, product, agent, quoteId, calculatedPremium } = options;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: `Insurance Quotation - ${product.name}`,
            Author: 'Insurance Agent Platform',
            Subject: `Quotation for ${customer.firstName} ${customer.lastName}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (data) => buffers.push(data));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const primaryColor = '#1E3A8A'; // Deep Navy Blue
        const secondaryColor = '#059669'; // Emerald Green
        const darkTextColor = '#1F2937';
        const lightGray = '#F3F4F6';
        const borderGray = '#E5E7EB';

        // 1. Header Banner
        doc
          .rect(40, 40, 515, 60)
          .fill(primaryColor);

        doc
          .fillColor('#FFFFFF')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('INSURSHIELD PLATFORM', 60, 52);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text('OFFICIAL POLICY QUOTATION & UNDERWRITING ESTIMATE', 60, 78);

        // 2. Quote Meta Bar
        doc
          .rect(40, 110, 515, 35)
          .fill(lightGray);

        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(`Quote Reference: #Q-${quoteId.slice(-8).toUpperCase()}`, 55, 122)
          .text(`Issue Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 235, 122)
          .text(`Policy Term: ${product.termYears} Year${product.termYears > 1 ? 's' : ''}`, 410, 122);

        // 3. Customer & Agent Details 2-Column Section
        const startY = 160;

        // Left Column: Customer Profile
        doc
          .rect(40, startY, 250, 140)
          .strokeColor(borderGray)
          .stroke();

        doc
          .rect(40, startY, 250, 25)
          .fill(lightGray);

        doc
          .fillColor(primaryColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('PROPOSED INSURED (CLIENT)', 50, startY + 8);

        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Full Name:', 50, startY + 35)
          .font('Helvetica')
          .text(`${customer.firstName} ${customer.lastName}`, 130, startY + 35);

        doc
          .font('Helvetica-Bold')
          .text('Contact:', 50, startY + 52)
          .font('Helvetica')
          .text(`${customer.mobile} | ${customer.email}`, 130, startY + 52, { width: 150 });

        doc
          .font('Helvetica-Bold')
          .text('Age / Gender:', 50, startY + 74)
          .font('Helvetica')
          .text(`${customer.age} yrs / ${customer.gender.toUpperCase()}`, 130, startY + 74);

        doc
          .font('Helvetica-Bold')
          .text('Occupation:', 50, startY + 91)
          .font('Helvetica')
          .text(`${customer.occupation}`, 130, startY + 91);

        doc
          .font('Helvetica-Bold')
          .text('Location / Vehicle:', 50, startY + 108)
          .font('Helvetica')
          .text(`${customer.city}, ${customer.state} (${customer.vehicleType || 'None'})`, 130, startY + 108);

        // Right Column: Certified Agent Information
        doc
          .rect(305, startY, 250, 140)
          .strokeColor(borderGray)
          .stroke();

        doc
          .rect(305, startY, 250, 25)
          .fill(lightGray);

        doc
          .fillColor(primaryColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('LICENSED ADVISOR', 315, startY + 8);

        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Agent Name:', 315, startY + 35)
          .font('Helvetica')
          .text(`${agent.name}`, 395, startY + 35);

        doc
          .font('Helvetica-Bold')
          .text('Agent Email:', 315, startY + 52)
          .font('Helvetica')
          .text(`${agent.email}`, 395, startY + 52);

        doc
          .font('Helvetica-Bold')
          .text('Agent Mobile:', 315, startY + 69)
          .font('Helvetica')
          .text(`${agent.mobile}`, 395, startY + 69);

        doc
          .font('Helvetica-Bold')
          .text('License Code:', 315, startY + 86)
          .font('Helvetica')
          .text(`AGT-2026-${agent.email.slice(0, 4).toUpperCase()}`, 395, startY + 86);

        doc
          .font('Helvetica-Bold')
          .text('Platform Support:', 315, startY + 103)
          .font('Helvetica')
          .text('support@insurshield.local', 395, startY + 103);

        // 4. Product Coverage & Benefits Section
        const productY = 320;

        doc
          .rect(40, productY, 515, 25)
          .fill(primaryColor);

        doc
          .fillColor('#FFFFFF')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('SELECTED INSURANCE PLAN SPECIFICATIONS', 50, productY + 7);

        const tableY = productY + 25;
        doc
          .rect(40, tableY, 515, 120)
          .strokeColor(borderGray)
          .stroke();

        doc
          .fillColor(darkTextColor)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Product Name:', 55, tableY + 12)
          .font('Helvetica')
          .text(`${product.name}`, 180, tableY + 12);

        doc
          .font('Helvetica-Bold')
          .text('Plan Description:', 55, tableY + 30)
          .font('Helvetica')
          .text(`${product.description}`, 180, tableY + 30, { width: 350 });

        doc
          .font('Helvetica-Bold')
          .text('Underwritten Sum Assured:', 55, tableY + 65)
          .fillColor(secondaryColor)
          .font('Helvetica-Bold')
          .text(`$${product.coverageAmount.toLocaleString()} USD`, 180, tableY + 65);

        doc
          .fillColor(darkTextColor)
          .font('Helvetica-Bold')
          .text('Policy Duration / Term:', 55, tableY + 85)
          .font('Helvetica')
          .text(`${product.termYears} Year(s) Guaranteed Renewal`, 180, tableY + 85);

        // 5. Premium Computation Table
        const premY = 465;

        doc
          .rect(40, premY, 515, 25)
          .fill(lightGray);

        doc
          .fillColor(primaryColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('PREMIUM CALCULATION SUMMARY', 50, premY + 7);

        const basePrem = calculatedPremium;
        const estimatedTax = Math.round(basePrem * 0.05); // 5% regulatory tax
        const totalPayable = basePrem + estimatedTax;

        const pBoxY = premY + 25;
        doc
          .rect(40, pBoxY, 515, 80)
          .strokeColor(borderGray)
          .stroke();

        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica')
          .text('Base Risk Premium', 60, pBoxY + 12)
          .text(`$${basePrem.toLocaleString()} USD`, 440, pBoxY + 12, { align: 'right', width: 95 });

        doc
          .text('Regulatory State Surcharges & Taxes (5% est.)', 60, pBoxY + 30)
          .text(`$${estimatedTax.toLocaleString()} USD`, 440, pBoxY + 30, { align: 'right', width: 95 });

        doc
          .moveTo(50, pBoxY + 50)
          .lineTo(545, pBoxY + 50)
          .strokeColor(borderGray)
          .stroke();

        doc
          .fontSize(12)
          .fillColor(secondaryColor)
          .font('Helvetica-Bold')
          .text('TOTAL AMOUNT PAYABLE', 60, pBoxY + 57)
          .text(`$${totalPayable.toLocaleString()} USD`, 440, pBoxY + 57, { align: 'right', width: 95 });

        // 6. Terms & Signature Block
        const footerY = 590;

        doc
          .fillColor(darkTextColor)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('IMPORTANT DECLARATIONS & TERMS:', 40, footerY);

        doc
          .font('Helvetica')
          .text(
            '1. This quotation is calculated based on accurate representations provided by the applicant. Any non-disclosure of prior medical or legal history may render claims void.\n' +
            '2. The coverage becomes active exclusively following successful payment authorization and issuance of official policy certificate.\n' +
            '3. Free look period of 15 days is applicable from policy issuance date for full cancellation and refund.',
            40,
            footerY + 12,
            { width: 330 }
          );

        // Authorized Stamp / Sign placeholder
        doc
          .rect(390, footerY, 165, 85)
          .strokeColor(borderGray)
          .stroke();

        doc
          .fontSize(8)
          .font('Helvetica')
          .text('Authorized Platform Signatory', 400, footerY + 10)
          .text('[ Digitally Verified via InsurShield ]', 400, footerY + 45)
          .text(`Generated: ${new Date().toISOString().split('T')[0]}`, 400, footerY + 65);

        // Page footer line
        doc
          .moveTo(40, 790)
          .lineTo(555, 790)
          .strokeColor(borderGray)
          .stroke();

        doc
          .fontSize(8)
          .font('Helvetica')
          .text('InsurShield Agent Platform | Confidential Document | Generated by Agent Ecosystem', 40, 795, {
            align: 'center',
            width: 515,
          });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const pdfService = new PdfService();

