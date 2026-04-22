import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../../components/ui/Container';
import Grid from '../../components/ui/Grid';
import Card from '../../components/ui/Card';
import ProductCard from '../../shared/components/ProductCard';
import { formatCurrency } from '../../shared/utils/helpers';
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

const formatDateLabel = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
};

const getTimeLeft = (targetDate, nowMs) => {
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - nowMs;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return { days, hours };
};

const getCountdownLabel = (promo, nowMs) => {
  const status = String(promo?.status || '').toLowerCase();
  const untilStart = getTimeLeft(promo?.startDate, nowMs);
  const untilEnd = getTimeLeft(promo?.endDate, nowMs);

  if ((status === 'scheduled' || status === 'draft') && untilStart) {
    return `Starts in ${untilStart.days}d ${untilStart.hours}h`;
  }

  if ((status === 'active' || !status) && untilEnd) {
    return `Live now - ends in ${untilEnd.days}d ${untilEnd.hours}h`;
  }

  if (status === 'ended' || status === 'cancelled') {
    return 'Promo ended';
  }

  return '';
};

export default function PromoDetailPage() {
  const { promoId } = useParams();
  const promoQuery = usePromo(promoId);
  const productsQuery = usePromoProducts(promoId, { limit: 60 });
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const promo = promoQuery.data?.promo || promoQuery.data || {};
  const products = useMemo(
    () => promoSelectors.extractList(productsQuery.data),
    [productsQuery.data]
  );
  const countdownLabel = getCountdownLabel(promo, nowMs);
  const minDiscountPercent = Number(promo?.minDiscountPercent);

  if (promoQuery.isLoading || productsQuery.isLoading) {
    return <StateCard>Loading promo...</StateCard>;
  }

  if (promoQuery.isError) {
    return <StateCard>We could not load this promo right now.</StateCard>;
  }

  return (
    <Page>
      <Container>
        <Header>
          <Breadcrumb>
            <Link to={PATHS.HOME}>Home</Link> / <span>Promo</span>
          </Breadcrumb>
          <Hero>
            <img
              src={getOptimizedImageUrl(promo?.banner, IMAGE_SLOTS.HOME_HERO)}
              alt={promo?.name || 'Promo banner'}
            />
            <div>
              <h1>{promo?.name || 'Promo'}</h1>
              <p>{promo?.description || 'Explore all products in this promotion.'}</p>
              {countdownLabel ? <Countdown>{countdownLabel}</Countdown> : null}
              <small>
                {formatDateLabel(promo?.startDate)} - {formatDateLabel(promo?.endDate)}
              </small>
              <MetaRow>
                {Number.isFinite(minDiscountPercent) ? (
                  <MetaChip>{`Min discount ${minDiscountPercent}%`}</MetaChip>
                ) : null}
                {Number.isFinite(Number(promo?.maxProductsPerSeller)) ? (
                  <MetaChip>{`Seller cap ${promo.maxProductsPerSeller}`}</MetaChip>
                ) : null}
                {Number.isFinite(Number(promo?.analytics?.totalRevenue)) ? (
                  <MetaChip>
                    {`Revenue ${formatCurrency(
                      Number(promo.analytics.totalRevenue),
                      'GHS'
                    )}`}
                  </MetaChip>
                ) : null}
              </MetaRow>
            </div>
          </Hero>
        </Header>

        {products.length === 0 ? (
          <StateCard>No products found for this promo.</StateCard>
        ) : (
          <Grid>
            {products.map((product) => (
              <Card key={product?._id || product?.id} clickable variant='elevated'>
                <ProductCard product={product} />
              </Card>
            ))}
          </Grid>
        )}
      </Container>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 1.5rem 0 2.2rem;
`;

const Header = styled.header`
  margin-bottom: 1.2rem;
`;

const Breadcrumb = styled.nav`
  margin-bottom: 0.7rem;
  font-size: 0.85rem;
  color: var(--color-grey-600);

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Hero = styled.div`
  background: #fff;
  border: 1px solid #ece8df;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  div {
    padding: 0.9rem;
  }

  h1 {
    margin: 0 0 0.45rem;
    font-size: 1.25rem;
    color: #111827;
  }

  p {
    margin: 0;
    color: #4b5563;
  }

  small {
    display: inline-block;
    margin-top: 0.4rem;
    color: #6b7280;
  }
`;

const Countdown = styled.div`
  margin-top: 0.35rem;
  color: #b45309;
  font-size: 0.82rem;
  font-weight: 700;
`;

const MetaRow = styled.div`
  margin-top: 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
`;

const MetaChip = styled.span`
  background: #f7f7f8;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.74rem;
  color: #4b5563;
`;

const StateCard = styled.div`
  background: #fff;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 1.2rem;
  color: #6b7280;
`;
