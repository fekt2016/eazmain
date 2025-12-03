import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaBell } from 'react-icons/fa';
import {
  TrackingSection,
  TrackingContainer,
  TrackingTitle,
  TrackingDescription,
  TrackingGrid,
  TrackingCard,
  TrackingIcon,
  TrackingCardTitle,
  TrackingText,
  TrackingButton,
} from './shipping.styles';

const trackingData = [
  {
    icon: <FaSearch />,
    title: 'Track Your Order',
    description: 'Use your order number or tracking ID to see real-time updates on your shipment status.',
    action: 'Track Order',
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Delivery Address',
    description: 'Ensure your delivery address is correct. You can update it before your order ships.',
    action: 'Manage Addresses',
  },
  {
    icon: <FaBell />,
    title: 'Delivery Notifications',
    description: 'Receive SMS and email updates about your order status, from confirmation to delivery.',
    action: 'Update Preferences',
  },
];

const ShippingTracking = ({ navigate }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <TrackingSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <TrackingContainer>
        <TrackingTitle>Track Your Delivery</TrackingTitle>
        <TrackingDescription>
          Stay informed about your order every step of the way
        </TrackingDescription>
        <TrackingGrid>
          {trackingData.map((item, index) => (
            <TrackingCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <TrackingIcon>{item.icon}</TrackingIcon>
              <TrackingCardTitle>{item.title}</TrackingCardTitle>
              <TrackingText>{item.description}</TrackingText>
              <TrackingButton
                onClick={() => {
                  if (index === 0) navigate('/tracking');
                  else if (index === 1) navigate('/orders');
                  else navigate('/profile');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.action}
              </TrackingButton>
            </TrackingCard>
          ))}
        </TrackingGrid>
      </TrackingContainer>
    </TrackingSection>
  );
};

export default ShippingTracking;

