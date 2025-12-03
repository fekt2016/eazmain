import React from 'react';
import SecurityBadge from './SecurityBadge';

/**
 * PCI-DSS Certified Payments Badge
 * PCI-DSS Level 1 Certified
 */
const PCIBadge = () => {
  const pciIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield Background */}
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark Circle */}
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        opacity="0.2"
      />
      {/* Checkmark */}
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  return (
    <SecurityBadge
      icon={pciIcon}
      text="PCI-DSS Level 1 Certified"
      iconColor="#10b981"
      bgColor="rgba(16, 185, 129, 0.08)"
    />
  );
};

export default PCIBadge;

