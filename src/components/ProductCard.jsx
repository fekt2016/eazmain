import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart, FaTimes } from "react-icons/fa";
import { useCartActions } from "../hooks/useCart";

import { useToggleWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";

// import useAuth from "../hooks/useAuth";
// import { useMemo } from "react";
import StarRating from "./StarRating";
// import RatingStar from "./RatingStar";

export default function ProductCard({
  product,
  showWishlistButton = true,
  showAddToCart = false,
  showRemoveButton = false,
  layout = "vertical", // 'vertical' or 'horizontal'
}) {
  console.log("product", product);
  const productId = product.id || product._id;

  // const { isAuthenticated } = useAuth();
  const { toggleWishlist, isAdding, isRemoving, isInWishlist } =
    useToggleWishlist(product._id);

  const { mutate: removeWishlist } = useRemoveFromWishlist();
  const { addToCart } = useCartActions();

  const handleAddToCart = (product) => {
    addToCart({
      product,
      quantity: 1,
    });
  };
  const handleToggleWishlist = () => {
    toggleWishlist(product._id);
  };
  return (
    <CardContainer $layout={layout} to={`/product/${product._id}`}>
      {showRemoveButton && (
        <RemoveButton
          onClick={(e) => {
            e.preventDefault();
            removeWishlist(productId);
          }}
          aria-label="Remove product"
        >
          <FaTimes color="#2e3a59" />
        </RemoveButton>
      )}
      {showWishlistButton && (
        <WishlistButton
          onClick={handleToggleWishlist}
          disabled={isAdding || isRemoving}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <FaHeart color="#ff6b6b" />
          ) : (
            <FaRegHeart color="#2e3a59" />
          )}
        </WishlistButton>
      )}
      <ProductLink>
        <ProductImage $layout={layout}>
          <img src={product.imageCover} alt={product.name} />
        </ProductImage>
      </ProductLink>
      <ProductInfo $layout={layout}>
        <ProductLink to={`/product/${product.id}`}>
          <ProductName>{product.name}</ProductName>
        </ProductLink>
        <ProductPrice>GH₵{product?.price || ""}</ProductPrice>
        <ProductRating>
          <Count>{product.ratingsQuantity}</Count>
          <StarRating rating={product.ratingsAverage} />
        </ProductRating>
        {showAddToCart && (
          <AddToCartButton
            // disabled={isInCart}
            onClick={(e) => {
              e.preventDefault();
              console.log("Added to cart");
              handleAddToCart(product);
            }}
          >
            <FaShoppingCart style={{ marginRight: "8px" }} />
            Add to Cart
          </AddToCartButton>
        )}
      </ProductInfo>
    </CardContainer>
  );
}

// Styled Components
const CardContainer = styled(Link)`
  position: relative;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #eaecf4;
  display: ${({ $layout }) => ($layout === "horizontal" ? "flex" : "block")};
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ProductLink = styled.div`
  text-decoration: none;
  color: inherit;
`;

const ProductImage = styled.div`
  height: ${({ $layout }) => ($layout === "horizontal" ? "100%" : "200px")};
  width: ${({ $layout }) => ($layout === "horizontal" ? "10%" : "100%")};
  background: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: ${({ $layout }) =>
    $layout === "vertical" ? "1px solid #eaecf4" : "none"};
  border-right: ${({ $layout }) =>
    $layout === "horizontal" ? "1px solid #eaecf4" : "none"};

  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 8px;
  flex: ${({ $layout }) => ($layout === "horizontal" ? "1" : "none")};
  display: flex;
  flex-direction: column;
  height: ${({ $layout }) => ($layout === "horizontal" ? "100%" : "auto")};
`;

const ProductName = styled.h3`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--color-grey-800);
  transition: color 0.3s;

  /* &:hover {
    color: #4e73df;
  } */
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 5px;
  justify-content: start;
  align-items: center;
`;
const DiscountPrice = styled.span``;
const Count = styled.span``;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand-500);
  margin-bottom: 5px;
  margin-top: auto;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #2e59d9;
  }

  &:focus {
    outline: none;
  }
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 3.6rem;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  font-size: 1.8rem;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.3);
  }
`;
const RemoveButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 3.6rem;
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  font-size: 1.8rem;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.3);
  }
`;
