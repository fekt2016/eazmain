import { useMemo, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaStarHalfAlt,
  FaBoxOpen,
  FaCalendar,
  FaShoppingBag,
  FaEdit,
  FaClock,
  FaQuoteLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/routePaths";
import { useGetProductReviews, useGetMyReviews } from '../../shared/hooks/useReview';
import useAuth from '../../shared/hooks/useAuth';
import { LoadingState, ErrorState } from '../../components/loading';
import { devicesMax } from '../../shared/styles/breakpoint';
import Container from '../../shared/components/Container';

export default function CustomerReviewPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const helpSectionRef = useRef(null);

  const isProductReviewsPage = !!productId;

  const { data: productReviewData, isLoading: isProductLoading } = useGetProductReviews(productId, {
    enabled: isProductReviewsPage,
  });
  const { data: myReviewData, isLoading: isMyReviewsLoading } = useGetMyReviews(
    {},
    { enabled: !isProductReviewsPage }
  );

  const { userData } = useAuth();
  const user = userData?.user || userData?.data || null;

  const userReviews = useMemo(() => {
    if (isProductReviewsPage) {
      const reviews = productReviewData?.data?.data?.reviews || [];
      if (!user || !reviews.length) return [];
      return reviews.filter(
        (r) => r.user?._id === user.id || r.user === user.id
      );
    }
    return myReviewData?.data?.data?.reviews || myReviewData?.data?.reviews || [];
  }, [isProductReviewsPage, productReviewData, myReviewData, user]);

  const isLoading = isProductReviewsPage ? isProductLoading : isMyReviewsLoading;

  // Calculate review stats
  const reviewStats = useMemo(() => {
    if (!userReviews.length) return null;
    const totalRatings = userReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRatings / userReviews.length).toFixed(1);
    
    const ratingDistribution = Array(5).fill(0);
    userReviews.forEach(review => {
      ratingDistribution[5 - review.rating]++;
    });

    return {
      total: userReviews.length,
      average: averageRating,
      distribution: ratingDistribution
    };
  }, [userReviews]);

  // Render stars for display
  const renderStars = (rating, size = "medium") => {
    const sizes = {
      small: "1.4rem",
      medium: "1.8rem",
      large: "2.4rem"
    };

    return (
      <StarContainer $size={sizes[size]}>
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;

          return (
            <Star key={index} $filled={isFilled || isHalf}>
              {isFilled ? <FaStar /> : isHalf ? <FaStarHalfAlt /> : <FaRegStar />}
            </Star>
          );
        })}
      </StarContainer>
    );
  };

  const getReviewStatus = (reviewDate) => {
    const now = new Date();
    const review = new Date(reviewDate);
    const diffTime = Math.abs(now - review);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return { type: 'new', text: 'New Review' };
    if (diffDays <= 30) return { type: 'recent', text: 'Recent' };
    return { type: 'old', text: 'Older Review' };
  };

  if (isLoading) return <LoadingState message="Loading your reviews..." />;

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>My Reviews</Title>
            <Subtitle>Your feedback and ratings for purchased products</Subtitle>
          </TitleSection>
          
          {reviewStats && (
            <StatsGrid>
              <StatCard>
                <StatIcon>
                  <FaStar />
                </StatIcon>
                <StatContent>
                  <StatValue>{reviewStats.average}</StatValue>
                  <StatLabel>Average Rating</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <FaEdit />
                </StatIcon>
                <StatContent>
                  <StatValue>{reviewStats.total}</StatValue>
                  <StatLabel>Total Reviews</StatLabel>
                </StatContent>
              </StatCard>
            </StatsGrid>
          )}
        </HeaderContent>
      </HeaderSection>

      <ContentSection>
        {userReviews.length > 0 ? (
          <ReviewContent>
            <SectionHeader>
              <SectionTitle>Your Product Reviews ({userReviews.length})</SectionTitle>
              <SortFilter>
                <FilterLabel>Sort by:</FilterLabel>
                <FilterSelect>
                  <option>Most Recent</option>
                  <option>Highest Rated</option>
                  <option>Lowest Rated</option>
                </FilterSelect>
              </SortFilter>
            </SectionHeader>

            <ReviewGrid>
              {userReviews.map((review) => {
                const reviewDate = review.reviewDate || review.createdAt;
                const status = getReviewStatus(reviewDate);
                const productImage = review.product?.imageCover || review.product?.image || '/placeholder-product.png';
                const productName = review.product?.name || 'Product';
                const reviewText = review.review || review.comment || '';
                
                return (
                  <ReviewCard key={review._id}>
                    <CardHeader>
                      <ProductImage
                        src={productImage}
                        alt={productName}
                      />
                      <ProductInfo>
                        <ProductName>{productName}</ProductName>
                        <ProductMeta>
                          {review.order?.orderNumber && (
                            <MetaItem>
                              <FaCalendar />
                              <span>Order #{review.order.orderNumber}</span>
                            </MetaItem>
                          )}
                          {reviewDate && (
                            <MetaItem>
                              <FaClock />
                              <span>Reviewed {new Date(reviewDate).toLocaleDateString()}</span>
                            </MetaItem>
                          )}
                        </ProductMeta>
                      </ProductInfo>
                      <ReviewStatus $type={status.type}>
                        {status.text}
                      </ReviewStatus>
                    </CardHeader>

                    <ReviewBody>
                      <ReviewRating>
                        {renderStars(review.rating, "medium")}
                        <RatingValue>{review.rating}/5</RatingValue>
                      </ReviewRating>
                      
                      <ReviewTitle>{review.title || "Review"}</ReviewTitle>
                      <ReviewContentText>
                        <QuoteIcon>
                          <FaQuoteLeft />
                        </QuoteIcon>
                        {reviewText}
                      </ReviewContentText>
                    </ReviewBody>

                    <CardFooter>
                      <ReviewDate>
                        <FaClock />
                        Reviewed on {reviewDate ? new Date(reviewDate).toLocaleDateString() : 'N/A'}
                      </ReviewDate>
                      <ActionButtons>
                        <EditButton>
                          <FaEdit />
                          Edit Review
                        </EditButton>
                      </ActionButtons>
                    </CardFooter>
                  </ReviewCard>
                );
              })}
            </ReviewGrid>
          </ReviewContent>
        ) : (
          <EmptyState>
            <EmptyIllustration>
              <FaBoxOpen />
            </EmptyIllustration>
            <EmptyContent>
              <EmptyTitle>No Reviews Yet</EmptyTitle>
              <EmptyMessage>
                You haven't reviewed any products from your orders
              </EmptyMessage>
              
              <HelpSection ref={helpSectionRef}>
                <HelpTitle>How to review products:</HelpTitle>
                <StepsGrid>
                  <StepItem>
                    <StepNumber>1</StepNumber>
                    <StepContent>
                      <StepTitle>Go to Order History</StepTitle>
                      <StepDescription>Navigate to your past orders</StepDescription>
                    </StepContent>
                  </StepItem>
                  <StepItem>
                    <StepNumber>2</StepNumber>
                    <StepContent>
                      <StepTitle>Find Your Product</StepTitle>
                      <StepDescription>Locate the product you want to review</StepDescription>
                    </StepContent>
                  </StepItem>
                  <StepItem>
                    <StepNumber>3</StepNumber>
                    <StepContent>
                      <StepTitle>Write Your Review</StepTitle>
                      <StepDescription>Click "Write Review" and share your experience</StepDescription>
                    </StepContent>
                  </StepItem>
                </StepsGrid>
              </HelpSection>

              <ActionSection>
                <PrimaryButton
                  type="button"
                  onClick={() => navigate(PATHS.ORDERS)}
                  aria-label="Go to your order history"
                >
                  <FaShoppingBag />
                  View Order History
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => helpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  aria-label="Learn how to write reviews"
                >
                  <FaInfoCircle />
                  Learn about reviewing
                </SecondaryButton>
              </ActionSection>
            </EmptyContent>
          </EmptyState>
        )}
      </ContentSection>
    </PageContainer>
  );
}

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.section`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media ${devicesMax.md} {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    width: 100%;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: var(--color-white-0);
  padding: 1.6rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  min-width: 20rem;

  @media ${devicesMax.sm} {
    min-width: auto;
  }
`;

const StatIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1.6rem;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  font-weight: 500;
  margin-top: 0.4rem;
`;

const ContentSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
`;

const ReviewContent = styled.div`
  padding: 2.4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
    gap: 1.6rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const SortFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const FilterLabel = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const FilterSelect = styled.select`
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
  }
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const ReviewCard = styled.div`
  background: var(--color-white-0);
  border-radius: 20px;
  border: 1px solid var(--color-grey-200);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-200);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 2rem;
  background: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  position: relative;
`;

const ProductImage = styled.img`
  width: 6rem;
  height: 6rem;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--color-white-0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
  line-height: 1.3;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  color: var(--color-grey-600);

  svg {
    width: 1.2rem;
    opacity: 0.7;
  }
`;

const ReviewStatus = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.$type) {
      case 'new':
        return `
          background: var(--color-green-100);
          color: var(--color-green-700);
        `;
      case 'recent':
        return `
          background: var(--color-blue-100);
          color: var(--color-blue-700);
        `;
      default:
        return `
          background: var(--color-grey-100);
          color: var(--color-grey-600);
        `;
    }
  }}
`;

const ReviewBody = styled.div`
  padding: 2rem;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.6rem;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 0.2rem;
  font-size: ${props => props.$size};
`;

const Star = styled.span`
  color: ${props => props.$filled ? "var(--color-yellow-500)" : "var(--color-grey-300)"};
  display: flex;
  align-items: center;
`;

const RatingValue = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
  background: var(--color-grey-100);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
`;

const ReviewTitle = styled.h4`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.2rem;
  line-height: 1.3;
`;

const ReviewContentText = styled.p`
  color: var(--color-grey-700);
  line-height: 1.6;
  font-size: 1.4rem;
  position: relative;
  padding-left: 2rem;
`;

const QuoteIcon = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  color: var(--color-grey-300);
  font-size: 1.6rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 2rem;
  background: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1.2rem;
    align-items: stretch;
  }
`;

const ReviewDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.2rem;
  color: var(--color-grey-600);

  svg {
    width: 1.2rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    color: var(--primary-700);
  }

  svg {
    width: 1.2rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6.4rem 2.4rem;
  text-align: center;
`;

const EmptyIllustration = styled.div`
  width: 12rem;
  height: 12rem;
  background: linear-gradient(135deg, var(--color-grey-100) 0%, var(--color-grey-200) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.8rem;
  color: var(--color-grey-400);
  margin-bottom: 2.4rem;
`;

const EmptyContent = styled.div`
  max-width: 60rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  margin-bottom: 3.2rem;
  line-height: 1.5;
`;

const HelpSection = styled.div`
  background: var(--color-grey-50);
  border-radius: 16px;
  padding: 2.4rem;
  margin-bottom: 3.2rem;
  text-align: left;
`;

const HelpTitle = styled.h4`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 1.6rem;
  text-align: center;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.6rem;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
`;

const StepNumber = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const StepDescription = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  line-height: 1.4;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  flex-wrap: wrap;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }

  svg {
    font-size: 1.4rem;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }

  svg {
    font-size: 1.4rem;
    flex-shrink: 0;
  }
`;