import React from 'react';
import SecurityBadge from './SecurityBadge';

/**
 * SSL Secure Encryption Badge
 * 256-bit SSL Encryption
 */
const SSLBadge = () => {
  const sslIcon = (
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
      {/* Lock Icon */}
      <rect
        x="9"
        y="10"
        width="6"
        height="7"
        rx="1"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M9 10V8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <SecurityBadge
      icon={sslIcon}
      text="256-bit SSL Encryption"
      iconColor="#ffc400"
      bgColor="rgba(255, 196, 0, 0.08)"
    />
  );
};

export default SSLBadge;

