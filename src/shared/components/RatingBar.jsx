// src/components/RatingBar.js
import styled from "styled-components";

const RatingBar = ({ rating, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <RatingBarContainer>
      <RatingLabel>{rating} Star</RatingLabel>
      <BarContainer>
        <BarFill $width={percentage} />
      </BarContainer>
      <RatingCount>{count}</RatingCount>
    </RatingBarContainer>
  );
};

export default RatingBar;

const RatingBarContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const RatingLabel = styled.div`
  width: 7rem;
  font-size: 1.4rem;
  color: var(--color-grey-800);
`;

const BarContainer = styled.div`
  flex: 1;
  height: 0.8rem;
  background: #eaecf4;
  border-radius: var(--border-radius-tiny);
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background-color: var(--color-brand-500);
  width: ${(props) => props.$width}%;
  transition: width 0.5s ease;
`;

const RatingCount = styled.div`
  width: 40px;
  text-align: right;
  font-size: 1.4rem;
  color: var(--color-grey-800);
`;
