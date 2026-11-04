import React from 'react';
import { PolicyDraft } from '../components/PolicyDraft.tsx';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => (
  <PolicyDraft
    onBack={onBack}
    title="Terms of Use"
    summary="This draft describes a prototype marketplace for developer tools. It is not a final consumer or creator agreement."
    points={[
      'The current purchase flow is one-time only. Recurring memberships and monthly pledges are not available.',
      'A local development payment simulation is not a sale. Razorpay checkout is unavailable until the merchant has configured and tested valid credentials.',
      'The platform records creator fee calculations but does not transfer earnings or hold funds in escrow.',
      'Before accepting orders, publish verified business identity, customer support, licensing, refund, privacy, tax, and dispute terms reviewed for the intended markets.'
    ]}
  />
);
