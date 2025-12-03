import { useMemo } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from '../ProductCard';
import { useAISimilar } from '../../hooks/useRecommendations';
import { LoadingState, ErrorState } from '../../../components/loading';

const AISimilarProducts = ({ productId, title = 'AI-Powered Similar Products', limit = 10 }) => {
  const { data, isLoading, error } = useAISimilar(productId, limit);

  const products = useMemo(() => {
    if (!data?.data?.products) return [];
    return data.data.products;
  }, [data]);

  const aiEnabled = useMemo(() => {
    return data?.aiEnabled || false;
  }, [data]);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>
          {title}
          {aiEnabled && <AIBadge>AI</AIBadge>}
        </SectionTitle>
        <LoadingState message="Loading AI recommendations..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle>
          {title}
          {aiEnabled && <AIBadge>AI</AIBadge>}
        </SectionTitle>
        <ErrorState title="Error loading AI recommendations" message={error.message} />
      </Section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>
        {title}
        {aiEnabled && <AIBadge>AI</AIBadge>}
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
  gap: 0.75rem;
`;

const AIBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default AISimilarProducts;

