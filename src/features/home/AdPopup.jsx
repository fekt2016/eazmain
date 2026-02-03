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
  background: #ffffff;
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
  color: #0f172a;
`;

const PopupSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
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
  background: #111827;
  color: #ffffff;
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
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: #1f2937;
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
  color: #f8fafc;
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

  const safeLink = isValidUrl(ad.link);
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
                href={ad.link}
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
