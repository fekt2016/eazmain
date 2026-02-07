import React, { useState, useEffect } from 'react';
import { FaFire } from 'react-icons/fa';
import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const CountdownContainer = styled.div`
  background: linear-gradient(135deg, var(--color-red-500) 0%, var(--color-orange-500) 100%);
  color: var(--color-white-0);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  margin: var(--space-xl) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  box-shadow: var(--shadow-md);

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
  }
`;

const CountdownText = styled.span`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-xs);

  svg {
    font-size: var(--text-xl);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums;

  @media ${devicesMax.sm} {
    font-size: var(--text-lg);
  }
`;

const TimeUnit = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  min-width: 50px;
  text-align: center;

  @media ${devicesMax.sm} {
    min-width: 40px;
    padding: var(--space-xs);
  }
`;

const Separator = styled.span`
  opacity: 0.7;
`;

/**
 * DealsCountdown component
 * Displays a countdown timer for deals
 * @param {Object} props
 * @param {Date|string} props.endDate - End date for the countdown (optional)
 * @param {string} props.message - Custom message (optional)
 */
const DealsCountdown = ({ 
  endDate = null, 
  message = "Deal ends in:" 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // If no end date provided, set a default 24-hour countdown from now
    const targetDate = endDate 
      ? new Date(endDate) 
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [endDate]);

  // Don't render if expired (or if no end date and we want to hide it)
  if (isExpired && !endDate) {
    return null;
  }

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <CountdownContainer>
      <CountdownText>
        <FaFire />
        {message}
      </CountdownText>
      <Timer>
        <TimeUnit>{formatTime(timeLeft.hours)}</TimeUnit>
        <Separator>:</Separator>
        <TimeUnit>{formatTime(timeLeft.minutes)}</TimeUnit>
        <Separator>:</Separator>
        <TimeUnit>{formatTime(timeLeft.seconds)}</TimeUnit>
      </Timer>
    </CountdownContainer>
  );
};

export default DealsCountdown;

