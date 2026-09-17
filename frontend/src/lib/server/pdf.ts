import PDFDocument from 'pdfkit';

export async function generatePdfBuffer(options: {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAge: number;
  customerGender: string;
  customerOccupation: string;
  customerCity: string;
  customerVehicle: string;
  productName: string;
  productDescription: string;
  coverageAmount: number;
  premium: number;
  termYears: number;
  agentName: string;
  quoteRef: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];
      doc.on('data', (d) => buffers.push(d));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#1E3A8A';
      const secondaryColor = '#059669';
      const darkTextColor = '#1F2937';
      const lightGray = '#F3F4F6';
      const borderGray = '#E5E7EB';

      // Header Banner
      doc.rect(40, 40, 515, 60).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('INSURSHIELD PLATFORM', 60, 52);
      doc.fontSize(10).font('Helvetica').text('OFFICIAL POLICY QUOTATION & UNDERWRITING ESTIMATE', 60, 78);

      // Meta Bar
      doc.rect(40, 110, 515, 35).fill(lightGray);
      doc.fillColor(darkTextColor).fontSize(9).font('Helvetica-Bold')
        .text(`Quote Reference: #${options.quoteRef}`, 55, 122)
        .text(`Issue Date: ${new Date().toLocaleDateString()}`, 235, 122)
        .text(`Policy Term: ${options.termYears} Year${options.termYears > 1 ? 's' : ''}`, 410, 122);

      // Customer & Agent Section
      const startY = 160;
      doc.rect(40, startY, 250, 140).strokeColor(borderGray).stroke();
      doc.rect(40, startY, 250, 25).fill(lightGray);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('PROPOSED INSURED (CLIENT)', 50, startY + 8);

      doc.fillColor(darkTextColor).fontSize(9)
        .font('Helvetica-Bold').text('Full Name:', 50, startY + 35)
        .font('Helvetica').text(options.customerName, 130, startY + 35)
        .font('Helvetica-Bold').text('Contact:', 50, startY + 52)
        .font('Helvetica').text(`${options.customerMobile} | ${options.customerEmail}`, 130, startY + 52, { width: 150 })
        .font('Helvetica-Bold').text('Age / Gender:', 50, startY + 74)
        .font('Helvetica').text(`${options.customerAge} yrs / ${options.customerGender.toUpperCase()}`, 130, startY + 74)
        .font('Helvetica-Bold').text('Occupation:', 50, startY + 91)
        .font('Helvetica').text(options.customerOccupation, 130, startY + 91)
        .font('Helvetica-Bold').text('Location/Vehicle:', 50, startY + 108)
        .font('Helvetica').text(`${options.customerCity} (${options.customerVehicle})`, 130, startY + 108);

      // Advisor Box
      doc.rect(305, startY, 250, 140).strokeColor(borderGray).stroke();
      doc.rect(305, startY, 250, 25).fill(lightGray);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('LICENSED ADVISOR', 315, startY + 8);
      doc.fillColor(darkTextColor).fontSize(9)
        .font('Helvetica-Bold').text('Agent Name:', 315, startY + 35)
        .font('Helvetica').text(options.agentName, 395, startY + 35)
        .font('Helvetica-Bold').text('License Code:', 315, startY + 60)
        .font('Helvetica').text('AGT-2026-AUTH', 395, startY + 60)
        .font('Helvetica-Bold').text('Platform:', 315, startY + 85)
        .font('Helvetica').text('InsurShield Verified', 395, startY + 85);

      // Product Specs
      const pY = 320;
      doc.rect(40, pY, 515, 25).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('SELECTED INSURANCE PLAN', 50, pY + 7);

      const tableY = pY + 25;
      doc.rect(40, tableY, 515, 120).strokeColor(borderGray).stroke();
      doc.fillColor(darkTextColor).fontSize(10)
        .font('Helvetica-Bold').text('Product Name:', 55, tableY + 12)
        .font('Helvetica').text(options.productName, 180, tableY + 12)
        .font('Helvetica-Bold').text('Description:', 55, tableY + 30)
        .font('Helvetica').text(options.productDescription, 180, tableY + 30, { width: 350 })
        .font('Helvetica-Bold').text('Sum Assured:', 55, tableY + 65)
        .fillColor(secondaryColor).font('Helvetica-Bold').text(`$${options.coverageAmount.toLocaleString()} USD`, 180, tableY + 65)
        .fillColor(darkTextColor).font('Helvetica-Bold').text('Term Length:', 55, tableY + 85)
        .font('Helvetica').text(`${options.termYears} Year(s)`, 180, tableY + 85);

      // Premium Summary
      const premY = 465;
      doc.rect(40, premY, 515, 25).fill(lightGray);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('PREMIUM BREAKDOWN & SUMMARY', 50, premY + 7);

      const boxY = premY + 25;
      const tax = Math.round(options.premium * 0.05);
      const total = options.premium + tax;
      doc.rect(40, boxY, 515, 80).strokeColor(borderGray).stroke();
      doc.fillColor(darkTextColor).fontSize(9)
        .font('Helvetica').text('Base Risk Premium:', 60, boxY + 15)
        .text(`$${options.premium.toLocaleString()} USD`, 420, boxY + 15, { align: 'right', width: 110 })
        .text('Estimated Regulatory Taxes (5%):', 60, boxY + 35)
        .text(`$${tax.toLocaleString()} USD`, 420, boxY + 35, { align: 'right', width: 110 });

      doc.moveTo(50, boxY + 52).lineTo(545, boxY + 52).strokeColor(borderGray).stroke();
      doc.fontSize(12).fillColor(secondaryColor).font('Helvetica-Bold')
        .text('TOTAL AMOUNT PAYABLE:', 60, boxY + 58)
        .text(`$${total.toLocaleString()} USD`, 420, boxY + 58, { align: 'right', width: 110 });

      // Footer
      doc.rect(390, 590, 165, 85).strokeColor(borderGray).stroke();
      doc.fillColor(darkTextColor).fontSize(8).font('Helvetica')
        .text('Digitally Authorized Signatory', 400, 600)
        .text('[ InsurShield Platform Underwriting ]', 400, 630)
        .text(`Date: ${new Date().toISOString().split('T')[0]}`, 400, 650);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

