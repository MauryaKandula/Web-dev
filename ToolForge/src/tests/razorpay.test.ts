import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayCredentials,
  verifyCheckoutSignature,
  verifyWebhookSignature
} from '../server/services/razorpay.ts';

const credentials = {
  keyId: 'rzp_test_toolforgeExample',
  keySecret: 'test_only_not_a_real_key'
};

describe('Razorpay gateway helpers', () => {
  it('requires explicit test/live credentials and rejects placeholder key ids', () => {
    expect(getRazorpayCredentials({})).toBeNull();
    expect(getRazorpayCredentials({
      RAZORPAY_KEY_ID: 'rzp_test_placeholder',
      RAZORPAY_KEY_SECRET: 'test'
    })).toEqual({
      keyId: 'rzp_test_placeholder',
      keySecret: 'test'
    });
    expect(getRazorpayCredentials({
      RAZORPAY_KEY_ID: 'rzp_test_placeholder_2026',
      RAZORPAY_KEY_SECRET: 'test'
    })).toBeNull();
  });

  it('validates the checkout HMAC over the exact order and payment ids', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_def456';
    const signature = crypto.createHmac('sha256', credentials.keySecret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    expect(verifyCheckoutSignature(orderId, paymentId, signature, credentials.keySecret)).toBe(true);
    expect(verifyCheckoutSignature(orderId, 'pay_attacker', signature, credentials.keySecret)).toBe(false);
    expect(verifyCheckoutSignature('invalid', paymentId, signature, credentials.keySecret)).toBe(false);
    expect(verifyCheckoutSignature(orderId, paymentId, 'not-hex', credentials.keySecret)).toBe(false);
  });

  it('validates webhooks against the original raw request bytes', () => {
    const body = Buffer.from('{"event":"payment.captured","amount":19900}');
    const signature = crypto.createHmac('sha256', 'webhook_test_secret')
      .update(body)
      .digest('hex');

    expect(verifyWebhookSignature(body, signature, 'webhook_test_secret')).toBe(true);
    expect(verifyWebhookSignature(Buffer.from(body.toString() + ' '), signature, 'webhook_test_secret')).toBe(false);
    expect(verifyWebhookSignature(body, 'not-hex', 'webhook_test_secret')).toBe(false);
  });

  it('creates an INR order with server-calculated paise and uses Basic auth', async () => {
    let requestUrl = '';
    let requestInit: RequestInit | undefined;
    const mockFetch: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({
        id: 'order_gateway123',
        amount: 19900,
        currency: 'INR',
        status: 'created'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const order = await createRazorpayOrder({
      amountPaise: 19900,
      receipt: 'tf_test_receipt',
      notes: { productId: 'prod_test', userId: 'usr_test' }
    }, credentials, mockFetch);

    expect(requestUrl).toBe('https://api.razorpay.com/v1/orders');
    expect(requestInit?.method).toBe('POST');
    expect(new Headers(requestInit?.headers).get('Authorization'))
      .toBe('Basic ' + Buffer.from(credentials.keyId + ':' + credentials.keySecret).toString('base64'));
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      amount: 19900,
      currency: 'INR',
      receipt: 'tf_test_receipt',
      notes: { productId: 'prod_test', userId: 'usr_test' }
    });
    expect(order.id).toBe('order_gateway123');
  });

  it('rejects an order response with a mismatched amount or currency', async () => {
    const mockFetch: typeof fetch = async () => new Response(JSON.stringify({
      id: 'order_gateway123',
      amount: 100,
      currency: 'USD'
    }), { status: 200 });

    await expect(createRazorpayOrder({
      amountPaise: 19900,
      receipt: 'tf_test_receipt',
      notes: {}
    }, credentials, mockFetch)).rejects.toThrow('does not match');
  });

  it('fetches payment status from Razorpay instead of trusting the browser callback', async () => {
    let requestUrl = '';
    const mockFetch: typeof fetch = async (input) => {
      requestUrl = String(input);
      return new Response(JSON.stringify({
        id: 'pay_confirmed123',
        order_id: 'order_gateway123',
        amount: 19900,
        currency: 'INR',
        status: 'captured',
        captured: true
      }), { status: 200 });
    };

    const payment = await fetchRazorpayPayment('pay_confirmed123', credentials, mockFetch);
    expect(requestUrl).toBe('https://api.razorpay.com/v1/payments/pay_confirmed123');
    expect(payment.captured).toBe(true);
  });

  it('rejects non-captured or malformed payment IDs before they can be verified', async () => {
    const mockFetch: typeof fetch = async () => new Response(JSON.stringify({
      id: 'pay_other',
      order_id: 'order_gateway123',
      amount: 19900,
      currency: 'INR',
      status: 'authorized',
      captured: false
    }), { status: 200 });

    await expect(fetchRazorpayPayment('../orders', credentials, mockFetch))
      .rejects.toThrow('Invalid Razorpay payment id');
    await expect(fetchRazorpayPayment('pay_confirmed123', credentials, mockFetch))
      .rejects.toThrow('different payment id');
  });
});