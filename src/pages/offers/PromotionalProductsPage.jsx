import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import SectionTitle from '../../components/ui/SectionTitle';
import Grid from '../../components/ui/Grid';
import Card from '../../components/ui/Card';
import Container from '../../components/ui/Container';
import ProductCard from '../../shared/components/ProductCard';
import { PATHS } from '../../routes/routePaths';
import {
  promoSelectors,
  usePromo,
  usePromoProducts,
} from '../../shared/hooks/usePromos';
import {
  getOptimizedImageUrl,
  IMAGE_SLOTS,
} from '../../shared/utils/cloudinaryConfig';

const PageWrapper = styled.div`
  background: var(--color-grey-50);
  min-height: 100vh;
  padding: 2rem 0 3rem;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Breadcrumb = styled.nav`
  font-size: 0.875rem;
  color: var(--color-grey-600);

  a {
    color: inherit;
    text-decoration: none;
  }

  span {
    margin: 0 0.25rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--color-grey-600);
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-grey-600);
  width: 100%;
`;

const PromoHero = styled.section`
  border: 1px solid #ece8df;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  margin-bottom: 1rem;

  img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
  }

  div {
    padding: 0.9rem;
  }

  h2 {
    margin: 0;
    color: #111827;
    font-size: 1.2rem;
  }

  p {
    margin: 0.45rem 0 0;
    color: #4b5563;
    line-height: 1.45;
  }
`;

const DateMeta = styled.small`
  display: inline-block;
  margin-top: 0.45rem;
  color: #6b7280;
  font-size: 0.78rem;
`;

const CardContainer = styled.div`
  width: 100%;
  background-color: transparent;
`;

const FullWidthGrid = styled(Grid)`
  /* Uses existing responsive grid defaults. */
`;

const formatDateLabel = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
};

export default function PromotionalProductsPage() {
  const { promoId } = useParams();
  const promoQuery = usePromo(promoId);
  const productsQuery = usePromoProducts(promoId, { limit: 60 });

  const promo = promoQuery.data?.promo || promoQuery.data || {};
  const products = useMemo(
    () => promoSelectors.extractList(productsQuery.data),
    [productsQuery.data]
  );

  const fallbackTitle = promoId
    ? promoId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Special Offer';
  const title = promo?.name || fallbackTitle;

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Breadcrumb>
            <Link to={PATHS.HOME}>Home</Link>
            <span>/</span>
            <Link to={PATHS.OFFERS}>Offers</Link>
            <span>/</span>
            <span>{title}</span>
          </Breadcrumb>
          <SectionTitle title={title} subtitle='Products curated for this promotion' />
          <Subtitle>
            Discover items selected just for this campaign. Availability and pricing may be
            limited to the promotion period.
          </Subtitle>
        </Header>

        {promo && Object.keys(promo).length ? (
          <PromoHero>
            <img
              src={getOptimizedImageUrl(promo?.banner, IMAGE_SLOTS.HOME_HERO)}
              alt={title}
            />
            <div>
              <h2>{title}</h2>
              <p>{promo?.description || 'Explore approved products in this promo.'}</p>
              <DateMeta>
                {formatDateLabel(promo?.startDate)} - {formatDateLabel(promo?.endDate)}
              </DateMeta>
            </div>
          </PromoHero>
        ) : null}

        {promoQuery.isLoading || productsQuery.isLoading ? (
          <EmptyState>Loading promotional products...</EmptyState>
        ) : promoQuery.isError || productsQuery.isError ? (
          <EmptyState>
            We couldn&apos;t load this promotion right now. Please refresh or try again later.
          </EmptyState>
        ) : products.length === 0 ? (
          <EmptyState>No products are currently attached to this promotion.</EmptyState>
        ) : (
          <FullWidthGrid>
            {products.map((product) => (
              <CardContainer key={product?._id || product?.id}>
                <Card clickable variant='elevated'>
                  <ProductCard product={product} />
                </Card>
              </CardContainer>
            ))}
          </FullWidthGrid>
        )}
      </Container>
    </PageWrapper>
  );
}
