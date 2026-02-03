import PropTypes from "prop-types";
import styled from "styled-components";
import { devicesMax } from "../../shared/styles/breakpoint";

const BannerSection = styled.section`
  margin: 2.5rem 0;
`;

const BannerLink = styled.a`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const BannerFigure = styled.figure`
  position: relative;
  margin: 0;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, #f2f4f8 0%, #e2e8f0 100%);
  min-height: 220px;

  @media ${devicesMax.md} {
    min-height: 180px;
  }
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  max-height: 380px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;

  ${BannerLink}:hover &,
  ${BannerLink}:focus & {
    transform: scale(1.02);
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(3, 7, 18, 0) 0%,
    rgba(3, 7, 18, 0.6) 100%
  );
`;

const BannerContent = styled.figcaption`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2.25rem 2.5rem;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media ${devicesMax.md} {
    padding: 1.75rem;
  }
`;

const BannerTitle = styled.h3`
  font-size: clamp(1.5rem, 3vw, 2.3rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`;

const BannerSubtitle = styled.p`
  font-size: clamp(0.95rem, 2.3vw, 1.1rem);
  margin: 0;
  max-width: 560px;
  opacity: 0.92;
`;

const BannerCTA = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

const AdBanner = ({ ad, className }) => {
  if (!ad) return null;

  const safeLink = isValidUrl(ad.link);
  const Wrapper = safeLink ? BannerLink : "div";
  const subtitle = ad.subtitle ?? ad.description ?? "";

  return (
    <BannerSection className={className}>
      <Wrapper
        {...(safeLink
          ? {
              href: ad.link,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": ad.title || "Promotional advertisement",
            }
          : {})}
      >
        <BannerFigure>
          {ad.imageUrl ? (
            <BannerImage src={ad.imageUrl} alt={ad.title || "Advertisement"} />
          ) : (
            <BannerOverlay aria-hidden="true" />
          )}
          <BannerOverlay aria-hidden="true" />
          <BannerContent>
            {ad.title ? <BannerTitle>{ad.title}</BannerTitle> : null}
            {subtitle ? <BannerSubtitle>{subtitle}</BannerSubtitle> : null}
            {safeLink ? <BannerCTA>Discover now →</BannerCTA> : null}
          </BannerContent>
        </BannerFigure>
      </Wrapper>
    </BannerSection>
  );
};

AdBanner.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    link: PropTypes.string,
    type: PropTypes.string,
  }),
  className: PropTypes.string,
};

AdBanner.defaultProps = {
  ad: null,
  className: "",
};

export default AdBanner;
