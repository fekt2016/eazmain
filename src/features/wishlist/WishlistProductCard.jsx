import { useCallback, memo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaTrash,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import OptimizedImage from '../../shared/components/OptimizedImage';
import { IMAGE_SLOTS } from '../../shared/utils/cloudinaryConfig';
import { useCartActions } from '../../shared/hooks/useCart';
import { useRemoveFromWishlist } from '../../shared/hooks/useWishlist';
import { PrimaryButton } from '../../shared/components/ui/Buttons';
import { ButtonSpinner } from '../../components/loading';
import {
  hasProductDiscount,
  getProductDiscountPercentage,
  getProductPriceForDisplay,
  getProductTotalStock,
} from '../../shared/utils/productHelpers';
import { toast } from 'react-toastify';

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f4f1ec' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

const trimStr = (v) =>
  typeof v === 'string' && v.trim() ? v.trim() : null;

/**
 * Resolve a URL or image object for OptimizedImage.
 * Wishlist API historically omitted `images` for logged-in users; backend now returns both.
 * Prefer non-empty strings; unwrap Mongo image subdocs ({ url, thumbnail, publicId }).
 */
const pickImageSource = (product) => {
  if (!product) return null;

  const fromImageItem = (item) => {
    if (item == null) return null;
    if (typeof item === 'string') return trimStr(item);
    if (typeof item === 'object') {
      return (
        trimStr(item.url) ||
        trimStr(item.secure_url) ||
        trimStr(item.thumbnail) ||
        trimStr(item.medium) ||
        trimStr(item.large) ||
        trimStr(item.publicId) ||
        trimStr(item.public_id) ||
        null
      );
    }
    return null;
  };

  const firstGallery =
    Array.isArray(product.images) && product.images.length > 0
      ? fromImageItem(product.images[0])
      : null;

  return (
    trimStr(product.imageCover) ||
    trimStr(product.coverImage) ||
    firstGallery ||
    trimStr(product.mainImage) ||
    trimStr(product.thumbnail) ||
    null
  );
};

const resolveDefaultSku = (product) => {
  if (!product?.variants || product.variants.length === 0) return null;
  const activeVariant = product.variants.find(
    (v) => v.status === 'active' && v.sku
  );
  if (activeVariant?.sku) return activeVariant.sku.trim().toUpperCase();
  const first = product.variants.find((v) => v.sku);
  if (first?.sku) return first.sku.trim().toUpperCase();
  return null;
};

const WishlistProductCard = memo(({ product, showWishlistRemove = true }) => {
  const productId = product?._id || product?.id;
  const { mutate: removeWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();
  const { addToCart, isAdding: isAddingToCart } = useCartActions();

  const handleAddToCart = useCallback(() => {
    let sku = null;
    if (product.variants?.length > 0) {
      sku = resolveDefaultSku(product);
      if (!sku) {
        toast.error('Please open the product to choose options');
        return;
      }
    }
    addToCart(
      {
        product,
        quantity: 1,
        variantSku: sku,
        variantId:
          product.variants?.find((v) => v.sku === sku)?._id ||
          product.variants?.find((v) => v.sku === sku)?.id ||
          null,
      },
      {
        onError: (error) => {
          if (
            error?.code === 'SKU_REQUIRED' ||
            error?.message?.includes('variant')
          ) {
            toast.error('Please open the product to choose options');
          } else {
            toast.error(error?.message || 'Failed to add to cart');
          }
        },
      }
    );
  }, [addToCart, product]);

  const handleRemove = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rawId = product?._id ?? product?.id ?? productId;
      const id = rawId != null ? String(rawId) : null;
      if (id) removeWishlist(id);
    },
    [product, productId, removeWishlist]
  );

  if (!product || !productId) return null;

  const hasDiscount = hasProductDiscount(product);
  const discountPct = getProductDiscountPercentage(product);
  const { displayPrice, originalPrice } = getProductPriceForDisplay(product);
  const totalStock = getProductTotalStock(product);
  const inStock = totalStock > 0;
  const imageSrc = pickImageSource(product);
  const detailPath = `/product/${productId}`;
  const shopName = product.seller?.shopName || product.shopName;

  return (
    <Card>
      <ImageBlock to={detailPath} aria-label={`View ${product.name || 'product'}`}>
        <ImageInner>
          <div data-product-image-wrap>
            <OptimizedImage
              src={imageSrc || PLACEHOLDER_SVG}
              slot={IMAGE_SLOTS.PRODUCT_CARD}
              aspectRatio="1/1"
              alt={
                product.name
                  ? `${product.name} – Saiisai Ghana e-commerce`
                  : 'Product – Saiisai Ghana online shopping'
              }
              hoverZoom={false}
              priority={false}
              fallback={PLACEHOLDER_SVG}
            />
          </div>
        </ImageInner>
        {hasDiscount && (
          <DiscountPill>-{discountPct}%</DiscountPill>
        )}
      </ImageBlock>

      <Body>
        <TopRow>
          <TextBlock>
            <ProductTitle to={detailPath}>{product.name || 'Product'}</ProductTitle>
            {shopName && <ShopLine>{shopName}</ShopLine>}
            <PriceRow>
              {originalPrice != null && originalPrice > displayPrice && (
                <WasPrice>GH₵{Number(originalPrice).toFixed(2)}</WasPrice>
              )}
              <NowPrice>GH₵{Number(displayPrice).toFixed(2)}</NowPrice>
            </PriceRow>
            <StockLine $inStock={inStock}>
              <StockDot $inStock={inStock} />
              {inStock ? `${totalStock} in stock` : 'Out of stock'}
            </StockLine>
          </TextBlock>
          {showWishlistRemove ? (
            <RemoveBtn
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              aria-label="Remove from wishlist"
              title="Remove from wishlist"
            >
              {isRemoving ? (
                <ButtonSpinner size="sm" />
              ) : (
                <>
                  <FaTrash aria-hidden />
                  <RemoveLabel>Remove</RemoveLabel>
                </>
              )}
            </RemoveBtn>
          ) : null}
        </TopRow>

        <Actions>
          <AddBtn
            $size="md"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            disabled={!inStock || isAddingToCart}
            aria-busy={isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <ButtonSpinner size="sm" aria-hidden />
                Adding…
              </>
            ) : (
              <>
                <FaShoppingCart aria-hidden />
                Add to cart
              </>
            )}
          </AddBtn>
          <ViewLink to={detailPath}>
            <FaExternalLinkAlt aria-hidden />
            View product
          </ViewLink>
        </Actions>
      </Body>
    </Card>
  );
});

WishlistProductCard.displayName = 'WishlistProductCard';

export default WishlistProductCard;

const Card = styled.article`
  container-type: inline-size;
  container-name: wishlist-card;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #ede6dc;
  box-shadow: 0 4px 24px rgba(26, 31, 46, 0.06);
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  @container wishlist-card (min-width: 480px) {
    flex-direction: row;
    align-items: stretch;
    min-height: 118px;
  }

  &:hover {
    border-color: #d4882a;
    box-shadow: 0 8px 32px rgba(212, 136, 42, 0.12);
  }
`;

const ImageBlock = styled(Link)`
  position: relative;
  flex-shrink: 0;
  display: block;
  background: #f9f7f4;
  width: 100%;
  max-width: 100%;

  @container wishlist-card (min-width: 480px) {
    width: 100px;
    max-width: 100px;
  }

  @container wishlist-card (min-width: 640px) {
    width: 108px;
    max-width: 108px;
  }
`;

const ImageInner = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;

  [data-product-image-wrap] {
    width: 100%;
    height: 100%;
  }
`;

const DiscountPill = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.85rem 0.9rem;
  min-width: 0;
  gap: 0.65rem;

  @container wishlist-card (min-width: 480px) {
    padding: 0.85rem 0.95rem 1rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const TextBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const ProductTitle = styled(Link)`
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1f2e;
  text-decoration: none;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    color: #d4882a;
  }

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ShopLine = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
`;

const WasPrice = styled.span`
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const NowPrice = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
  color: #d4882a;
`;

const StockLine = styled.p`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $inStock }) => ($inStock ? '#059669' : '#dc2626')};
`;

const StockDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $inStock }) => ($inStock ? '#10b981' : '#ef4444')};
  flex-shrink: 0;
`;

const RemoveBtn = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: #fecaca;
    border-color: #f87171;
    color: #991b1b;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @container wishlist-card (max-width: 380px) {
    padding: 0.45rem;
  }
`;

const RemoveLabel = styled.span`
  @container wishlist-card (max-width: 380px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: auto;

  @container wishlist-card (min-width: 480px) {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const AddBtn = styled(PrimaryButton)`
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  flex: 1;
  min-width: 132px;
  width: 100%;

  @container wishlist-card (min-width: 480px) {
    width: auto;
  }
`;

const ViewLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e0d8;
  background: #faf8f5;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: #fff7ed;
    border-color: #d4882a;
    color: #b45309;
  }

  @container wishlist-card (min-width: 480px) {
    flex: 0 0 auto;
  }
`;
