import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import styled from "styled-components";

export default function StarRating({ rating }) {
  // Clamp rating between 0 and 5
  const clampedRating = Math.min(Math.max(rating, 0), 5);

  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <StarContainer>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} $filled={true}>
          <FaStar />
        </Star>
      ))}
      {hasHalfStar && (
        <Star key="half" $filled={true}>
          <FaStarHalfAlt />
        </Star>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} $filled={false}>
          <FaStar />
        </Star>
      ))}
    </StarContainer>
  );
}

const StarContainer = styled.div`
  display: flex;
`;

const Star = styled.span`
  color: ${(props) => (props.$filled ? "#ffc107" : "#e0e0e0")};
  margin-right: 3px;
  display: flex;
  align-items: center;
`;
