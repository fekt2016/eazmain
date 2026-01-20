import { useCallback, useRef } from "react";
import styled, { css } from "styled-components";
import { fadeIn, pulse } from "../styles/animations";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart, FaTimes, FaEye, FaStar, FaFire } from "react-icons/fa";
import { useCartActions } from '../hooks/useCart';
import { useToggleWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { PrimaryButton, GhostButton, DangerButton } from './ui/Buttons';
import { ButtonSpinner } from '../../components/loading';
import StarRating from "./StarRating";
import {
  hasProductDiscount,
  getProductDiscountPercentage,
  isProductTrending,
  isProductNew,
  hasProductPriceRange,
  getProductTotalStock,
} from '../utils/productHelpers';
import { highlightSearchTerm } from '../utils/searchUtils.jsx';
import logger from '../utils/logger';
import { toast } from 'react-toastify';

// Helper function to get grid image - MUST use product.images ONLY
const getGridImage = (product) => {
  if (product?.images?.length > 0) {
    return product.images[0];
  }
  // Fallback placeholder
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
};

/**
 * Resolve default SKU for product card quick-add
 * CRITICAL: ProductCard = auto-select default SKU
 * 
 * @param {Object} product - Product object with variants
 * @returns {string|null} - Default variant SKU or null if no variants
 */
const resolveDefaultSku = (product) => {
  if (!product?.variants || product.variants.length === 0) {
    return null;
  }

  // Priority: active variant → first variant with SKU
  const activeVariant = product.variants.find(v => v.status === "active" && v.sku);
  if (activeVariant?.sku) {
    return activeVariant.sku.trim().toUpperCase();
  }

  // Fallback: first variant with SKU
  const firstVariantWithSku = product.variants.find(v => v.sku);
  if (firstVariantWithSku?.sku) {
    return firstVariantWithSku.sku.trim().toUpperCase();
  }

  return null;
};

export default function ProductCard({
  product,
  showWishlistButton = true,
  showAddToCart = false,
  showRemoveButton = false,
  layout = "vertical", // 'vertical' or 'horizontal'
  showQuickView = false,
  showBadges = true,
  highlightTerm = null, // Search term to highlight in product name
}) {
  // Early return if product is not available
  if (!product) {
    return null;
  }

  const productId = product.id || product._id;

  // Wishlist hooks
  const { toggleWishlist, isAdding, isRemoving, isInWishlist, isLoading: isWishlistLoading } =
    useToggleWishlist(product._id || productId);

  const { mutate: removeWishlist, isPending: isRemovingFromWishlist } = useRemoveFromWishlist();
  const { addToCart } = useCartActions();

  // Debounce ref to prevent rapid clicks
  const debounceTimerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const handleAddToCart = useCallback((product) => {
    // CRITICAL: Resolve default SKU for ProductCard quick-add
    let sku = null;
    
    if (product.variants?.length > 0) {
      sku = resolveDefaultSku(product);
      
      if (!sku) {
        logger.error("[PRODUCT_CARD_ADD] No SKU found for variant product:", {
          productId: product._id,
          productName: product.name,
          variants: product.variants?.map(v => ({
            id: v._id,
            sku: v.sku,
            status: v.status,
          })) || [],
        });
        toast.error("Please select product options");
        return;
      }
    }

    // CRITICAL: HARD LOG before addToCart
    logger.log("[PRODUCT_CARD_ADD]", {
      productId: product._id,
      productName: product.name,
      sku,
      quantity: 1,
      hasVariants: product.variants?.length > 0,
      variants: product.variants?.map(v => ({
        id: v._id,
        sku: v.sku,
        status: v.status,
      })) || [],
    });

    addToCart(
      {
        product,
        quantity: 1,
        variantSku: sku, // Pass default SKU - ProductCard auto-selects default variant
      },
      {
        onError: (error) => {
          // Handle SKU_REQUIRED error specifically
          if (error?.code === 'SKU_REQUIRED' || error?.message?.includes('variant')) {
            toast.error("Please select product options", {
              position: "top-right",
              autoClose: 3000,
            });
          } else {
            toast.error(error?.message || "Failed to add product to cart", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        },
      }
    );
  }, [addToCart]);

  // Debounced wishlist toggle to prevent rapid clicks
  const handleToggleWishlist = useCallback((e) => {
    // Prevent event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent multiple rapid clicks
    if (isProcessingRef.current || isAdding || isRemoving || isWishlistLoading) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set processing flag
    isProcessingRef.current = true;

    // Execute toggle
    toggleWishlist(product._id || productId);

    // Reset processing flag after debounce delay
    debounceTimerRef.current = setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [toggleWishlist, product._id, productId, isAdding, isRemoving, isWishlistLoading]);

  // Use utility functions for product calculations
  const hasDiscount = hasProductDiscount(product);
  const discountPercentage = getProductDiscountPercentage(product);
  const isTrending = isProductTrending(product);
  const isNew = isProductNew(product);
  const hasPriceRange = hasProductPriceRange(product);
  const totalStock = getProductTotalStock(product);
  
  // Check availability status
  const isComingSoon = product.availability?.status === 'coming_soon';
  const isDiscontinued = product.availability?.status === 'discontinued';
  
  // Check product status
  const isDraft = product.status === 'draft';
  const isInactive = product.status === 'inactive';
  const isOutOfStock = product.status === 'out_of_stock';
  
  // Check condition (if not new)
  const showCondition = product.condition && product.condition !== 'new';

  return (
    <CardContainer $layout={layout}>
      <ProductLink to={`/product/${product._id}`}>
        {/* Image Section */}
        <ImageContainer $layout={layout}>
          <ProductImage 
            src={getGridImage(product)} 
            alt={product.name}
            $layout={layout}
            onError={(e) => {
              // Prevent infinite loop and use local fallback
              if (e.target.dataset.fallbackAttempted !== 'true') {
                e.target.dataset.fallbackAttempted = 'true';
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
              }
            }}
          />
          
          {/* Overlay Actions */}
          <ImageOverlay className="image-overlay">
            {showQuickView && (
              <QuickViewButton
                as={GhostButton}
                $size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add quick view functionality here
                }}
              >
                <FaEye />
                Quick View
              </QuickViewButton>
            )}
          </ImageOverlay>

          {/* Wishlist Button - Top Right Corner */}
          {showWishlistButton && (
            <WishlistIconButton
              as={GhostButton}
              $size="sm"
              onClick={handleToggleWishlist}
              disabled={isAdding || isRemoving || isWishlistLoading || isProcessingRef.current}
              $active={isInWishlist}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isAdding || isRemoving || isWishlistLoading ? (
                <ButtonSpinner size="sm" />
              ) : isInWishlist ? (
                <FaHeart style={{ color: 'var(--color-red-600)' }} />
              ) : (
                <FaRegHeart style={{ color: 'var(--color-grey-600)' }} />
              )}
            </WishlistIconButton>
          )}

          {/* Top Badges */}
          {showBadges && (
            <BadgeContainer>
              {/* Priority: Out of Stock > Coming Soon > Discontinued > Status > EazShop > Discount > New > Trending > Free Shipping > Condition */}
              {(totalStock === 0 || isOutOfStock) && !isComingSoon && (
                <OutOfStockBadge>Out of Stock</OutOfStockBadge>
              )}
              {isComingSoon && (
                <ComingSoonBadge>Coming Soon</ComingSoonBadge>
              )}
              {isDiscontinued && (
                <DiscontinuedBadge>Discontinued</DiscontinuedBadge>
              )}
              {isDraft && (
                <DraftBadge>Draft</DraftBadge>
              )}
              {isInactive && (
                <InactiveBadge>Inactive</InactiveBadge>
              )}
              {/* EazShop Official Product Badge */}
              {(product.isEazShopProduct || product.seller?.role === 'eazshop_store') && (
                <EazShopBadge>
                  <EazShopIcon>✓</EazShopIcon>
                  EazShop Official
                </EazShopBadge>
              )}
              {hasDiscount && !isComingSoon && !isDiscontinued && (
                <DiscountBadge>-{discountPercentage}%</DiscountBadge>
              )}
              {isNew && !isComingSoon && (
                <NewBadge>New</NewBadge>
              )}
              {isTrending && !isComingSoon && (
                <TrendingBadge>
                  <FaFire />
                  Trending
                </TrendingBadge>
              )}
              {product.shipping?.freeShipping && (
                <FreeShippingBadge>Free Shipping</FreeShippingBadge>
              )}
              {showCondition && (
                <ConditionBadge $condition={product.condition}>
                  {product.condition.charAt(0).toUpperCase() + product.condition.slice(1).replace('_', ' ')}
                </ConditionBadge>
              )}
            </BadgeContainer>
          )}
        </ImageContainer>

        {/* Product Info */}
        <ProductInfo $layout={layout}>
          {/* <ProductCategory>{product.category?.name || "Category"}</ProductCategory> */}
          
          {/* Brand */}
          {product.brand && (
            <ProductBrand>{product.brand}</ProductBrand>
          )}
          
          <ProductName title={product.name || ""}>
            {highlightTerm && product.name ? (
              <>
                {highlightSearchTerm(
                  product.name.length > 25 
                    ? `${product.name.slice(0, 25)}...` 
                    : product.name,
                  highlightTerm
                )}
              </>
            ) : (
              product.name && product.name.length > 25 
                ? `${product.name.slice(0, 25)}...` 
                : (product.name || "Product Name")
            )}
          </ProductName>
          
          {/* Short Description */}
          {product.shortDescription && (
            <ProductShortDescription>
              {product.shortDescription && product.shortDescription.length > 60 
                ? `${product.shortDescription.slice(0, 60)}...` 
                : product.shortDescription}
            </ProductShortDescription>
          )}

          {/* Rating Section */}
          {product.ratingsQuantity > 0 && (
            <RatingSection>
              <StarRating rating={product.ratingsAverage} size="14px" />
              <RatingCount>({product.ratingsQuantity})</RatingCount>
            </RatingSection>
          )}

          {/* Price Section */}
          <PriceSection>
            {hasPriceRange ? (
              <PriceRange>
                GH₵{product.minPrice.toFixed(2)} - GH₵{product.maxPrice.toFixed(2)}
              </PriceRange>
            ) : (
              <>
                <CurrentPrice>GH₵{product?.price || product?.minPrice || "0.00"}</CurrentPrice>
                {hasDiscount && product.originalPrice && (
                  <OriginalPrice>GH₵{product.originalPrice}</OriginalPrice>
                )}
              </>
            )}
          </PriceSection>

          {/* Stock Status */}
          <StockStatus $inStock={totalStock > 0}>
            <StatusDot $inStock={totalStock > 0} />
            {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
          </StockStatus>
        </ProductInfo>
      </ProductLink>

      {/* Action Buttons */}
      <ActionSection $layout={layout}>
        {showAddToCart && (
          <AddToCartButton
            as={PrimaryButton}
            $size="sm"
            $fullWidth
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(product);
            }}
            disabled={totalStock === 0}
          >
            <FaShoppingCart />
            Add to Cart
          </AddToCartButton>
        )}

        {/* Action Icons */}
        {showRemoveButton && (
          <ActionIcons>
            <RemoveButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeWishlist(productId);
              }}
              disabled={isRemovingFromWishlist}
              aria-label="Remove product"
              title="Remove from wishlist"
            >
              {isRemovingFromWishlist ? (
                <ButtonSpinner size="sm" />
              ) : (
                <FaTimes />
              )}
            </RemoveButton>
          </ActionIcons>
        )}
      </ActionSection>
    </CardContainer>
  );
}

// Using fadeIn and pulse from unified animations

// Styled Components
const CardContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 1.2rem; /* Reduced from 1.6rem */
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); /* Reduced shadow */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-grey-100);
  display: flex;
  flex-direction: ${({ $layout }) => ($layout === "horizontal" ? "row" : "column")};
  height: 100%;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-4px); /* Reduced from -8px */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); /* Reduced shadow */
    
    .image-overlay {
      opacity: 1;
    }
  }

  ${({ $layout }) => $layout === "horizontal" && css`
    min-height: 150px;
  `}
`;

const ProductLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ImageContainer = styled.div`
  position: relative;
  height: ${({ $layout }) => ($layout === "horizontal" ? "100%" : "180px")}; /* Reduced from 220px */
  width: ${({ $layout }) => ($layout === "horizontal" ? "140px" : "100%")};
  background: linear-gradient(135deg, var(--color-grey-50) 0%, var(--color-grey-100) 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $layout }) => ($layout === "horizontal" ? "1.5rem" : "1.2rem")}; /* Reduced from 2rem */

  ${({ $layout }) => $layout === "horizontal" && css`
    flex-shrink: 0;
    border-right: 1px solid var(--color-grey-100);
  `}
`;

const ProductImage = styled.img`
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${CardContainer}:hover & {
    transform: scale(1.08);
  }

  ${({ $layout }) => $layout === "horizontal" && css`
    max-height: 120px;
    max-width: 120px;
  `}
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
`;

// Wishlist button positioned in top-right corner of image
const WishlistIconButton = styled.div`
  position: absolute;
  top: 0.8rem; /* Reduced from 1rem */
  right: 0.8rem; /* Reduced from 1rem */
  z-index: 10;
  border-radius: 50% !important;
  width: 3rem !important; /* Reduced from 3.6rem */
  height: 3rem !important; /* Reduced from 3.6rem */
  padding: 0 !important;
  background-color: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12); /* Reduced shadow */
  transition: var(--transition-base);
  
  ${({ $active }) => $active && `
    background-color: var(--color-red-50) !important;
    border-color: var(--color-red-500) !important;
  `}
  
  &:hover {
    background-color: var(--color-white-0) !important;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const QuickViewButton = styled.button`
  color: white !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  
  &:hover {
    background: var(--color-primary-500) !important;
    border-color: var(--color-primary-500) !important;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 0.8rem; /* Reduced from 1rem */
  left: 0.8rem; /* Reduced from 1rem */
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Reduced from 0.5rem */
  align-items: flex-start;
`;

const Badge = styled.span`
  padding: 0.3rem 0.6rem; /* Reduced from 0.4rem 0.8rem */
  border-radius: 0.5rem; /* Reduced from 0.6rem */
  font-size: 0.85rem; /* Reduced from 1rem */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
`;

const DiscountBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-700) 100%);
  color: var(--color-white-0);
  animation: ${pulse} 2s infinite;
`;

const TrendingBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  color: var(--color-white-0);
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const NewBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-500) 100%);
  color: var(--color-white-0);
`;

const OutOfStockBadge = styled(Badge)`
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-white-0);
`;

const ComingSoonBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%);
  color: var(--color-white-0);
`;

const DiscontinuedBadge = styled(Badge)`
  background: rgba(0, 0, 0, 0.6);
  color: var(--color-white-0);
`;

const DraftBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-grey-500) 0%, var(--color-grey-600) 100%);
  color: var(--color-white-0);
`;

const InactiveBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-yellow-700) 0%, var(--color-primary-700) 100%);
  color: var(--color-white-0);
`;

const FreeShippingBadge = styled(Badge)`
  background: linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-500) 100%);
  color: var(--color-white-0);
`;

const ConditionBadge = styled(Badge)`
  background: ${({ $condition }) => {
    switch ($condition) {
      case 'used':
        return 'linear-gradient(135deg, var(--color-yellow-700) 0%, var(--color-primary-700) 100%)';
      case 'refurbished':
        return 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%)';
      case 'open_box':
        return 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)';
      case 'damaged':
        return 'linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-700) 100%)';
      case 'for_parts':
        return 'linear-gradient(135deg, var(--color-grey-600) 0%, var(--color-grey-700) 100%)';
      default:
        return 'linear-gradient(135deg, var(--color-green-700) 0%, var(--color-green-500) 100%)';
    }
  }};
  color: var(--color-white-0);
`;

const EazShopBadge = styled(Badge)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 0.75rem; /* Reduced from 0.85rem */
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); /* Reduced shadow */
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 0.3rem; /* Reduced from 0.4rem */
  z-index: 5;
  position: relative;
  animation: ${pulse} 3s infinite;
`;

const EazShopIcon = styled.span`
  font-size: 0.9rem; /* Reduced from 1rem */
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem; /* Reduced from 1.6rem */
  height: 1.4rem; /* Reduced from 1.6rem */
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(5px);
`;

const ProductInfo = styled.div`
  padding: ${({ $layout }) => ($layout === "horizontal" ? "1.2rem" : "1rem")}; /* Reduced from 1.2rem */
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Reduced from 0.5rem */
`;

const ProductCategory = styled.span`
  font-size: 1rem; /* Reduced from 1.2rem */
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const ProductBrand = styled.span`
  font-size: 1.1rem; /* Reduced from 1.3rem */
  color: var(--color-primary-600);
  font-weight: 600;
  margin-bottom: 0.1rem; /* Reduced from 0.2rem */
`;

const ProductShortDescription = styled.p`
  font-size: 1rem; /* Reduced from 1.2rem */
  color: var(--color-grey-600);
  line-height: 1.4;
  margin: 0.1rem 0; /* Reduced from 0.2rem */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductName = styled.h3`
  font-size: 1.3rem; /* Reduced from 1.5rem */
  font-weight: 700;
  color: var(--color-grey-900);
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${CardContainer}:hover & {
    color: var(--color-primary-500);
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduced from 0.6rem */
  margin-top: 0.1rem; /* Reduced from 0.2rem */
`;

const RatingCount = styled.span`
  font-size: 1rem; /* Reduced from 1.2rem */
  color: var(--color-grey-500);
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Reduced from 0.8rem */
  margin-top: auto;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem; /* Reduced from 1.8rem */
  font-weight: 800;
  color: var(--color-primary-500);
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem; /* Reduced from 1.4rem */
  color: var(--color-grey-500);
  text-decoration: line-through;
`;

const PriceRange = styled.span`
  font-size: 1.5rem; /* Reduced from 1.8rem */
  font-weight: 800;
  color: var(--color-primary-500);
`;

const StockStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduced from 0.6rem */
  font-size: 1rem; /* Reduced from 1.2rem */
  font-weight: 500;
  color: ${({ $inStock }) => ($inStock ? "var(--color-green-600)" : "var(--color-red-600)")};
`;

const StatusDot = styled.div`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: ${({ $inStock }) => ($inStock ? "var(--color-green-500)" : "var(--color-red-500)")};
  animation: ${pulse} 2s infinite;
`;

const ActionSection = styled.div`
  padding: ${({ $layout }) => ($layout === "horizontal" ? "1.2rem" : "0 1rem 1rem")}; /* Reduced from 1.2rem */
  display: flex;
  flex-direction: ${({ $layout }) => ($layout === "horizontal" ? "column" : "row")};
  gap: 0.5rem; /* Reduced from 0.6rem */
  align-items: center;

  ${({ $layout }) => $layout === "horizontal" && css`
    justify-content: center;
    border-left: 1px solid var(--color-grey-100);
    padding: 1rem;
    min-width: 120px;
  `}
`;

const AddToCartButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;

  ${({ $layout }) => $layout === "horizontal" && css`
    flex-direction: column;
  `}
`;

const IconButton = styled.button`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid var(--color-grey-200);
  background: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;


const RemoveButton = styled.button`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid var(--color-red-200);
  background: var(--color-red-50);
  color: var(--color-red-500);
  cursor: pointer;
  font-size: 1.6rem;
  flex-shrink: 0;

  &:hover {
    color: white;
    background: var(--color-red-500);
    border-color: var(--color-red-500);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;