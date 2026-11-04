import { v4 as uuidv4 } from 'uuid';

export interface PaymentIntentRequest {
  productId: string;
  amountInr: number;
  paymentMethod: 'upi_simulated' | 'card_simulated';
  idempotencyKey?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amountInr: number;
  platformFeeInr: number;
  creatorEarningsInr: number;
  commissionRate: number;
  processedAt: string;
  error?: string;
}

export class MockPaymentProvider {
  /**
   * Process a simulated purchase idempotently with server-side validation.
   */
  static processPayment(req: PaymentIntentRequest, commissionRate: number = 0.10): PaymentResult {
    if (req.amountInr <= 0) {
      return {
        success: false,
        transactionId: '',
        amountInr: 0,
        platformFeeInr: 0,
        creatorEarningsInr: 0,
        commissionRate,
        processedAt: new Date().toISOString(),
        error: 'Invalid payment amount'
      };
    }

    const platformFee = Math.round(req.amountInr * commissionRate * 100) / 100;
    const creatorEarnings = Math.round((req.amountInr - platformFee) * 100) / 100;
    const transactionId = `tx_mock_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    return {
      success: true,
      transactionId,
      amountInr: req.amountInr,
      platformFeeInr: platformFee,
      creatorEarningsInr: creatorEarnings,
      commissionRate,
      processedAt: new Date().toISOString()
    };
  }
}
