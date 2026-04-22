import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
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
    return 'Limited-time promo';
  }
  return `${start.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}`;
};

export default function FlashDealsStrip() {
  const { promos, isLoading } = useActivePromoCards();
  const flashPromos = promos.filter((promo) => promo?.type === 'flash');

  if (isLoading || flashPromos.length === 0) return null;

  return (
    <Section aria-label='Flash deals'>
      <Header>
        <h2>Flash Deals</h2>
        <Link to={PATHS.OFFERS}>
          See all deals <FaArrowRight />
        </Link>
      </Header>
      <Row>
        {flashPromos.slice(0, 8).map((promo) => {
          const promoId = promo?._id || promo?.id || promo?.slug;
          return (
            <Card key={promoId} to={PATHS.PROMO_DETAIL.replace(':promoId', promoId)}>
              <img
                src={getOptimizedImageUrl(promo?.banner, IMAGE_SLOTS.HOME_HERO)}
                alt={promo?.name || 'Flash promo'}
                loading='lazy'
              />
              <strong>{promo?.name || 'Flash promo'}</strong>
              <span>{formatRange(promo?.startDate, promo?.endDate)}</span>
            </Card>
          );
        })}
      </Row>
    </Section>
  );
}

const Section = styled.section`
  margin: 1.25rem 0 0.6rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #111827;
  }

  a {
    text-decoration: none;
    font-size: 0.85rem;
    color: #b45309;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 0.7rem;
`;

const Card = styled(Link)`
  text-decoration: none;
  border: 1px solid #ece8df;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  padding-bottom: 0.5rem;
  color: inherit;

  img {
    width: 100%;
    height: 88px;
    object-fit: cover;
    display: block;
  }

  strong {
    display: block;
    padding: 0.5rem 0.55rem 0.2rem;
    font-size: 0.84rem;
    color: #111827;
  }

  span {
    display: block;
    padding: 0 0.55rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
`;
