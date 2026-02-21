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
  object-fit: contain;
  background-color: transparent;
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

// Helper to normalize ad link using FRONTEND_URL environment variable
// In development: Keeps localhost URLs as localhost
// In production: Replaces localhost URLs with production domain
const normalizeAdLink = (link) => {
  if (!link || typeof link !== 'string') return link;

  const trimmedLink = link.trim();
  const currentOrigin = window.location.origin;
  const isProduction = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(currentOrigin);

  // In DEVELOPMENT: Keep localhost URLs as-is
  if (!isProduction) {
    // If it's already a full URL (including localhost), return as-is
    if (/^https?:\/\//i.test(trimmedLink)) {
      return trimmedLink;
    }
    // If it's a relative path, prepend current origin (localhost)
    const cleanLink = trimmedLink.replace(/^\//, '');
    return `${currentOrigin}/${cleanLink}`;
  }

  // In PRODUCTION: Replace localhost URLs with production domain
  // Priority: VITE_FRONTEND_URL > VITE_API_URL (without /api) > window.location.origin
  let frontendUrl = import.meta.env.VITE_FRONTEND_URL;

  // Ignore localhost env vars in production
  if (frontendUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(frontendUrl)) {
    frontendUrl = null;
  }

  // If VITE_FRONTEND_URL is not set, try to derive from VITE_API_URL or VITE_API_BASE_URL
  if (!frontendUrl) {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (apiUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiUrl)) {
      // Remove /api and trailing slashes to get frontend URL
      frontendUrl = apiUrl.replace(/\/api\/?.*$/, '').replace(/\/$/, '');
    }
  }

  // Fallback to window.location.origin in production
  if (!frontendUrl) {
    frontendUrl = currentOrigin;
  }

  const cleanFrontendUrl = frontendUrl.trim().replace(/\/$/, ''); // Remove trailing slash

  // If it's a localhost URL, replace it with production URL
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(trimmedLink)) {
    // Extract the path from localhost URL
    try {
      const url = new URL(trimmedLink);
      const path = url.pathname + url.search + url.hash;
      return `${cleanFrontendUrl}${path}`;
    } catch (error) {
      // If URL parsing fails, try to extract path manually
      const pathMatch = trimmedLink.match(/^https?:\/\/[^\/]+(\/.*)?$/);
      const path = pathMatch && pathMatch[1] ? pathMatch[1] : '/';
      return `${cleanFrontendUrl}${path}`;
    }
  }

  // If it's already an absolute URL (and not localhost), return as-is
  if (/^https?:\/\//i.test(trimmedLink)) {
    return trimmedLink;
  }

  // If it's a relative path, prepend FRONTEND_URL
  const cleanLink = trimmedLink.replace(/^\//, ''); // Remove leading slash from link
  return `${cleanFrontendUrl}/${cleanLink}`;
};

const AdBanner = ({ ad, className }) => {
  if (!ad) return null;

  // Normalize the link using FRONTEND_URL
  const normalizedLink = normalizeAdLink(ad.link);
  const safeLink = isValidUrl(normalizedLink);
  const Wrapper = safeLink ? BannerLink : "div";
  const subtitle = ad.subtitle ?? ad.description ?? "";

  return (
    <BannerSection className={className}>
      <Wrapper
        {...(safeLink
          ? {
            href: normalizedLink,
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
