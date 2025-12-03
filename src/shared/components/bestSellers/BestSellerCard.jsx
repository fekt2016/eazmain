import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaCartPlus, FaCrown } from 'react-icons/fa';
import { PATHS } from '../../../routes/routePaths';
import { PrimaryButton } from '../ui/Buttons';
import { formatCurrency } from '../../utils/helpers';

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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
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
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    svg {
      color: #fff;
    }
  `}
`;

const CrownIcon = styled(FaCrown)`
  font-size: 0.8rem;
`;

const ImageContainer = styled.div`
  position: relative;
  height: 250px;
  overflow: hidden;
  background: #f8f9fa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    ${CardContainer}:hover & {
      transform: scale(1.05);
    }
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
`;

const Content = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
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

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const AddToCartButton = styled(PrimaryButton)`
  margin-top: auto;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  border-radius: 8px;

  svg {
    margin-right: 0.5rem;
  }
`;

const BestSellerCard = ({ product, rank, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FaStar 
      key={i} 
      fill={i < Math.round(product.rating || 0) ? '#ffd700' : '#e4e5e9'} 
    />
  ));

  const discount = product.discount || 0;
  const originalPrice = product.originalPrice || (product.price * 1.2);

  return (
    <CardContainer>
      <Link to={`${PATHS.PRODUCT_DETAIL}/${product._id || product.id}`} style={{ textDecoration: 'none' }}>
        <RankingBadge rank={rank}>
          {rank <= 3 ? <CrownIcon /> : rank}
        </RankingBadge>
        
        <ImageContainer>
          <img 
            src={product.images?.[0] || product.image || '/placeholder-product.jpg'} 
            alt={product.name}
            loading="lazy"
          />
          {discount > 0 && (
            <DiscountBadge>{discount}% OFF</DiscountBadge>
          )}
        </ImageContainer>
        
        <Content>
          <ProductName>{product.name}</ProductName>
          
          <RatingContainer>
            <Stars>{stars}</Stars>
            <RatingText>
              {product.rating || 0} ({product.reviewCount || 0} reviews)
            </RatingText>
          </RatingContainer>
          
          <PriceContainer>
            <CurrentPrice>{formatCurrency(product.price || 0, product.currency || 'GHS')}</CurrentPrice>
            {discount > 0 && (
              <OriginalPrice>{formatCurrency(originalPrice, product.currency || 'GHS')}</OriginalPrice>
            )}
          </PriceContainer>
        </Content>
      </Link>
      
      <AddToCartButton onClick={handleAddToCart}>
        <FaCartPlus /> Add to Cart
      </AddToCartButton>
    </CardContainer>
  );
};

export default BestSellerCard;
