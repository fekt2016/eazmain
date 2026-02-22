import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaTag } from "react-icons/fa";
import Container from "../../shared/components/Container";
import { PATHS } from "../../routes/routePaths";
import DealsCountdown from "../../components/deals/DealsCountdown";
import {
  getProductDisplayPrice,
  getProductOriginalPrice,
  getProductDiscountPercentage,
  getProductImages,
} from "../../shared/utils/productHelpers";
import { devicesMax } from "../../shared/styles/breakpoint";

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

const DealBanner = styled.section`
  position: relative;
  padding: 4rem 0;
  min-height: 280px;
  color: white;
  text-align: center;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-color: var(--color-grey-800, #1e293b);
`;

const DealOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
`;

const DealContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
`;

const DealTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--error);
  color: white;
  padding: 0.4rem 1.25rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  animation: ${float} 2.5s ease-in-out infinite;
`;

const DealTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const DealDesc = styled.p`
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DealPrice = styled.div`
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
`;

const DealPriceCurrent = styled.span`
  font-weight: 800;
  margin-right: 0.5rem;
`;

const DealPriceOriginal = styled.span`
  text-decoration: line-through;
  opacity: 0.85;
  margin-right: 0.5rem;
`;

const DealDiscountBadge = styled.span`
  display: inline-block;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 700;
`;

const CtaButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: white;
  color: var(--color-grey-900);
  font-weight: 700;
  text-decoration: none;
  border-radius: 50px;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CountdownWrap = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

const FallbackBar = styled(Link)`
  display: block;
  text-align: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--error) 0%, var(--primary-600) 100%);
  color: white;
  text-decoration: none;
  font-weight: 700;
  border-radius: 12px;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.95;
    color: white;
  }
`;

/**
 * Deal of the Day section for the buyer homepage.
 * - Data-driven: shows the single best deal (highest discount or promotionKey 'deal-of-the-day').
 * - Countdown to end of day (midnight) for urgency.
 * - CTA links to the product page or, when no deal, to the deals page.
 */
export default function DealOfTheDaySection({ dealProduct, endOfDay }) {
  if (!dealProduct) {
    return (
      <DealBanner as="div" style={{ padding: "1.5rem 0", minHeight: "auto" }}>
        <Container>
          <FallbackBar to={PATHS.DEALS}>
            <FaTag /> View all deals & discounts
          </FallbackBar>
        </Container>
      </DealBanner>
    );
  }

  const displayPrice = getProductDisplayPrice(dealProduct);
  const originalPrice = getProductOriginalPrice(dealProduct);
  const discountPct = getProductDiscountPercentage(dealProduct);
  const images = getProductImages(dealProduct);
  const coverImage = images[0] || null;
  const productUrl = PATHS.PRODUCT.replace(':id', dealProduct._id);

  return (
    <DealBanner
      style={
        coverImage
          ? { backgroundImage: `url(${coverImage})` }
          : undefined
      }
    >
      <DealOverlay />
      <Container>
        <DealContent>
          <DealTag>
            <FaTag /> Deal of the Day
          </DealTag>
          <DealTitle>{dealProduct.name}</DealTitle>
          {(dealProduct.shortDescription || dealProduct.description) && (
            <DealDesc>
              {dealProduct.shortDescription ||
                (typeof dealProduct.description === "string"
                  ? dealProduct.description.slice(0, 120) + (dealProduct.description.length > 120 ? "…" : "")
                  : "")}
            </DealDesc>
          )}
          <DealPrice>
            <DealPriceCurrent>GH₵{Number(displayPrice).toFixed(2)}</DealPriceCurrent>
            {originalPrice > displayPrice && (
              <DealPriceOriginal>GH₵{Number(originalPrice).toFixed(2)}</DealPriceOriginal>
            )}
            {discountPct > 0 && (
              <DealDiscountBadge>{discountPct}% off</DealDiscountBadge>
            )}
          </DealPrice>
          <CountdownWrap>
            <DealsCountdown
              endDate={endOfDay}
              message="Deal ends in:"
            />
          </CountdownWrap>
          <CtaButton to={productUrl}>Shop this deal</CtaButton>
        </DealContent>
      </Container>
    </DealBanner>
  );
}
