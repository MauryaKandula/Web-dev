import React from 'react';
import { PolicyDraft } from '../components/PolicyDraft.tsx';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => (
  <PolicyDraft
    onBack={onBack}
    title="Privacy Notice"
    summary="This draft is not a final privacy policy. The local prototype can store account details, hashed passwords, product orders, library entitlements, reviews, and creator information in its configured SQLite database."
    points={[
      'The browser stores an authentication token in local storage after sign-in.',
      'The app may contact third-party services for checkout, package delivery, or avatar images when those features are configured.',
      'Do not deploy with real customer data until retention periods, data access and deletion, service providers, security contacts, and applicable privacy obligations are documented.',
      'Do not enter real payment credentials in the development preview.'
    ]}
  />
);
