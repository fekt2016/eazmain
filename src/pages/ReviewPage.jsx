import { useMemo } from "react";
import styled from "styled-components";
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaStarHalfAlt,
  FaBoxOpen,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetProductReviews } from "../hooks/useReview";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CustomerReviewPage() {
  const { id: productId } = useParams();
  const { data: reviewData, isLoading } = useGetProductReviews(productId);
  const { userData } = useAuth();

  const user = userData?.user || userData?.data || null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviews = reviewData?.data?.data.reviews || [];

  // Filter to only show current user's reviews
  const userReviews = useMemo(() => {
    if (!user || !reviews.length) return [];
    return reviews.filter(
      (review) => review.user._id === user.id || review.user === user.id
    );
  }, [user, reviews]);

  // Render stars for display
  const renderStars = (rating, small = false) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isFilled = rating >= starValue;
      const isHalf = rating >= starValue - 0.5 && rating < starValue;

      return (
        <Star key={index} $small={small} $filled={isFilled || isHalf}>
          {isFilled ? <FaStar /> : isHalf ? <FaStarHalfAlt /> : <FaRegStar />}
        </Star>
      );
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ReviewsContainer>
      <PageHeader>
        <FaBoxOpen size={24} />
        <h2>Your Product Reviews</h2>
        <p>Reviews for products you've ordered</p>
      </PageHeader>

      {userReviews.length > 0 ? (
        <ReviewList>
          {userReviews.map((review) => (
            <ReviewItem key={review._id}>
              <ProductInfo>
                <ProductImage
                  src={review.product.image}
                  alt={review.product.name}
                />
                <div>
                  <ProductName>{review.product.name}</ProductName>
                  <OrderDate>
                    Ordered on:{" "}
                    {new Date(review.orderDate).toLocaleDateString()}
                  </OrderDate>
                </div>
              </ProductInfo>

              <ReviewHeader>
                <ReviewRating>{renderStars(review.rating, true)}</ReviewRating>
                <ReviewDate>
                  Reviewed on:{" "}
                  {new Date(review.reviewDate).toLocaleDateString()}
                </ReviewDate>
              </ReviewHeader>

              <ReviewTitle>{review.title}</ReviewTitle>
              <ReviewContent>{review.comment}</ReviewContent>
            </ReviewItem>
          ))}
        </ReviewList>
      ) : (
        <NoReviews>
          <FaRegStar size={48} />
          <h4>No reviews yet</h4>
          <p>You haven't reviewed any products you've ordered</p>
          <HelpText>
            To review a product:
            <ol>
              <li>Go to your order history</li>
              <li>Find the product you want to review</li>
              <li>Click "Write a Review" next to that product</li>
            </ol>
          </HelpText>
        </NoReviews>
      )}
    </ReviewsContainer>
  );
}

// Styled Components
const ReviewsContainer = styled.section`
  margin: 40px 0;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaecf4;

  h2 {
    font-size: 24px;
    color: #2e3a59;
    margin: 10px 0 5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    color: #6c757d;
    margin: 0;
  }
`;

const ReviewList = styled.div`
  margin-top: 20px;
`;

const ReviewItem = styled.div`
  padding: 25px 0;
  border-bottom: 1px solid #eaecf4;

  &:last-child {
    border-bottom: none;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #eaecf4;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #2e3a59;
`;

const OrderDate = styled.div`
  font-size: 14px;
  color: #858796;
  margin-top: 5px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewDate = styled.div`
  font-size: 14px;
  color: #858796;
`;

const ReviewTitle = styled.h3`
  font-size: 18px;
  color: #2e3a59;
  margin: 0 0 10px 0;
`;

const ReviewContent = styled.p`
  color: #4d4d4d;
  line-height: 1.6;
  margin: 0;
`;

const Star = styled.span`
  color: ${(props) => (props.$filled ? "#ffc107" : "#e0e0e0")};
  display: flex;
  align-items: center;
  font-size: ${(props) => (props.$small ? "14px" : "16px")};
`;

const NoReviews = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  border: 1px dashed #eaecf4;
  border-radius: 10px;

  h4 {
    margin: 15px 0 5px;
    font-size: 18px;
  }

  p {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const HelpText = styled.div`
  text-align: left;
  max-width: 500px;
  margin: 20px auto 0;
  padding: 15px;
  background: #f8f9fc;
  border-radius: 8px;

  ol {
    padding-left: 20px;
    margin: 10px 0 0;

    li {
      margin-bottom: 8px;
    }
  }
`;
