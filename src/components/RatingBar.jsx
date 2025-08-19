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
  margin-bottom: 10px;
  gap: 10px;
`;

const RatingLabel = styled.div`
  width: 70px;
  font-size: 14px;
  color: #2e3a59;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #eaecf4;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: #4e73df;
  width: ${(props) => props.$width}%;
  transition: width 0.5s ease;
`;

const RatingCount = styled.div`
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #858796;
`;
