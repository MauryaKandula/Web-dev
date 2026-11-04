import React from 'react';
import { PolicyDraft } from '../components/PolicyDraft.tsx';

interface RefundPolicyPageProps {
  onBack: () => void;
}

export const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onBack }) => (
  <PolicyDraft
    onBack={onBack}
    title="Refund Information"
    summary="No live orders are being accepted by this development preview, so this page does not make a refund promise or define a live refund process."
    points={[
      'Before enabling live checkout, publish a clear refund and cancellation policy with verified support contact details.',
      'Test refund, reversal, failed payment, duplicate payment, and delayed webhook cases with the payment provider.',
      'If you are testing locally, use Razorpay Test Mode credentials only and never submit real payment details.'
    ]}
  />
);
