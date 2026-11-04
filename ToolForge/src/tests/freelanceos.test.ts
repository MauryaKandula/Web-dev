import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  generateUPIPaymentURI,
  generateInvoice,
  defaultSampleProposal,
  type Milestone
} from '../shared/freelanceos.ts';

describe('FreelanceOS Client & Invoicing Engine', () => {
  const milestones: Milestone[] = [
    {
      id: 'm1',
      title: 'UI Prototype',
      description: 'Interactive wireframes',
      deliverable: 'Figma link',
      amountInr: 10000,
      dueDate: '2026-11-10',
      status: 'approved'
    },
    {
      id: 'm2',
      title: 'API & Database Integration',
      description: 'Backend services',
      deliverable: 'Deployed API endpoint',
      amountInr: 15000,
      dueDate: '2026-11-20',
      status: 'pending'
    }
  ];

  it('accurately computes subtotal, discounts, and GST totals', () => {
    // Zero GST
    const totalsNoGst = calculateTotals(milestones, 1000, 0);
    expect(totalsNoGst.subtotalInr).toBe(25000);
    expect(totalsNoGst.discountInr).toBe(1000);
    expect(totalsNoGst.taxableAmountInr).toBe(24000);
    expect(totalsNoGst.gstAmountInr).toBe(0);
    expect(totalsNoGst.totalAmountInr).toBe(24000);

    // 18% GST
    const totalsWithGst = calculateTotals(milestones, 1000, 18);
    expect(totalsWithGst.subtotalInr).toBe(25000);
    expect(totalsWithGst.taxableAmountInr).toBe(24000);
    expect(totalsWithGst.gstAmountInr).toBe(4320); // 18% of 24000
    expect(totalsWithGst.totalAmountInr).toBe(28320);
  });

  it('formats standard NPCI UPI payment deep link with URI encoding', () => {
    const upiUri = generateUPIPaymentURI('sample@toolforge.test', 'Demo Customer', 24000, 'Invoice INV-2026-001');

    expect(upiUri).toContain('upi://pay?');
    expect(upiUri).toContain('pa=sample@toolforge.test');
    expect(upiUri).toContain('pn=Demo%20Customer');
    expect(upiUri).toContain('am=24000.00');
    expect(upiUri).toContain('cu=INR');
  });

  it('generates itemized invoice object from proposal data', () => {
    const invoice = generateInvoice(defaultSampleProposal, 'INV-TEST-99', 14);

    expect(invoice.invoiceNumber).toBe('INV-TEST-99');
    expect(invoice.client.name).toBe('Example Client');
    expect(invoice.developer.name).toBe('Demo Customer');
    expect(invoice.lineItems.length).toBe(defaultSampleProposal.milestones.length);
    expect(invoice.upiPaymentUri).toContain('upi://pay');
    expect(invoice.totalAmountInr).toBeGreaterThan(0);
  });
});
