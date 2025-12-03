import React from 'react';
import styled from 'styled-components';

/**
 * Reusable Security Badge Component
 * Displays security certifications with icon and text
 */
const SecurityBadge = ({ icon, text, iconColor, bgColor }) => {
  return (
    <BadgeContainer $bgColor={bgColor}>
      <BadgeIcon $iconColor={iconColor}>
        {icon}
      </BadgeIcon>
      <BadgeText>{text}</BadgeText>
    </BadgeContainer>
  );
};

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: ${props => props.$bgColor || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  min-width: 180px;
  max-width: 240px;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 196, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    min-width: 100%;
    max-width: 100%;
    padding: 0.7rem 0.9rem;
  }
`;

const BadgeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  color: ${props => props.$iconColor || '#ffc400'};

  svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 768px) {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

const BadgeText = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.2px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export default SecurityBadge;

