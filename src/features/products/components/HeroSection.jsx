import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { PATHS } from '../../../routes/routePaths';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

// Container and constraints
const HeroWrapper = styled.section`
  position: relative;
  width: 100%;
  height: 600px;
  font-family: 'Inter', sans-serif; /* ENFORCE INTER */
  overflow: hidden;

  /* Custom Swiper Controls */
  .swiper-button-next-custom, .swiper-button-prev-custom {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    color: #1e293b;
    background: white;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: #f8fafc; /* gray-50 */
      transform: translateY(-50%) scale(1.05);
    }
  }

  .swiper-button-prev-custom { left: 24px; }
  .swiper-button-next-custom { right: 24px; }

  .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: white;
    opacity: 0.5;
    &.swiper-pagination-bullet-active {
      opacity: 1;
      background: #ffc400; /* Primary brand color */
      transform: scale(1.2);
    }
  }

  @media (max-width: 768px) {
    height: 500px;
    .swiper-button-prev-custom, .swiper-button-next-custom {
      display: none;
    }
  }
`;

const SlideContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`;

const SlideImageBg = styled.div`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 8s ease;
  
  .swiper-slide-active & {
    transform: scale(1.05);
  }
`;

const SlideOverlay = styled.div`
  position: absolute;
  inset: 0;
  /* Darken overlay for contrast */
  background: linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0) 100%);
`;

const ContentContainer = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 4rem; /* 64px */
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 2rem;
    text-align: center;
  }
`;

const SlideTextContent = styled.div`
  max-width: 600px;
  color: white;

  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const Subtitle = styled.span`
  display: inline-block;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffc400; /* Primary */
  margin-bottom: 1rem;
  
  opacity: 0;
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.6s ease forwards 0.2s;
  }
`;

const Title = styled.h1`
  font-size: 3rem; /* H1 Scale */
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 2rem 0;
  color: white;

  opacity: 0;
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.6s ease forwards 0.4s;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

/* Primary Flat Button Component */
const ButtonStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 8px; /* 8px scale */
  background-color: #ffc400;
  color: #1e293b; /* Secondary */
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 9999px; /* Pill */
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  border: none;
  cursor: pointer;

  opacity: 0;
  .swiper-slide-active & {
    animation: ${fadeInUp} 0.6s ease forwards 0.6s;
  }

  &:hover {
    background-color: #e6b000; /* Primary hover */
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const CTAAnchor = styled.a`
  ${ButtonStyles}
`;

const CTALink = styled(Link)`
  ${ButtonStyles}
`;

const Badge = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: white;
  color: #1e293b;
  padding: 1rem;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  animation: ${float} 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 4px solid #f8fafc;
  
  .percent {
    color: #ef4444; /* Alert color for discount */
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const EndDate = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  background: rgba(15, 23, 42, 0.7); /* Slate backdrop */
  backdrop-filter: blur(8px);
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.875rem; /* Caption */
  font-weight: 400;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::before {
    content: '⏳';
  }
`;

const HeroSection = ({ heroSlides, resolveAdLink, formatPromoEndDate }) => {
  if (!heroSlides || heroSlides.length === 0) return null;

  return (
    <HeroWrapper>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={800}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        loop
        className="w-full h-full"
      >
        {heroSlides.map((slide) => {
          const formattedEnd = slide.endDate ? formatPromoEndDate(slide.endDate) : null;
          let normalizedLink = slide.link ? resolveAdLink(slide.link) : PATHS.PRODUCTS;

          // Double check absolute vs relative safely
          const isExternal = /^https?:\/\//i.test(normalizedLink);

          return (
            <SwiperSlide key={slide.id}>
              <SlideContent>
                <SlideImageBg style={{ backgroundImage: `url(${slide.image})` }} />
                <SlideOverlay />

                {slide.discountPercent > 0 && (
                  <Badge>
                    -<span className="percent">{slide.discountPercent}%</span>
                  </Badge>
                )}

                <ContentContainer>
                  <SlideTextContent>
                    {slide.subtitle && <Subtitle>{slide.subtitle}</Subtitle>}
                    <Title>{slide.title}</Title>
                    {isExternal ? (
                      <CTAAnchor href={normalizedLink} target="_blank" rel="noopener noreferrer">
                        {slide.cta} <FaArrowRight />
                      </CTAAnchor>
                    ) : (
                      <CTALink to={normalizedLink}>
                        {slide.cta} <FaArrowRight />
                      </CTALink>
                    )}
                  </SlideTextContent>
                </ContentContainer>

                {formattedEnd && (
                  <EndDate>Offer ends {formattedEnd}</EndDate>
                )}
              </SlideContent>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button className="swiper-button-prev-custom" aria-label="Previous slide" type="button">
        <FaArrowLeft />
      </button>
      <button className="swiper-button-next-custom" aria-label="Next slide" type="button">
        <FaArrowRight />
      </button>
    </HeroWrapper>
  );
};

export default HeroSection;
