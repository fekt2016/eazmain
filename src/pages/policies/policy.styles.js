import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Policy Pages — Modern redesign
 * Font scale: xs=12px sm=14px md=16px lg=18px xl=20px 2xl=24px 3xl=32px
 */

// ── Page shell ────────────────────────────────────────
export const PolicyContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
`;

export const PolicyContent = styled(motion.article)`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2.4rem 8rem;

  @media ${devicesMax.md} {
    padding: 0 1.6rem 6rem;
  }
`;

// ── Hero header ───────────────────────────────────────
export const PolicyHeader = styled.header`
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 60%, #1a2035 100%);
  padding: 5.2rem 2.4rem 6.4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: -3.2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.10) 1px, transparent 1px);
    background-size: 26px 26px;
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: 3.6rem 1.6rem 5.2rem;
  }
`;

export const PolicyTitle = styled.h1`
  position: relative;
  z-index: 1;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: #fff;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const LastUpdated = styled.p`
  position: relative;
  z-index: 1;
  font-size: var(--font-size-sm);
  color: rgba(255,255,255,0.55);
  margin: 0;
  font-style: italic;
`;

export const IntroText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.75;
  margin: 2.8rem 0 0;
  padding: 2rem 2.4rem;
  background: #fff;
  border-radius: 1.2rem;
  border: 1px solid var(--color-grey-200);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`;

// ── Sections ──────────────────────────────────────────
export const PolicySection = styled(motion.section)`
  margin-top: 2.4rem;
  background: #fff;
  border-radius: 1.4rem;
  border: 1px solid var(--color-grey-200);
  padding: 2.8rem 2.8rem 2rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);

  @media ${devicesMax.md} {
    padding: 2rem 1.6rem 1.6rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 1.6rem;
  padding-left: 1.2rem;
  border-left: 3px solid #D4882A;
  line-height: 1.3;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const SectionContent = styled.div`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  line-height: 1.8;

  p { margin-bottom: 1.2rem; }
  p:last-child { margin-bottom: 0; }

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-bold);
    color: var(--color-grey-800);
    margin: 2rem 0 1rem;
  }
`;

// ── Lists ─────────────────────────────────────────────
export const NumberedList = styled.ol`
  list-style: none;
  counter-reset: section-counter;
  padding: 0;
  margin: 1.2rem 0;

  > li {
    counter-increment: section-counter;
    margin-bottom: 1.4rem;
    padding-left: 3rem;
    position: relative;
    font-size: var(--font-size-md);
    line-height: 1.75;
    color: var(--color-grey-700);

    &::before {
      content: counter(section-counter) '.';
      position: absolute;
      left: 0;
      font-weight: var(--font-bold);
      color: #D4882A;
      font-size: var(--font-size-md);
    }
  }
`;

export const LetteredList = styled.ol`
  list-style: none;
  counter-reset: letter-counter;
  padding: 0;
  margin: 1rem 0 1.2rem;
  padding-left: 1.6rem;

  > li {
    counter-increment: letter-counter;
    margin-bottom: 1rem;
    padding-left: 3rem;
    position: relative;
    font-size: var(--font-size-sm);
    line-height: 1.7;
    color: var(--color-grey-600);

    &::before {
      content: counter(letter-counter, upper-roman) '.';
      position: absolute;
      left: 0;
      font-weight: var(--font-semibold);
      color: var(--color-grey-500);
      font-size: var(--font-size-sm);
    }
  }
`;

export const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 1.2rem;
  padding-left: 0.8rem;

  > li {
    margin-bottom: 0.8rem;
    padding-left: 2rem;
    position: relative;
    font-size: var(--font-size-md);
    line-height: 1.7;
    color: var(--color-grey-700);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.9rem;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D4882A;
    }
  }
`;

// ── Text ──────────────────────────────────────────────
export const Paragraph = styled.p`
  font-size: var(--font-size-md);
  margin-bottom: 1.2rem;
  line-height: 1.8;
  color: var(--color-grey-700);

  strong {
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
  }

  em { font-style: italic; }
`;

// ── Callout boxes ─────────────────────────────────────
export const ImportantNotice = styled.div`
  background: #fffbeb;
  border-left: 3px solid #D4882A;
  padding: 1.4rem 1.6rem;
  margin: 1.6rem 0;
  border-radius: 0 1rem 1rem 0;

  p {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-semibold);
    color: var(--color-grey-800);
    line-height: 1.6;

    strong { color: var(--color-grey-900); }
  }
`;

export const WarningBox = styled.div`
  background: #fff5f5;
  border-left: 3px solid var(--color-red-600);
  padding: 1.4rem 1.6rem;
  margin: 1.6rem 0;
  border-radius: 0 1rem 1rem 0;

  p {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-semibold);
    color: var(--color-grey-800);
    line-height: 1.6;

    strong { color: var(--color-grey-900); }
  }
`;

// ── CTA / Help section ────────────────────────────────
export const HelpSection = styled(motion.section)`
  margin-top: 2.8rem;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 100%);
  padding: 4rem 2.8rem;
  border-radius: 1.6rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.10) 1px, transparent 1px);
    background-size: 22px 22px;
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: 2.8rem 2rem;
  }
`;

export const HelpTitle = styled.h2`
  position: relative;
  z-index: 1;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: #fff;
  margin: 0 0 0.8rem;
`;

export const HelpText = styled.p`
  position: relative;
  z-index: 1;
  font-size: var(--font-size-md);
  color: rgba(255,255,255,0.65);
  margin: 0 0 2rem;
  line-height: 1.6;
`;

export const HelpButton = styled(motion.a)`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #fff;
  border: none;
  border-radius: 1rem;
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(212,136,42,0.4);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(212,136,42,0.5);
  }
`;

// ── Divider ───────────────────────────────────────────
export const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-200);
  margin: 2rem 0;
`;
