// src/components/CartPage.jsx
import { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled, { keyframes } from "styled-components";
import {
  useCartTotals,
  useGetCart,
  useCartActions,
  useAutoSyncCart,
  getCartStructure,
} from '../../shared/hooks/useCart';
import useAds from "../../shared/hooks/useAds";
import { useTrending } from '../../shared/hooks/useRecommendations';
import { useNavigate } from "react-router-dom";
import useAuth from '../../shared/hooks/useAuth';
import { PrimaryButton, DangerButton, GhostButton, SuccessButton } from '../../shared/components/ui/Buttons';
import { LoadingState, EmptyState, ErrorState, ButtonSpinner } from '../../components/loading';
import { spin } from '../../shared/styles/animations';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import seoConfig from '../../shared/config/seoConfig';
import logger from '../../shared/utils/logger';
import ProductCard from '../../shared/components/ProductCard';
import shippingApi from '../../shared/services/shippingApi';
import { FREE_SHIPPING_MIN_FALLBACK_GHS } from '../../shared/config/appConfig';
import { FaShoppingCart, FaShoppingBag, FaTruck, FaLock, FaTrash } from "react-icons/fa";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const CartPage = () => {
  useDynamicPageTitle({
    title: seoConfig.cart.title,
    description: seoConfig.cart.description,
    keywords: seoConfig.cart.keywords,
    image: seoConfig.cart.image,
    type: seoConfig.cart.type,
    canonical: seoConfig.cart.canonical,
    jsonLd: seoConfig.cart.jsonLd,
    defaultTitle: seoConfig.cart.title,
    defaultDescription: seoConfig.cart.description,
  });
  const { data, isLoading: isCartLoading, isError } = useGetCart();
  const { total: subTotal } = useCartTotals();
  const { promotionDiscountMap } = useAds();

  const {
    updateCartItem,
    removeCartItem,
    clearCart,
    addToCart,
    isUpdating,
    isAdding,
    isClearing,
    updateCartItemMutation,
    removeCartItemMutation,
    addToCartMutation,
  } = useCartActions();
  useAutoSyncCart();

  const [removingItemId, setRemovingItemId] = useState(null);
  const { isAuthenticated } = useAuth();
  const products = getCartStructure(data);

  const hasPreorderItem = useMemo(
    () =>
      Array.isArray(products) &&
      products.some((item) => item?.product?.isPreOrder),
    [products]
  );

  const { data: trendingData, isLoading: isTrendingLoading } = useTrending(12);
  const cartProductIds = useMemo(
    () => new Set(
      products
        .filter((item) => item?.product)
        .map((item) => String(item.product?._id || item.product?.id || ''))
        .filter(Boolean)
    ),
    [products]
  );
  const similarProducts = useMemo(() => {
    const list = trendingData?.data?.products ?? trendingData?.products ?? [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => p && !cartProductIds.has(String(p._id || p.id)))
      .slice(0, 4);
  }, [trendingData, cartProductIds]);

  const navigate = useNavigate();

  const { data: freeDeliveryResponse, isError: freeDeliveryError, isLoading: freeDeliveryLoading } =
    useQuery({
      queryKey: ['shipping', 'free-delivery'],
      queryFn: () => shippingApi.getFreeDeliveryInfo(),
      staleTime: 5 * 60 * 1000,
    });

  /** Platform minimum (GHS) for free-delivery messaging; null = not configured (hide promo). */
  const freeShippingMinGhs = useMemo(() => {
    const raw = freeDeliveryResponse?.data?.freeDeliveryThreshold;
    if (raw != null && Number(raw) > 0) return Number(raw);
    if (freeDeliveryError) return FREE_SHIPPING_MIN_FALLBACK_GHS;
    if (freeDeliveryLoading) return null;
    return null;
  }, [freeDeliveryResponse, freeDeliveryError, freeDeliveryLoading]);

  const showFreeShippingPromo =
    freeShippingMinGhs != null && freeShippingMinGhs > 0 && !hasPreorderItem;

  const shippingProgress = useMemo(() => {
    if (!showFreeShippingPromo) return 0;
    return Math.min((subTotal / freeShippingMinGhs) * 100, 100);
  }, [subTotal, freeShippingMinGhs, showFreeShippingPromo]);

  const qualifiesForFreeShipping =
    showFreeShippingPromo && subTotal >= freeShippingMinGhs;

  const handleAddToCart = (product) => {
    addToCart({ product, quantity: 1 });
  };

  const handleQuantityChange = (itemId, newQuantity, maxStock = 999) => {
    const validatedQuantity = Math.max(1, Math.min(newQuantity || 1, maxStock));
    if (validatedQuantity !== newQuantity) {
      logger.warn(`[CartPage] Quantity ${newQuantity} adjusted to ${validatedQuantity}`);
    }
    updateCartItem({ itemId, quantity: validatedQuantity });
  };

  const handleRemoveItem = (itemId) => {
    setRemovingItemId(itemId);
    removeCartItem(itemId, {
      onSettled: () => setRemovingItemId(null),
    });
  };

  const getItemUnitPrice = (item) => {
    if (item?.unitPrice != null && typeof item.unitPrice === 'number' && item.unitPrice >= 0) {
      return item.unitPrice;
    }
    const basePrice = item?.product?.defaultPrice || item?.product?.price || 0;
    if (!basePrice) return 0;
    const promoKey = item?.product?.promotionKey || "";
    if (!promoKey) return basePrice;
    const discountPercent = promotionDiscountMap[promoKey] || 0;
    if (!discountPercent || discountPercent <= 0) return basePrice;
    const discounted = basePrice * (1 - discountPercent / 100);
    return discounted > 0 ? discounted : 0;
  };

  const getItemOriginalUnitPrice = (item) => {
    if (item?.originalUnitPrice != null && typeof item.originalUnitPrice === 'number') {
      return item.originalUnitPrice;
    }
    return null;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/checkout");
  };

  if (isCartLoading) {
    return <LoadingState message="Loading cart..." />;
  }

  return (
    <PageContainer>
      {/* ── Banner ─────────────────────────────────────────── */}
      <PageBanner>
        <BannerOverlay />
        <BannerInner>
          <BannerIcon><FaShoppingCart /></BannerIcon>
          <BannerTextGroup>
            <BannerTitle>Shopping Cart</BannerTitle>
            <BannerSub>
              {products.length} item{products.length !== 1 ? 's' : ''} in your cart
            </BannerSub>
          </BannerTextGroup>
        </BannerInner>
      </PageBanner>

      <ContentWrap>
        {/* ── Notification Banners ────────────────────────── */}
        {hasPreorderItem && (
          <NoticeBanner $variant="preorder">
            <strong>Pre-Order Notice:</strong> This cart contains pre-order items. These will ship
            once they arrive in Ghana and <strong>international shipping charges</strong> will apply.
          </NoticeBanner>
        )}

        {showFreeShippingPromo && products.length > 0 && subTotal > 0 && subTotal < freeShippingMinGhs && (
          <ShippingBanner>
            <ShippingText>
              <FaTruck /> Add <strong>GH₵{(freeShippingMinGhs - subTotal).toFixed(2)}</strong> more to
              unlock free shipping (orders over GH₵{freeShippingMinGhs.toFixed(2)})!
            </ShippingText>
            <ProgressTrack>
              <ProgressFill $progress={shippingProgress} />
            </ProgressTrack>
          </ShippingBanner>
        )}

        {qualifiesForFreeShipping && products.length > 0 && (
          <ShippingBanner $qualified>
            <FaTruck /> You qualify for <strong>free shipping</strong> on this order! 🎉
          </ShippingBanner>
        )}

        {/* ── Main Layout ─────────────────────────────────── */}
        <CartLayout>
          {/* Left – Cart Items */}
          <CartItemsPanel>
            <PanelHeader>
              <PanelTitle>Items ({products.length})</PanelTitle>
              {products.length > 0 && (
                <ClearBtn
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all items from your cart?')) clearCart();
                  }}
                  disabled={isClearing}
                >
                  <FaTrash /> {isClearing ? 'Clearing…' : 'Clear Cart'}
                </ClearBtn>
              )}
            </PanelHeader>

            {isError ? (
              <ErrorState
                title="Failed to load cart"
                message="Error loading cart data. Please try again later."
              />
            ) : products.length === 0 ? (
              <EmptyCartBox>
                <FaShoppingBag size={48} style={{ color: '#D4882A', marginBottom: '1rem' }} />
                <h3>Your cart is empty</h3>
                <p>Browse our products and add items to your cart.</p>
                <BrowseLink href="/">Browse Products</BrowseLink>
              </EmptyCartBox>
            ) : (
              products
                .filter((item) => item.product)
                .map((item) => {
                  if (!item.product) return null;
                  const unitPrice = getItemUnitPrice(item);
                  const origPrice = getItemOriginalUnitPrice(item);
                  const lineTotal = unitPrice * item.quantity;
                  const origLineTotal = origPrice ? origPrice * item.quantity : null;

                  return (
                    <CartItem key={item._id}>
                      <ItemImageWrap>
                        <ItemImage
                          src={
                            item.variantImage ||
                            (item.product?.images?.length > 0 ? item.product.images[0] : null) ||
                            item.product?.imageCover ||
                            '/placeholder-image.svg'
                          }
                          alt={item.product?.name || 'Product'}
                        />
                        {item.product?.isPreOrder && <PreorderBadge>Pre-Order</PreorderBadge>}
                      </ItemImageWrap>

                      <ItemInfo>
                        <ItemName>{item.product?.name || 'Product'}</ItemName>
                        {(item.variantName || item.variantAttributes?.length > 0) && (
                          <ItemVariant>
                            {item.variantName
                              ? `Variant: ${item.variantName}`
                              : item.variantAttributes.map(a => `${a.key}: ${a.value}`).join(' | ')}
                          </ItemVariant>
                        )}
                        {item.product?.isPreOrder && item.product?.preOrderAvailableDate && (
                          <PreorderNote>
                            Ships from {new Date(item.product.preOrderAvailableDate).toLocaleDateString()}
                          </PreorderNote>
                        )}

                        <ItemPriceRow>
                          {origPrice != null ? (
                            <>
                              <OrigPrice>GH₵{origPrice.toFixed(2)}</OrigPrice>
                              <PromoPrice>GH₵{unitPrice.toFixed(2)}</PromoPrice>
                            </>
                          ) : (
                            <UnitPrice>GH₵{unitPrice.toFixed(2)}</UnitPrice>
                          )}
                        </ItemPriceRow>

                        <ItemActions>
                          <QtyWrap>
                            <QtyBtn
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              aria-label="Decrease quantity"
                            >−</QtyBtn>
                            <QtyInput
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                handleQuantityChange(item._id, val, item.product?.stock || 999);
                              }}
                              disabled={isUpdating}
                            />
                            <QtyBtn
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1, item.product?.stock || 999)}
                              disabled={isUpdating || item.quantity >= (item.product?.stock || 999)}
                              aria-label="Increase quantity"
                            >+</QtyBtn>
                          </QtyWrap>

                          <RemoveBtn
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={removingItemId === item._id}
                          >
                            {removingItemId === item._id ? <ButtonSpinner size="sm" /> : <><FaTrash /> Remove</>}
                          </RemoveBtn>
                        </ItemActions>
                      </ItemInfo>

                      <LineTotalCol>
                        {origLineTotal != null ? (
                          <>
                            <OrigLineTotal>GH₵{origLineTotal.toFixed(2)}</OrigLineTotal>
                            <LineTotal>GH₵{lineTotal.toFixed(2)}</LineTotal>
                          </>
                        ) : (
                          <LineTotal>GH₵{lineTotal.toFixed(2)}</LineTotal>
                        )}
                      </LineTotalCol>
                    </CartItem>
                  );
                })
            )}
          </CartItemsPanel>

          {/* Right – Summary */}
          <SummaryPanel>
            <SummaryHeader>Order Summary</SummaryHeader>

            <SummaryRow>
              <span>Subtotal ({products.length} items)</span>
              <span>GH₵{isError ? '0.00' : subTotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span style={{ color: qualifiesForFreeShipping ? '#059669' : 'inherit' }}>
                {qualifiesForFreeShipping ? 'Free' : 'Calculated at checkout'}
              </span>
            </SummaryRow>

            <SummaryDivider />

            <SummaryTotal>
              <span>Total</span>
              <TotalAmount>GH₵{isError ? '0.00' : subTotal.toFixed(2)}</TotalAmount>
            </SummaryTotal>

            <CheckoutBtn
              onClick={handleCheckout}
              disabled={isError || products.length === 0}
              $disabled={isError || products.length === 0}
            >
              <FaLock /> Proceed to Checkout
            </CheckoutBtn>

            <SecureNote>
              <FaLock /> Secure, encrypted checkout
            </SecureNote>
          </SummaryPanel>
        </CartLayout>

        {/* ── You Might Also Like ─────────────────────────── */}
        {!isTrendingLoading && similarProducts.length > 0 && (
          <RecommendedSection>
            <SectionTitle>You Might Also Like</SectionTitle>
            <ProductGrid>
              {similarProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  showAddToCart
                  showWishlistButton={false}
                />
              ))}
            </ProductGrid>
          </RecommendedSection>
        )}
      </ContentWrap>
    </PageContainer>
  );
};

export default CartPage;

/* ─── Styled Components ──────────────────────────────────── */

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: "Inter", sans-serif;
`;

/* ── Banner ─────────────────── */
const PageBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212,136,42,0.15) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease;
`;

const BannerIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212,136,42,0.2);
  border: 2px solid rgba(212,136,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #D4882A;
  flex-shrink: 0;
`;

const BannerTextGroup = styled.div``;

const BannerTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.2rem 0;
`;

const BannerSub = styled.p`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.65);
  margin: 0;
`;

/* ── Content Wrapper ─────────── */
const ContentWrap = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

/* ── Notice Banners ─────────── */
const NoticeBanner = styled.div`
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  line-height: 1.5;
  background: ${({ $variant }) => $variant === 'preorder' ? '#fffbeb' : '#f0fdf4'};
  color: ${({ $variant }) => $variant === 'preorder' ? '#92400e' : '#15803d'};
  border: 1px solid ${({ $variant }) => $variant === 'preorder' ? '#fed7aa' : '#86efac'};

  strong { font-weight: 700; }
`;

const ShippingBanner = styled.div`
  margin-bottom: 1.25rem;
  padding: 0.9rem 1.25rem;
  border-radius: 10px;
  background: ${({ $qualified }) => $qualified ? '#f0fdf4' : '#fff7ed'};
  border: 1px solid ${({ $qualified }) => $qualified ? '#86efac' : '#fcd9a0'};
  color: ${({ $qualified }) => $qualified ? '#15803d' : '#92400e'};
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  strong { font-weight: 700; }
  svg { margin-right: 0.4rem; }
`;

const ShippingText = styled.span`
  display: flex;
  align-items: center;
`;

const ProgressTrack = styled.div`
  height: 6px;
  background: rgba(0,0,0,0.08);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, #D4882A, #f0a845);
  border-radius: 3px;
  transition: width 0.4s ease;
`;

/* ── Cart Layout ─────────────── */
const CartLayout = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

/* ── Cart Items Panel ─────────── */
const CartItemsPanel = styled.div`
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  animation: ${fadeUp} 0.4s ease 0.1s both;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.5rem;
  background: #fafaf8;
  border-bottom: 1px solid #f0e8d8;
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0;
`;

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.2s;

  &:hover:not(:disabled) { color: #dc2626; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyCartBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3.5rem 2rem;
  color: #6b7280;

  h3 { font-size: 1.1rem; font-weight: 700; color: #1a1f2e; margin: 0 0 0.4rem; }
  p  { font-size: 0.875rem; margin: 0 0 1.5rem; }
`;

const BrowseLink = styled.a`
  display: inline-block;
  padding: 0.65rem 1.5rem;
  background: #D4882A;
  color: #fff;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover { background: #B8711F; }
`;

/* ── Cart Item Row ─────────────── */
const CartItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f5f0ea;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: #fdf9f5; }

  @media (max-width: 560px) {
    flex-wrap: wrap;
  }
`;

const ItemImageWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ItemImage = styled.img`
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #f0e8d8;

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
  }
`;

const PreorderBadge = styled.span`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: #1a1f2e;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.04em;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1f2e;
  margin: 0 0 0.25rem;
  line-height: 1.35;
`;

const ItemVariant = styled.span`
  display: block;
  font-size: 0.78rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
`;

const PreorderNote = styled.div`
  font-size: 0.72rem;
  color: #6b7280;
  margin-bottom: 0.4rem;
`;

const ItemPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const UnitPrice = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1f2e;
`;

const OrigPrice = styled.span`
  font-size: 0.85rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const PromoPrice = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #D4882A;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const QtyWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const QtyBtn = styled.button`
  width: 32px;
  height: 32px;
  background: #f9fafb;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: #f0e8d8; color: #D4882A; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const QtyInput = styled.input`
  width: 44px;
  height: 32px;
  text-align: center;
  border: none;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1f2e;
  background: #fff;

  &:disabled { background: #f9fafb; }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #dc2626;
  background: #fff1f0;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: #dc2626; color: #fff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const LineTotalCol = styled.div`
  min-width: 90px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding-top: 0.25rem;

  @media (max-width: 560px) {
    min-width: auto;
    padding-top: 0;
  }
`;

const LineTotal = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1f2e;
`;

const OrigLineTotal = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

/* ── Summary Panel ─────────────── */
const SummaryPanel = styled.div`
  width: 320px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  padding: 1.5rem;
  position: sticky;
  top: 1.5rem;
  animation: ${fadeUp} 0.4s ease 0.15s both;

  @media (max-width: 900px) {
    width: 100%;
    position: static;
  }
`;

const SummaryHeader = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0 0 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 2px solid #f0e8d8;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.65rem;
`;

const SummaryDivider = styled.hr`
  border: none;
  border-top: 1px solid #f0e8d8;
  margin: 0.75rem 0;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1f2e;
`;

const TotalAmount = styled.span`
  font-size: 1.3rem;
  font-weight: 800;
  color: #D4882A;
`;

const CheckoutBtn = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${({ $disabled }) => $disabled ? '#e5e7eb' : 'linear-gradient(135deg, #D4882A 0%, #f0a845 100%)'};
  color: ${({ $disabled }) => $disabled ? '#9ca3af' : '#ffffff'};
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: ${({ $disabled }) => $disabled ? 'none' : '0 4px 14px rgba(212,136,42,0.35)'};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(212,136,42,0.45);
  }
`;

const SecureNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.85rem;
  font-size: 0.75rem;
  color: #9ca3af;

  svg { font-size: 0.7rem; }
`;

/* ── Recommended Section ─────── */
const RecommendedSection = styled.div`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1f2e;
  margin-bottom: 1.25rem;
  position: relative;
  padding-bottom: 0.6rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: #D4882A;
    border-radius: 2px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.1rem;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
`;
