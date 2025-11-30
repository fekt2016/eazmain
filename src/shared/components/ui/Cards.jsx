import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

// Note: To use framer-motion animations, install: npm install framer-motion
// Then change: styled.div → styled(motion.div)
// And import: import { motion } from "framer-motion";

export const Card = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--transition-normal);
  overflow: hidden;

  ${({ $hover }) =>
    $hover &&
    `
    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }
  `}
`;

export const LuxuryCard = styled(Card)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-grey-100);
  backdrop-filter: blur(20px);

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-6px);
  }
`;

export const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-white-0);
`;

export const StatsCard = styled(Card)`
  padding: var(--spacing-xl);
  text-align: center;
  background: var(--gradient-primary);
  color: var(--color-white-0);
  border: none;

  h3 {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--spacing-xs);
    color: var(--color-white-0);
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }
`;

// Export all cards for easy importing
export default {
  Card,
  LuxuryCard,
  GlassCard,
  StatsCard,
};

