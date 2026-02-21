// src/components/CartPage.jsx
import { useMemo, useEffect } from "react";
import styled from "styled-components";
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

const CartPage = () => {
  // SEO - Set page title and meta tags
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
    addToCart,
    isUpdating,
    isRemoving,
    isAdding,
    updateCartItemMutation,
    removeCartItemMutation,
    addToCartMutation,
  } = useCartActions();
  useAutoSyncCart();
  const { isAuthenticated } = useAuth();
  const products = getCartStructure(data);

  // Detect if cart contains any pre-order items so we can
  // clearly communicate this to the buyer in the cart UI.
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

  // Redirect to homepage when cart becomes empty
  useEffect(() => {
    if (!isCartLoading && products.length === 0) {
      navigate("/");
    }
  }, [products.length, isCartLoading, navigate]);

  const handleAddToCart = (product) => {
    addToCart({ product, quantity: 1 });
  };

  const handleQuantityChange = (itemId, newQuantity, maxStock = 999) => {
    // SECURITY: Validate quantity - must be between 1 and maxStock
    const validatedQuantity = Math.max(1, Math.min(newQuantity || 1, maxStock));
    if (validatedQuantity !== newQuantity) {
      logger.warn(`[CartPage] Quantity ${newQuantity} adjusted to ${validatedQuantity}`);
    }
    updateCartItem({ itemId, quantity: validatedQuantity });
  };

  const handleRemoveItem = (itemId) => {
    removeCartItem(itemId);
  };

  // Prefer backend-computed unitPrice (includes promo); fallback to product price
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
    if (!isAuthenticated) {
      return navigate("/login");
    }
    navigate("/checkout");
  };
  if (isCartLoading) {
    return <LoadingState message="Loading cart..." />;
  }

  return (
    <PageContainer>
      <PageTitle>Your Shopping Cart</PageTitle>

      {hasPreorderItem && (
        <PreorderCartBanner>
          This cart contains <strong>pre-order</strong> items. These will ship once they arrive in Ghana, and{" "}
          <strong>international shipping charges</strong> will apply.
        </PreorderCartBanner>
      )}

      <CartContainer>
        <CartItems>
          <CartHeader>
            <span>Product</span>
            <span>Total</span>
          </CartHeader>

          {isError ? (
            <ErrorState
              title="Failed to load cart"
              message="Error loading cart data. Please try again later."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              message="Browse our products and add items to your cart"
            />
          ) : (
            products
              .filter((item) => item.product) // Filter out items with null products
              .map((item) => {
                // Additional safety check
                if (!item.product) {
                  return null;
                }

                return (
                  <CartItem key={item._id}>
                    <ItemImage
                      src={item.product?.imageCover || '/placeholder-image.png'}
                      alt={item.product?.name || 'Product'}
                    />
                    <ItemDetails>
                      <div>
                        <div>
                          <ItemName>{item.product?.name || 'Product Name Not Available'}</ItemName>
                          {/* <ItemName>sku:{cart.variant.sku}</ItemName> */}
                          {item.product?.isPreOrder && (
                            <PreorderBadge>
                              Pre-Order
                            </PreorderBadge>
                          )}
                          {item.product?.isPreOrder && item.product?.preOrderAvailableDate && (
                            <PreorderNote>
                              Ships from{" "}
                              {new Date(item.product.preOrderAvailableDate).toLocaleDateString()}
                            </PreorderNote>
                          )}
                        </div>

                        <ItemPrice>
                          {getItemOriginalUnitPrice(item) != null ? (
                            <>
                              <OriginalPrice>GH₵{getItemOriginalUnitPrice(item).toFixed(2)}</OriginalPrice>
                              <PromoPrice>GH₵{getItemUnitPrice(item).toFixed(2)}</PromoPrice>
                            </>
                          ) : (
                            <>GH₵{getItemUnitPrice(item).toFixed(2)}</>
                          )}
                        </ItemPrice>
                      </div>
                      <ItemActions>
                        <QuantityButton
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 || isUpdating
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </QuantityButton>
                        <QuantityInput
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            // SECURITY: Validate quantity input
                            const inputValue = parseInt(e.target.value) || 1;
                            const maxStock = item.product?.stock || 999;
                            handleQuantityChange(item._id, inputValue, maxStock);
                          }}
                          disabled={isUpdating}
                        />
                        <QuantityButton
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                          aria-label="Increase quantity"
                        >
                          +
                        </QuantityButton>
                        <RemoveButton
                          $size="sm"
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? <ButtonSpinner size="sm" /> : "Remove"}
                        </RemoveButton>
                      </ItemActions>
                    </ItemDetails>
                    <ItemPrice>
                      {getItemOriginalUnitPrice(item) != null ? (
                        <>
                          <OriginalPrice>GH₵{(getItemOriginalUnitPrice(item) * item.quantity).toFixed(2)}</OriginalPrice>
                          <PromoPrice>GH₵{(getItemUnitPrice(item) * item.quantity).toFixed(2)}</PromoPrice>
                        </>
                      ) : (
                        <>GH₵{(getItemUnitPrice(item) * item.quantity).toFixed(2)}</>
                      )}
                    </ItemPrice>
                  </CartItem>
                );
              })
          )}
          {/* <div>sku:{cart.variant.sku}</div> */}
        </CartItems>

        <CartSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          <SummaryRow>
            <span>Subtotal</span>
            <span>GH₵{subTotal.toFixed(2)}</span>
          </SummaryRow>
          {/* <SummaryRow>
            <span>Shipping</span>
            <span>GH₵{shipping.toFixed(2)}</span>
          </SummaryRow> */}
          {/* <SummaryRow>
            <span>Tax</span>
            <span>GH₵{tax.toFixed(2)}</span>
          </SummaryRow> */}
          <SummaryRow total>
            <span>subTotal</span>
            <span>GH₵{subTotal.toFixed(2)}</span>
          </SummaryRow>

          <CheckoutButton
            as={PrimaryButton}
            $size="lg"
            $fullWidth
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </CheckoutButton>
        </CartSummary>
      </CartContainer>

      {/* You Might Also Like – similar products (trending), excluding cart items; hide if none */}
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
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: var(--font-body);
`;

const PageTitle = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5rem;
`;

const CartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const CartItems = styled.div`
  flex: 3;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const CartSummary = styled.div`
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
  height: fit-content;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  font-weight: 600;
  color: #495057;
`;

const CartItem = styled.div`
  display: flex;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  transition: background-color 0.2s;
  align-items: center;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  background-color: transparent;
  border-radius: 8px;
  margin-right: 20px;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #343a40;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #495057;
  font-size: 1.1rem;
  min-width: 100px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #6c757d;
  font-weight: 400;
  font-size: 0.95rem;
`;

const PromoPrice = styled.span`
  color: #0d6efd;
  font-weight: 600;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

// QuantityButton extends GhostButton with circular icon-only styling
const QuantityButton = styled(GhostButton)`
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 600;
  min-width: 3.2rem;
`;

const QuantityInput = styled.input`
  width: 50px;
  text-align: center;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 5px;
  font-size: 1rem;

  &:disabled {
    background-color: #f8f9fa;
  }
`;

// RemoveButton – smaller variant of DangerButton
const RemoveButton = styled(DangerButton)`
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  min-height: unset;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  color: #343a40;
  margin-top: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  color: ${(props) => (props.total ? "#2c3e50" : "#6c757d")};
  font-weight: ${(props) => (props.total ? "600" : "400")};
  font-size: ${(props) => (props.total ? "1.2rem" : "1rem")};

  &:last-of-type {
    padding-top: 10px;
    border-top: 1px solid #eaeaea;
  }
`;

// CheckoutButton now extends PrimaryButton from global buttons
const CheckoutButton = styled.div`
  margin-top: 20px;
`;

const PreorderCartBanner = styled.div`
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fed7aa;
  font-size: 0.85rem;
  line-height: 1.4;

  strong {
    font-weight: 700;
  }
`;

const PreorderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
  margin-right: 0.25rem;
  padding: 0.08rem 0.35rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
`;

const PreorderNote = styled.div`
  margin-top: 0.15rem;
  font-size: 0.7rem;
  color: #4b5563;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #6c757d;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #495057;
  }
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #dc3545;
`;

const RecommendedSection = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
`;

export default CartPage;
