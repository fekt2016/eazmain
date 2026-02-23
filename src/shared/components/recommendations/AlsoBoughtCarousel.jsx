import { useMemo } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from '../ProductCard';
import { useAlsoBought } from '../../hooks/useRecommendations';
import { LoadingState, ErrorState } from '../../../components/loading';

const AlsoBoughtCarousel = ({ productId, currentProduct, title = 'Customers Also Bought', limit = 10 }) => {
  const { data, isLoading, error } = useAlsoBought(productId, limit);

  const products = useMemo(() => {
    if (!data?.data?.products) return [];

    return data.data.products.filter(p => {
      const isSameId = p.id === productId || p._id === productId || p.id === currentProduct?.id || p._id === currentProduct?._id;
      const isSameName = p.name && currentProduct?.name && p.name.trim().toLowerCase() === currentProduct.name.trim().toLowerCase();

      return !isSameId && !isSameName;
    });
  }, [data, productId, currentProduct]);

  if (isLoading) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <LoadingState message="Loading recommendations..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <ErrorState title="Error loading recommendations" message={error.message} />
      </Section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
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
`;

export default AlsoBoughtCarousel;

