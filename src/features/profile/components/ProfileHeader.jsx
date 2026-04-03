import { useState } from "react";
import styled from "styled-components";
import { FaCheckCircle, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { getAvatarUrl } from "../../../shared/utils/avatarUtils";

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] || '?').toUpperCase();
};

const ProfileHeader = ({ userInfo }) => {
  const [avatarError, setAvatarError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isVerified = userInfo?.emailVerified || userInfo?.phoneVerified;
  const photoUrl = userInfo?.photo ? getAvatarUrl(userInfo.photo) : null;
  const showInitials = !photoUrl || avatarError;

  return (
    <HeaderBanner>
      <BannerOverlay />
      <BannerContent>
        <AvatarWrapper>
          {showInitials ? (
            <AvatarInitials>{getInitials(userInfo?.name)}</AvatarInitials>
          ) : (
            <AvatarImg
              src={photoUrl}
              alt={userInfo?.name || "User"}
              onError={() => setAvatarError(true)}
            />
          )}
          {isVerified && (
            <VerifiedBadge title="Verified account">
              <FaCheckCircle />
            </VerifiedBadge>
          )}
        </AvatarWrapper>

        <UserDetails>
          <NameRow>
            <UserName>{userInfo?.name || "User"}</UserName>
            {isVerified && <VerifiedPill>Verified</VerifiedPill>}
          </NameRow>

          <MetaRow>
            <MetaItem>
              <FaEnvelope />
              <span>{userInfo?.email || "No email"}</span>
            </MetaItem>
            {userInfo?.createdAt && (
              <MetaItem>
                <FaCalendarAlt />
                <span>Member since {formatDate(userInfo.createdAt)}</span>
              </MetaItem>
            )}
          </MetaRow>
        </UserDetails>
      </BannerContent>
    </HeaderBanner>
  );
};

export default ProfileHeader;

/* ─── Styled Components ──────────────────────────────────── */

const HeaderBanner = styled.div`
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, #1A1F2E 0%, #2d3444 50%, #1a2035 100%);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
  min-height: 140px;

  /* Decorative dot pattern */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212,136,42,0.18) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 2rem 2.25rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem 1.25rem;
    gap: 1rem;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #D4882A;
  box-shadow: 0 0 0 3px rgba(212,136,42,0.25);

  @media (max-width: 768px) {
    width: 72px;
    height: 72px;
  }
`;

const AvatarInitials = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  border: 3px solid rgba(255,255,255,0.2);
  box-shadow: 0 0 0 3px rgba(212,136,42,0.25);

  @media (max-width: 768px) {
    width: 72px;
    height: 72px;
    font-size: 1.6rem;
  }
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  background: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid #1A1F2E;
  font-size: 12px;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
`;

const UserName = styled.h1`
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-transform: capitalize;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.35rem;
  }
`;

const VerifiedPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(5, 150, 105, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(5, 150, 105, 0.35);
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.65);
  font-size: 0.85rem;

  svg {
    color: #D4882A;
    flex-shrink: 0;
    font-size: 0.8rem;
  }
`;
