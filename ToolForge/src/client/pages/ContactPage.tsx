import React from 'react';
import { PolicyDraft } from '../components/PolicyDraft.tsx';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => (
  <PolicyDraft
    onBack={onBack}
    title="Contact ToolForge"
    summary="The public support channel has not been configured for this preview. No email address, phone number, registered address, grievance officer, or support-hours claim is published here."
    points={[
      'Configure and verify a customer-support contact before accepting live orders.',
      'The local preview does not send support tickets to a service desk.',
      'Do not submit personal or payment information through this page.'
    ]}
  />
);
