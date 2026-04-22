import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../../components/ui/Container';
import { PATHS } from '../../routes/routePaths';
import { useActivePromoCards } from '../../shared/hooks/usePromos';
import {
  getOptimizedImageUrl,
  IMAGE_SLOTS,
} from '../../shared/utils/cloudinaryConfig';

const formatRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Limited-time promotion';
  }

  return `${start.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
  })} - ${end.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};

const getTypeLabel = (type) => {
  if (!type) return 'promo';
  return String(type).toLowerCase();
};

export default function OffersPromosPage() {
  const { promos, isLoading, isError } = useActivePromoCards();

  return (
    <Page>
      <Container>
        <Header>
          <h1>Active Promos</h1>
          <p>Explore limited-time offers from approved campaign products.</p>
        </Header>

        {isLoading ? <StateCard>Loading active promos...</StateCard> : null}
        {isError ? (
          <StateCard>
            We could not load promos right now. Please refresh and try again.
          </StateCard>
        ) : null}

        {!isLoading && !isError && promos.length === 0 ? (
          <StateCard>No active promos at the moment.</StateCard>
        ) : null}

        {!isLoading && !isError && promos.length > 0 ? (
          <Grid>
            {promos.map((promo) => {
              const promoId = promo?._id || promo?.id || promo?.slug;
              return (
                <PromoCard
                  key={promoId}
                  to={PATHS.PROMO_DETAIL.replace(':promoId', promoId)}
                >
                  <img
                    src={getOptimizedImageUrl(
                      promo?.banner,
                      IMAGE_SLOTS.HOME_HERO
                    )}
                    alt={promo?.name || 'Promo banner'}
                    loading='lazy'
                  />
                  <CardBody>
                    <TopRow>
                      <strong>{promo?.name || 'Promo'}</strong>
                      <TypeBadge>{getTypeLabel(promo?.type)}</TypeBadge>
                    </TopRow>
                    <p>{promo?.description || 'Limited-time campaign offer.'}</p>
                    <small>{formatRange(promo?.startDate, promo?.endDate)}</small>
                  </CardBody>
                </PromoCard>
              );
            })}
          </Grid>
        ) : null}
      </Container>
    </Page>
  );
}

const Page = styled.section`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding: 1.4rem 0 2.2rem;
`;

const Header = styled.header`
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    color: #111827;
    font-size: 1.45rem;
  }

  p {
    margin: 0.35rem 0 0;
    color: #6b7280;
    font-size: 0.9rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;

  @media (min-width: 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 64rem) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const PromoCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  border: 1px solid #ece8df;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
  }
`;

const CardBody = styled.div`
  padding: 0.8rem;

  p {
    margin: 0.45rem 0;
    color: #4b5563;
    font-size: 0.84rem;
    line-height: 1.45;
  }

  small {
    color: #6b7280;
    font-size: 0.76rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;

  strong {
    color: #111827;
    font-size: 0.94rem;
  }
`;

const TypeBadge = styled.span`
  border-radius: 999px;
  background: #fdf3e3;
  color: #b45309;
  padding: 0.2rem 0.5rem;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const StateCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #6b7280;
  padding: 1rem;
`;
