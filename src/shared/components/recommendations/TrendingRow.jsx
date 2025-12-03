import { useMemo } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaFire } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from '../ProductCard';
import { useTrending } from '../../hooks/useRecommendations';
import { LoadingState, ErrorState } from '../../../components/loading';

const TrendingRow = ({ title = 'Trending Now', limit = 10 }) => {
  const { data, isLoading, error } = useTrending(limit);

  const products = useMemo(() => {
    if (!data?.data?.products) return [];
    return data.data.products;
  }, [data]);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>
          <FaFire /> {title}
        </SectionTitle>
        <LoadingState message="Loading trending products..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle>
          <FaFire /> {title}
        </SectionTitle>
        <ErrorState title="Error loading trending products" message={error.message} />
      </Section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>
        <FaFire /> {title}
      </SectionTitle>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={Number(20)}
        slidesPerView={Number(1)}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: Number(3000),
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: Number(2),
            spaceBetween: Number(20),
          },
          768: {
            slidesPerView: Number(3),
            spaceBetween: Number(24),
          },
          1024: {
            slidesPerView: Number(4),
            spaceBetween: Number(24),
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id || product.id}>
            <ProductCard product={product} showAddToCart />
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
};

const Section = styled.section`
  margin: 4rem 0;
  padding: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--color-red-500);
  }
`;

export default TrendingRow;

