import { useRef, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import styled from "styled-components";
import StarRating from "../StarRating";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useGetFeaturedSellers } from "../../hooks/useSeller";

const TopSellers = () => {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const { data } = useGetFeaturedSellers();

  const topSellers = useMemo(() => {
    return data?.slice(0, 8);
  }, [data]);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;

      // Assign custom navigation elements
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.params.pagination.el = paginationRef.current;

      // Re-init navigation and pagination
      swiper.navigation.init();
      swiper.navigation.update();
      swiper.pagination.init();
      swiper.pagination.update();
    }
  }, [topSellers]);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Top Sellers</SectionTitle>
        <SectionSubtitle>Shop from our trusted sellers</SectionSubtitle>
      </SectionHeader>

      <SellersGrid>
        <PrevButton ref={prevRef}>&#10094;</PrevButton>

        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          pagination={{
            clickable: true,
            el: paginationRef.current,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          onInit={(swiper) => {
            // Assign custom navigation elements after init
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.params.pagination.el = paginationRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
            swiper.pagination.init();
            swiper.pagination.update();
          }}
        >
          {topSellers?.map((seller) => {
            // Get exactly two product images from the seller's products
            const productImages =
              seller.products
                ?.flatMap((product) => product.images || [])
                ?.filter((img) => img) // Remove any empty/null images
                ?.slice(0, 2) || []; // Take only the first two images

            return (
              <SwiperSlide key={seller?.id}>
                <SellerCard
                  to={`/seller/${seller.id}`}
                  $coverImage={seller.avatar}
                >
                  <CardOverlay />

                  <CardContent>
                    <SellerInfo>
                      <SellerName>{seller?.shopName}</SellerName>

                      <SellerStats>
                        <SellerRating>
                          <StarRating rating={seller?.rating || 0} />
                          <RatingValue>
                            {seller?.rating?.toFixed(1) || "0.0"}
                          </RatingValue>
                        </SellerRating>
                        <SellerProducts>
                          {seller.productCount || 0} products
                        </SellerProducts>
                      </SellerStats>
                      <ProductImagesContainer>
                        {productImages.length > 0 ? (
                          productImages.map((image, index) => (
                            <ProductImage
                              key={index}
                              src={image}
                              alt={`Product ${index + 1}`}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80x80?text=Product";
                              }}
                            />
                          ))
                        ) : (
                          <NoProductsText>No products available</NoProductsText>
                        )}
                      </ProductImagesContainer>
                    </SellerInfo>
                  </CardContent>
                </SellerCard>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <NextButton ref={nextRef}>&#10095;</NextButton>

        <PaginationContainer ref={paginationRef} />
      </SellersGrid>
    </Section>
  );
};

// Styled Components
const Section = styled.section`
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const SellersGrid = styled.div`
  position: relative;
  padding: 0 40px;
`;

const SellerCard = styled(Link)`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  height: 350px;
  display: block;
  text-decoration: none;
  color: inherit;
  background-image: ${(props) =>
    props.$coverImage
      ? `url(${props.$coverImage})`
      : "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"};
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 0.8;
    }
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
`;

const CardContent = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 20px;
  z-index: 2;
  color: white;
`;

const SellerAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: white;
  }
`;

const SellerInfo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  z-index: 100;
`;

const SellerName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;

const ProductImagesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const NoProductsText = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const SellerStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const RatingValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
  color: white;
`;

const SellerProducts = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const VisitStoreButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #4e73df;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;

  &:hover {
    background: #4e73df;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 0;
`;

const NextButton = styled(NavigationButton)`
  right: 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: #ddd;
    opacity: 1;
    margin: 0 5px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
  }

  .swiper-pagination-bullet-active {
    background: #4e73df;
    transform: scale(1.2);
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #2e3a59;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #858796;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export default TopSellers;
