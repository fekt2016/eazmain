import React from "react";
import styled from "styled-components";

const RatingStars = ({ rating }) => {
  // Calculate full stars and whether there's a half star
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <StarsContainer>
      {[...Array(5)].map((_, index) => {
        if (index < fullStars) {
          return <FullStar key={index}>★</FullStar>;
        } else if (index === fullStars && hasHalfStar) {
          return <HalfStar key={index}>★</HalfStar>;
        } else {
          return <EmptyStar key={index}>☆</EmptyStar>;
        }
      })}
      <RatingValue>({rating.toFixed(1)})</RatingValue>
    </StarsContainer>
  );
};

// Styled components
const StarsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const BaseStar = styled.span`
  font-size: 1.6rem;
  margin-right: 0.2rem;
`;

const FullStar = styled(BaseStar)`
  color: var(--color-bitcoin-900);
`;

const HalfStar = styled(BaseStar)`
  color: var(--color-bitcoin-900);
  position: relative;

  &::after {
    content: "☆";
    position: absolute;
    left: 0;
    color: var(--color-grey-300);
    clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
  }
`;

const EmptyStar = styled(BaseStar)`
  color: var(--color-grey-300);
`;

const RatingValue = styled.span`
  margin-left: 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

export default RatingStars;
