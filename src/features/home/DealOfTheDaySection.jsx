import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaTag } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Container from "../../shared/components/Container";
import ProductCard from "../../shared/components/ProductCard";
import { PATHS } from "../../routes/routePaths";
import DealsCountdown from "../../components/deals/DealsCountdown";
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../../shared/utils/cloudinaryConfig";
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
  padding: 3rem 0;
  background: linear-gradient(135deg, #111827 0%, #1f2937 40%, #111827 100%);
  color: #f9fafb;
`;

const DealHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  display: flex;
  align-items: center;
`;

const DealSwiper = styled(Swiper)`
  .swiper-button-next,
  .swiper-button-prev {
    color: #ffffff;
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 50%;
  }

  .swiper-button-next::after,
  .swiper-button-prev::after {
    font-size: 14px;
    font-weight: 700;
  }

  @media ${devicesMax.sm} {
    .swiper-button-next,
    .swiper-button-prev {
      display: none;
    }
  }
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

function getDealEndDate(product, fallbackDate) {
  return (
    product?.availability?.endDate ||
    product?.promotionEndDate ||
    fallbackDate
  );
}

/**
 * Deal of the Day section for the buyer homepage.
 * - Data-driven: shows multiple deal products as product cards in a slider.
 * - Countdown uses product promo end date, then falls back to end-of-day.
 */
export default function DealOfTheDaySection({
  dealProduct,
  dealProducts = [],
  endOfDay,
}) {
  const productsToShow =
    Array.isArray(dealProducts) && dealProducts.length > 0
      ? dealProducts
      : dealProduct
        ? [dealProduct]
        : [];

  if (productsToShow.length === 0) {
    return (
      <DealBanner as="div" style={{ padding: "1.5rem 0" }}>
        <Container>
          <FallbackBar to={PATHS.DEALS}>
            <FaTag /> View all deals & discounts
          </FallbackBar>
        </Container>
      </DealBanner>
    );
  }

  return (
    <DealBanner>
      <Container>
        <DealHeader>
          <div>
            <DealTag>
              <FaTag /> Deal of the Day
            </DealTag>
            <DealTitle>Today&apos;s best deals</DealTitle>
            <DealDesc>
              Handpicked discounts and promo products, updated daily.
            </DealDesc>
          </div>
          <CountdownWrap>
            <DealsCountdown
              endDate={getDealEndDate(productsToShow[0], endOfDay)}
              message="Deals end in:"
            />
          </CountdownWrap>
        </DealHeader>

        <DealSwiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1.15}
          spaceBetween={16}
          navigation={productsToShow.length > 1}
          loop={productsToShow.length > 1}
          autoplay={
            productsToShow.length > 1
              ? { delay: 5200, disableOnInteraction: false }
              : false
          }
          breakpoints={{
            640: { slidesPerView: 2.1, spaceBetween: 16 },
            900: { slidesPerView: 3, spaceBetween: 18 },
            1200: { slidesPerView: 4, spaceBetween: 20 },
          }}
        >
          {productsToShow.map((product) => {
            const productId = String(product?._id || product?.id || "");

            return (
              <SwiperSlide key={productId || product.name}>
                <ProductCard
                  product={product}
                  showAddToCart
                  showWishlistButton
                />
              </SwiperSlide>
            );
          })}
        </DealSwiper>

        <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
          <CtaButton to={PATHS.DEALS}>View all deals</CtaButton>
        </div>
      </Container>
    </DealBanner>
  );
}
