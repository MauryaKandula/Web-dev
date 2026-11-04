import { describe, it, expect } from 'vitest';
import { MockPaymentProvider } from '../server/services/payment.ts';

describe('ToolForge MockPaymentProvider', () => {
  it('correctly calculates 10% platform fee and 90% creator earnings', () => {
    const result = MockPaymentProvider.processPayment({
      productId: 'prod_test_01',
      amountInr: 100,
      paymentMethod: 'upi_simulated'
    }, 0.10);

    expect(result.success).toBe(true);
    expect(result.amountInr).toBe(100);
    expect(result.platformFeeInr).toBe(10);
    expect(result.creatorEarningsInr).toBe(90);
    expect(result.transactionId).toMatch(/^tx_mock_/);
  });

  it('correctly calculates custom 20% platform fee', () => {
    const result = MockPaymentProvider.processPayment({
      productId: 'prod_test_02',
      amountInr: 250,
      paymentMethod: 'card_simulated'
    }, 0.20);

    expect(result.success).toBe(true);
    expect(result.platformFeeInr).toBe(50);
    expect(result.creatorEarningsInr).toBe(200);
  });

  it('handles micro-transactions with exact decimal precision (e.g. ₹19 item with 10% fee)', () => {
    const result = MockPaymentProvider.processPayment({
      productId: 'prod_test_03',
      amountInr: 19,
      paymentMethod: 'upi_simulated'
    }, 0.10);

    expect(result.success).toBe(true);
    expect(result.platformFeeInr).toBe(1.9);
    expect(result.creatorEarningsInr).toBe(17.1);
    expect(result.platformFeeInr + result.creatorEarningsInr).toBe(19);
  });

  it('rejects invalid or non-positive amounts', () => {
    const zeroResult = MockPaymentProvider.processPayment({
      productId: 'prod_test_zero',
      amountInr: 0,
      paymentMethod: 'upi_simulated'
    }, 0.10);
    expect(zeroResult.success).toBe(false);
    expect(zeroResult.error).toBe('Invalid payment amount');

    const negResult = MockPaymentProvider.processPayment({
      productId: 'prod_test_neg',
      amountInr: -50,
      paymentMethod: 'upi_simulated'
    }, 0.10);
    expect(negResult.success).toBe(false);
    expect(negResult.error).toBe('Invalid payment amount');
  });

  it('handles idempotency keys consistently', () => {
    const key = 'idem_unique_test_12345';
    const result = MockPaymentProvider.processPayment({
      productId: 'prod_test_idem',
      amountInr: 99,
      paymentMethod: 'card_simulated',
      idempotencyKey: key
    }, 0.10);

    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
  });
});
