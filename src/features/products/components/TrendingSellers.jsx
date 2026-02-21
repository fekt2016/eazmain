import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import { PATHS } from '../../../routes/routePaths';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const SectionWrapper = styled.section`
  padding: 4rem 1rem; /* py-16 */
  background: #f8fafc; /* gray-50 */
  font-family: 'Inter', sans-serif;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem; /* H2 */
  font-weight: 700;
  color: #0f172a; /* gray-900 */
  margin: 0;
`;

const SectionLink = styled(Link)`
  color: #1e293b; /* Secondary */
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffc400; /* Primary hover */
    gap: 12px;
  }
`;

const SellerCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px; /* strict rounded-xl */
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  border: 1px solid #f1f5f9; /* gray-100 */
  transition: all 0.2s ease;
  height: 100%;

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
    transform: translateY(-2px);
    border-color: #e2e8f0;
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #10b981; /* Default success color */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  border: 2px solid white;
`;

const SellerInfo = styled.div`
  flex: 1;
  min-width: 0; /* for text truncation */
`;

const SellerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b; /* muted text */
  font-size: 0.875rem;

  svg {
    color: #ffc400; /* Primary stars */
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const ProductPreviewText = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8; /* gray-400 */
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
`;

const ImagesWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  height: 80px;
`;

const PreviewImage = styled.div`
  flex: 1;
  border-radius: 8px;
  background-color: #f1f5f9;
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
`;

const ShopButtonWrapper = styled.div`
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.875rem;
  border-top: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  ${SellerCard}:hover & {
    background: #ffc400; /* Primary hover effect inside card constraint */
    color: #1e293b;
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const TrendingSellers = ({ sellers, isLoading }) => {
    if (!isLoading && (!sellers || sellers.length === 0)) {
        return null;
    }

    return (
        <SectionWrapper>
            <Container>
                <SectionHeader>
                    <SectionTitle>Trending Sellers</SectionTitle>
                    <SectionLink to={PATHS.SELLERS}>
                        View All Sellers <FaArrowRight />
                    </SectionLink>
                </SectionHeader>

                {isLoading ? (
                    <SkeletonGrid>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '300px', background: '#f1f5f9', borderRadius: '12px' }} />
                        ))}
                    </SkeletonGrid>
                ) : (
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={24} /* gap-6 equivalent */
                        slidesPerView={1}
                        navigation
                        autoplay={{ delay: 4000, disableOnInteraction: true }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                        }}
                        /* Additional padding to prevent shadow clipping */
                        style={{ padding: '0.5rem' }}
                    >
                        {sellers.map((seller) => {
                            const productImages = seller.products
                                ?.flatMap((product) => product.images || [])
                                ?.filter((img) => img)
                                ?.slice(0, 3) || [];

                            const rating = seller.averageRating || seller.rating || 5.0;

                            return (
                                <SwiperSlide key={seller.id || seller._id}>
                                    <SellerCard to={`${PATHS.SELLERS}/${seller.id || seller._id}`}>
                                        <CardHeader>
                                            <AvatarWrapper>
                                                <Avatar
                                                    src={seller.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E"}
                                                    alt={seller.businessName}
                                                />
                                                {seller.isVerified && <VerifiedBadge>✓</VerifiedBadge>}
                                            </AvatarWrapper>
                                            <SellerInfo>
                                                <SellerName>{seller.businessName || seller.name}</SellerName>
                                                <RatingWrapper>
                                                    <FaStar />
                                                    <span>{rating.toFixed(1)}</span>
                                                </RatingWrapper>
                                            </SellerInfo>
                                        </CardHeader>

                                        <CardBody>
                                            <ProductPreviewText>Latest Items</ProductPreviewText>
                                            <ImagesWrapper>
                                                {productImages.length > 0 ? (
                                                    productImages.map((img, idx) => (
                                                        <PreviewImage key={idx} $src={img} />
                                                    ))
                                                ) : (
                                                    // Fallbacks if no images
                                                    [1, 2, 3].map(i => <PreviewImage key={i} $src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3C/svg%3E" />)
                                                )}
                                            </ImagesWrapper>
                                        </CardBody>

                                        <ShopButtonWrapper>
                                            Visit Shop <FaArrowRight fontSize="0.75rem" />
                                        </ShopButtonWrapper>
                                    </SellerCard>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                )}
            </Container>
        </SectionWrapper>
    );
};

export default TrendingSellers;
