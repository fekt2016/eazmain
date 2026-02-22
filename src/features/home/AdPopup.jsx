import { useEffect } from "react";
import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { devicesMax } from "../../shared/styles/breakpoint";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PopupBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  z-index: 9999;
`;

const PopupCard = styled.article`
  position: relative;
  width: min(420px, 100%);
  background: var(--bg-surface);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
  overflow: hidden;
  animation: ${fadeIn} 220ms ease;

  @media ${devicesMax.sm} {
    width: 100%;
  }
`;

const PopupImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;

  @media ${devicesMax.sm} {
    height: 200px;
  }
`;

const PopupBody = styled.div`
  padding: 1.75rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media ${devicesMax.sm} {
    padding: 1.5rem 1.5rem 1.75rem;
  }
`;

const PopupTitle = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.4;
  color: var(--color-grey-900);
`;

const PopupSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-grey-600);
  line-height: 1.5;
`;

const PopupActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: var(--color-grey-900);
  color: var(--color-white-0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 12px 20px rgba(17, 24, 39, 0.15);
  }
`;

const DismissButton = styled.button`
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: var(--color-grey-800);
    text-decoration-color: currentColor;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: rgba(15, 23, 42, 0.55);
  color: var(--color-grey-50);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover,
  &:focus-visible {
    background: rgba(15, 23, 42, 0.75);
  }
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

const AdPopup = ({ ad, open, onDismiss }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onDismiss?.(ad, { reason: "escape" });
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ad, open, onDismiss]);

  if (!ad || !open) {
    return null;
  }

  // Normalize the link using FRONTEND_URL
  const normalizedLink = normalizeAdLink(ad.link);
  const safeLink = isValidUrl(normalizedLink);
  const subtitle = ad.subtitle ?? ad.description ?? "";
  const handleDismiss = (reason = "close") => onDismiss?.(ad, { reason });

  return (
    <PopupBackdrop role="presentation" onClick={() => handleDismiss("backdrop")}>
      <PopupCard
        role="dialog"
        aria-modal="true"
        aria-label={ad.title || "Promotional offer"}
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton
          type="button"
          aria-label="Dismiss advertisement"
          onClick={() => handleDismiss("close")}
        >
          ×
        </CloseButton>

        {ad.imageUrl ? (
          <PopupImage src={ad.imageUrl} alt={ad.title || "Advertisement"} />
        ) : null}

        <PopupBody>
          {ad.title ? <PopupTitle>{ad.title}</PopupTitle> : null}
          {subtitle ? <PopupSubtitle>{subtitle}</PopupSubtitle> : null}

          <PopupActions>
            {safeLink ? (
              <ActionButton
                href={normalizedLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDismiss("cta")}
              >
                Learn more
              </ActionButton>
            ) : null}
            <DismissButton type="button" onClick={() => handleDismiss("dismiss")}>
              Maybe later
            </DismissButton>
          </PopupActions>
        </PopupBody>
      </PopupCard>
    </PopupBackdrop>
  );
};

AdPopup.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    link: PropTypes.string,
    type: PropTypes.string,
  }),
  open: PropTypes.bool,
  onDismiss: PropTypes.func,
};

AdPopup.defaultProps = {
  ad: null,
  open: false,
  onDismiss: undefined,
};

export default AdPopup;
