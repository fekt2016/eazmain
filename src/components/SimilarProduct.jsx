import styled from "styled-components";
import { Link } from "react-router-dom";
import useSimilarProducts from "../hooks/useProduct";
import { FaStar } from "react-icons/fa";

const SimilarProducts = ({ categoryId, currentProductId }) => {
  const { data, isLoading, error } = useSimilarProducts(
    categoryId,
    currentProductId
  );

  if (isLoading) return <Loading>Loading similar products...</Loading>;
  if (error) return <Error>Error loading similar products</Error>;
  if (!data || data.length === 0) return null;

  return (
    <ProductGrid>
      {data.map((product) => (
        <ProductCard key={product.id}>
          <ProductImage to={`/product/${product.id}`}>
            <img src={product.imageCover} alt={product.name} />
          </ProductImage>
          <ProductInfo>
            <ProductName to={`/product/${product.id}`}>
              {product.name}
            </ProductName>
            <Rating>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  $filled={i < Math.floor(product.averageRating || 0)}
                >
                  <FaStar />
                </Star>
              ))}
              <RatingValue>({product.ratingsQuantity || 0})</RatingValue>
            </Rating>
            <ProductPrice>GH₵{product.price.toFixed(2)}</ProductPrice>
          </ProductInfo>
        </ProductCard>
      ))}
    </ProductGrid>
  );
};

// Styled components
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled(Link)`
  display: block;
  height: 200px;
  padding: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProductInfo = styled.div`
  padding: 15px;
  border-top: 1px solid #f0f0f0;
`;

const ProductName = styled(Link)`
  font-weight: 600;
  color: #2e3a59;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  &:hover {
    color: #4e73df;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Star = styled.span`
  color: ${(props) => (props.$filled ? "#ffc107" : "#e0e0e0")};
  font-size: 14px;
  margin-right: 2px;
`;

const RatingValue = styled.span`
  font-size: 12px;
  color: #858796;
  margin-left: 5px;
`;

const ProductPrice = styled.div`
  font-weight: 700;
  color: #4e73df;
  font-size: 18px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #4e73df;
`;

const Error = styled.div`
  text-align: center;
  padding: 20px;
  color: #e74a3b;
`;

export default SimilarProducts;
