import React from 'react';
import SecurityBadge from './SecurityBadge';

/**
 * Paystack Secure Gateway Badge
 * Paystack Secure Payments
 */
const PaystackBadge = () => {
  const paystackIcon = (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Credit Card */}
      <rect
        x="4"
        y="7"
        width="16"
        height="11"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      />
      <rect
        x="4"
        y="7"
        width="16"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Card Chip */}
      <rect
        x="6"
        y="10"
        width="4"
        height="3"
        rx="0.5"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Card Lines */}
      <line
        x1="6"
        y1="15"
        x2="12"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="17"
        x2="10"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Shield Badge */}
      <path
        d="M18 4L16 5V7C16 8.65685 17.3431 10 19 10C20.6569 10 22 8.65685 22 7V5L20 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );

  return (
    <SecurityBadge
      icon={paystackIcon}
      text="Paystack Secure Payments"
      iconColor="#00C896"
      bgColor="rgba(0, 200, 150, 0.08)"
    />
  );
};

export default PaystackBadge;

