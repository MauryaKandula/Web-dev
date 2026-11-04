import { describe, it, expect } from 'vitest';

describe('Launch policy pages', () => {
  it('exports the legal, privacy, licensing, delivery, refund, and contact drafts', async () => {
    const terms = await import('../client/pages/TermsPage.tsx');
    const privacy = await import('../client/pages/PrivacyPage.tsx');
    const refund = await import('../client/pages/RefundPolicyPage.tsx');
    const shipping = await import('../client/pages/ShippingPolicyPage.tsx');
    const licensing = await import('../client/pages/LicensingPage.tsx');
    const contact = await import('../client/pages/ContactPage.tsx');

    expect(terms.TermsPage).toBeDefined();
    expect(privacy.PrivacyPage).toBeDefined();
    expect(refund.RefundPolicyPage).toBeDefined();
    expect(shipping.ShippingPolicyPage).toBeDefined();
    expect(licensing.LicensingPage).toBeDefined();
    expect(contact.ContactPage).toBeDefined();
  });
});