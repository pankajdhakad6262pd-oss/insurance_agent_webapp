/**
 * Clean phone numbers to international digits-only format for WhatsApp
 */
export function formatWhatsAppPhone(phone: string): string {
  // Remove all non-numeric characters except leading '+'
  const cleaned = phone.replace(/[^\d]/g, '');
  return cleaned;
}

/**
 * Generate WhatsApp Share URL for a Quotation PDF
 */
export function generateWhatsAppQuoteLink(
  phone: string,
  customerName: string,
  productName: string,
  pdfUrl: string,
  premium: number
): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message =
    `Hello ${customerName},\n\n` +
    `Here is your official insurance quotation for *${productName}*.\n\n` +
    `Premium Amount: *$${premium.toLocaleString()} USD*\n\n` +
    `You can view and download your full quotation breakdown PDF here:\n` +
    `${pdfUrl}\n\n` +
    `Please review the details and let me know if you would like to proceed with policy activation.\n\n` +
    `Best regards,\nYour Insurance Advisor`;

  const encodedMessage = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp Share URL for a Stripe Payment Link
 */
export function generateWhatsAppPaymentLink(
  phone: string,
  customerName: string,
  productName: string,
  paymentUrl: string,
  amount: number
): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message =
    `Hello ${customerName},\n\n` +
    `Your insurance policy quotation for *${productName}* has been approved!\n\n` +
    `Amount Due: *$${amount.toLocaleString()} USD*\n\n` +
    `Please complete your secure payment using the official Stripe link below to instantly activate your policy certificate:\n` +
    `${paymentUrl}\n\n` +
    `Upon payment confirmation, your active policy document and tax receipt will be delivered immediately to your email.\n\n` +
    `Best regards,\nYour Insurance Advisor`;

  const encodedMessage = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
}

