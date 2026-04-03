import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { FaStore } from 'react-icons/fa';
import { devicesMax } from '../../shared/styles/breakpoint';
import { SELLER_APP_URL } from '../../shared/config/appConfig';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(26, 31, 46, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  /* Above cookie banner / AdPopup (9999), toasts, and main content stacking contexts */
  z-index: 10050;
`;

const Card = styled.article`
  position: relative;
  width: min(880px, 100%);
  background: #ffffff;
  border-radius: 40px;
  border: 1px solid #ede6dc;
  box-shadow: 0 24px 80px rgba(26, 31, 46, 0.2);
  overflow: hidden;
  animation: ${fadeIn} 240ms ease;

  @media ${devicesMax.sm} {
    border-radius: 24px;
  }
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 100%);
  padding: 3rem 3.5rem 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 2rem;
`;

const IconWrap = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.2);
  border: 2px solid rgba(212, 136, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4882a;
  font-size: 2.7rem;
  flex-shrink: 0;

  @media ${devicesMax.sm} {
    width: 72px;
    height: 72px;
    font-size: 2rem;
  }
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0 0 0.65rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;

  @media ${devicesMax.sm} {
    font-size: 1.65rem;
  }
`;

const Sub = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.45;

  @media ${devicesMax.sm} {
    font-size: 0.95rem;
  }
`;

const Body = styled.div`
  padding: 3rem 3.5rem 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media ${devicesMax.sm} {
    padding: 2rem 1.75rem 2.25rem;
    gap: 1.5rem;
  }
`;

const Copy = styled.p`
  margin: 0;
  font-size: 1.25rem;
  color: #475569;
  line-height: 1.6;

  @media ${devicesMax.sm} {
    font-size: 1.05rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
`;

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 56px;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1.15rem;
  text-decoration: none;
  background: #d4882a;
  color: #ffffff;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover {
    background: #b8711f;
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid #d4882a;
    outline-offset: 2px;
  }
`;

const GhostButton = styled.button`
  min-height: 48px;
  padding: 0.65rem 1.35rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: #1e293b;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  &:focus-visible {
    outline: 2px solid #d4882a;
    outline-offset: 2px;
  }
`;

/**
 * Seller web app promo on the buyer homepage. Shown on every visit to home.
 * Stays open until the user dismisses (close, Not now, backdrop, or Escape).
 */
const SellerAppPromoModal = () => {
  /* Open on first paint so we are not clipped by ancestors (PageWrapper overflow) */
  const [open, setOpen] = useState(true);

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, dismiss]);

  if (!open || typeof document === 'undefined') return null;

  const sellerUrl = String(SELLER_APP_URL || 'https://seller.saiisai.com').replace(
    /\/$/,
    ''
  );

  return createPortal(
    <Backdrop role="presentation" onClick={dismiss}>
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-promo-title"
        aria-describedby="seller-promo-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <CloseBtn type="button" aria-label="Close" onClick={dismiss}>
          ×
        </CloseBtn>
        <CardHeader>
          <IconWrap aria-hidden>
            <FaStore />
          </IconWrap>
          <HeaderText>
            <Title id="seller-promo-title">Sell on Saiisai</Title>
            <Sub>Open your shop on Ghana&apos;s marketplace</Sub>
          </HeaderText>
        </CardHeader>
        <Body>
          <Copy id="seller-promo-desc">
            List products, manage orders, and get paid securely with the Saiisai seller
            dashboard—built for shops in Ghana.
          </Copy>
          <Actions>
            <PrimaryLink
              href={sellerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open seller app
            </PrimaryLink>
            <GhostButton type="button" onClick={dismiss}>
              Not now
            </GhostButton>
          </Actions>
        </Body>
      </Card>
    </Backdrop>,
    document.body
  );
};

export default SellerAppPromoModal;
