import PropTypes from "prop-types";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { devicesMax } from "../../shared/styles/breakpoint";

const CarouselSection = styled.section`
  margin: 2.5rem 0;
`;

const SlideLink = styled.a`
  display: block;
  position: relative;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5f5 100%);
  min-height: 240px;

  @media ${devicesMax.md} {
    min-height: 200px;
  }
`;

const SlideBackground = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: transparent;
  transition: transform 0.6s ease;

  ${SlideLink}:hover &,
  ${SlideLink}:focus & {
    transform: scale(1.05);
  }
`;

const SlideOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    150deg,
    rgba(17, 24, 39, 0.75) 0%,
    rgba(17, 24, 39, 0.15) 100%
  );
`;

const SlideContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
  color: #ffffff;
  gap: 0.5rem;

  @media ${devicesMax.md} {
    padding: 1.5rem;
  }
`;

const SlideTitle = styled.h3`
  margin: 0;
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  font-weight: 700;
  line-height: 1.3;
`;

const SlideMeta = styled.span`
  font-size: 0.95rem;
  opacity: 0.85;
`;

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const AdCarousel = ({ ads, className }) => {
  if (!Array.isArray(ads) || ads.length === 0) {
    return null;
  }

  return (
    <CarouselSection className={className}>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {ads.map((ad) => {
          const key = ad.id || ad._id || ad.link || ad.title;
          const safeLink = isValidUrl(ad.link);
          const Wrapper = safeLink ? SlideLink : "div";
          const subtitle = ad.subtitle ?? ad.description ?? "";

          return (
            <SwiperSlide key={key}>
              <Wrapper
                {...(safeLink
                  ? {
                    href: ad.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                  : {})}
              >
                {ad.imageUrl ? (
                  <SlideBackground
                    src={ad.imageUrl}
                    alt={ad.title || "Advertisement"}
                    loading="lazy"
                  />
                ) : null}
                <SlideOverlay aria-hidden="true" />
                <SlideContent>
                  {ad.title ? <SlideTitle>{ad.title}</SlideTitle> : null}
                  {subtitle ? <SlideMeta>{subtitle}</SlideMeta> : null}
                </SlideContent>
              </Wrapper>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </CarouselSection>
  );
};

AdCarousel.propTypes = {
  ads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      link: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  className: PropTypes.string,
};

AdCarousel.defaultProps = {
  ads: [],
  className: "",
};

export default AdCarousel;
