import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaCrown, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';
import { PATHS } from '../../../routes/routePaths';

const CardContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const RankingBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);

  ${props => props.rank === 1 && `
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    svg {
      color: #333;
    }
  `}

  ${props => props.rank === 2 && `
    background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
    svg {
      color: #333;
    }
  `}

  ${props => props.rank === 3 && `
    background: linear-gradient(135deg, #cd7f32, #daa520);
    svg {
      color: #fff;
    }
  `}

  ${props => props.rank > 3 && `
    background: linear-gradient(135deg, #4a90e2, #357abd);
    color: #fff;
  `}
`;

const CrownIcon = styled(FaCrown)`
  font-size: 1rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
`;

const SellerAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
`;

const Content = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const SellerName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
  text-align: center;
  line-height: 1.3;
`;

const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.85rem;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const StatValue = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const Stars = styled.div`
  display: flex;
  color: #ffd700;

  svg {
    font-size: 0.9rem;
  }
`;

const RatingText = styled.span`
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
`;

const ViewShopButton = styled(Link)`
  margin-top: auto;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
  color: white;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #ffb300 0%, #ffa000 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }

  svg {
    font-size: 0.9rem;
  }
`;

const BestSellerSellerCard = ({ seller, rank }) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <FaStar 
      key={i} 
      fill={i < Math.round(seller.rating || seller.averageRating || 0) ? '#ffd700' : '#e4e5e9'} 
    />
  ));

  const orderCount = seller.totalOrders || seller.orderCount || seller.ordersCount || 0;
  const productCount = seller.productCount || seller.productsCount || 0;
  const rating = seller.rating || seller.averageRating || 0;
  const reviewCount = seller.reviewCount || seller.reviewsCount || 0;

  return (
    <CardContainer>
      <RankingBadge rank={rank}>
        {rank <= 3 ? <CrownIcon /> : `#${rank}`}
      </RankingBadge>
      
      <AvatarContainer>
        <SellerAvatar 
          src={seller.avatar || seller.logo || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3E${(seller.shopName || seller.name || 'Shop').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`}
          alt={seller.shopName || seller.name || 'Seller'}
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3E${(seller.shopName || seller.name || 'Shop').charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </AvatarContainer>
      
      <Content>
        <SellerName>{seller.shopName || seller.name || 'Seller'}</SellerName>
        
        {seller.location && (
          <LocationContainer>
            <FaMapMarkerAlt />
            <span>{seller.location}</span>
          </LocationContainer>
        )}
        
        <StatsContainer>
          <StatItem>
            <StatValue>{orderCount.toLocaleString()}</StatValue>
            <StatLabel>Orders</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{productCount.toLocaleString()}</StatValue>
            <StatLabel>Products</StatLabel>
          </StatItem>
        </StatsContainer>
        
        <RatingContainer>
          <Stars>{stars}</Stars>
          <RatingText>
            {rating.toFixed(1)} ({reviewCount} reviews)
          </RatingText>
        </RatingContainer>
      </Content>
      
      <ViewShopButton to={`${PATHS.SELLERS}/${seller._id || seller.id}`}>
        <FaShoppingBag /> View Shop
      </ViewShopButton>
    </CardContainer>
  );
};

export default BestSellerSellerCard;

