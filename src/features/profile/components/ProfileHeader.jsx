import styled from "styled-components";
import { FaCheckCircle } from "react-icons/fa";
import { getAvatarUrl } from "../../../shared/utils/avatarUtils";

const ProfileHeader = ({ userInfo }) => {
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

  return (
    <HeaderContainer>
      <AvatarWrapper>
        <Avatar
          src={getAvatarUrl(userInfo?.photo)}
          alt={userInfo?.name || "User"}
          onError={(e) => {
            // Fallback to default if image fails to load
            e.target.src = "/img/users/default.jpg";
          }}
        />
        {isVerified && (
          <VerifiedBadge>
            <FaCheckCircle />
          </VerifiedBadge>
        )}
      </AvatarWrapper>
      <UserInfo>
        <UserName>{userInfo?.name || "User"}</UserName>
        <UserEmail>{userInfo?.email || "No email"}</UserEmail>
        {userInfo?.createdAt && (
          <JoinDate>Member since {formatDate(userInfo.createdAt)}</JoinDate>
        )}
      </UserInfo>
    </HeaderContainer>
  );
};

export default ProfileHeader;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--color-bg-card);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-xl);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: var(--space-lg);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid var(--color-bg-card);
  font-size: 14px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const UserEmail = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 16px;
  color: var(--color-text-light);
  margin: 0 0 var(--space-sm) 0;
`;

const JoinDate = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
`;

