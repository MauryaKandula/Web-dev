import React from 'react';
import { PolicyDraft } from '../components/PolicyDraft.tsx';

interface ShippingPolicyPageProps {
  onBack: () => void;
}

export const ShippingPolicyPage: React.FC<ShippingPolicyPageProps> = ({ onBack }) => (
  <PolicyDraft
    onBack={onBack}
    title="Digital Delivery"
    summary="ToolForge is designed for digital software delivery. This preview does not promise that every catalog item has a verified, distributable package."
    points={[
      'A live download requires an approved product package in configured private storage and a successful captured payment.',
      'The local database and downloaded upstream archives are not included in this public source publication.',
      'Before public sales, verify ownership, licensing, malware scanning, file integrity, access controls, and support procedures for every downloadable item.'
    ]}
  />
);
