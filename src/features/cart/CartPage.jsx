// src/components/CartPage.jsx
import styled from "styled-components";
import {
  useCartTotals,
  useGetCart,
  useCartActions,
  useAutoSyncCart,
  getCartStructure,
} from '../../shared/hooks/useCart';
import { useNavigate } from "react-router-dom";
import useAuth from '../../shared/hooks/useAuth';
import { PrimaryButton, DangerButton, GhostButton, SuccessButton } from '../../shared/components/ui/Buttons';
import { LoadingState, EmptyState, ErrorState, ButtonSpinner } from '../../components/loading';
import { spin } from '../../shared/styles/animations';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import seoConfig from '../../shared/config/seoConfig';
import logger from '../../shared/utils/logger';

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

  const navigate = useNavigate();
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
                        </div>

                        <ItemPrice>
                          GH₵{(item.product?.defaultPrice || item.product?.price || 0).toFixed(2)}
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
                        as={DangerButton}
                        $size="sm"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? <ButtonSpinner size="sm" /> : "Remove"}
                      </RemoveButton>
                    </ItemActions>
                  </ItemDetails>
                  <ItemPrice>
                    GH₵{((item.product?.defaultPrice || item.product?.price || 0) * item.quantity).toFixed(2)}
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

      {/* Recommended Products Section - Placeholder */}
      {products.filter(item => item.product).length > 0 && (
        <RecommendedSection>
          <SectionTitle>You Might Also Like</SectionTitle>
          <ProductGrid>
            {/* In a real app, fetch recommended products from API */}
            {products
              .filter(item => item.product)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.product?._id || item._id}>
                  <ProductImage
                    src={item.product?.imageCover || '/placeholder-image.png'}
                    alt={item.product?.name || 'Product'}
                  />
                  <ProductInfo>
                    <ProductName>{item.product?.name || 'Product Name Not Available'}</ProductName>
                    <ProductPrice>
                      {/* GH₵{(item.product?.price || 0).toFixed(2)} */}
                    </ProductPrice>
                    <AddToCartButton
                      as={PrimaryButton}
                      $size="sm"
                      $fullWidth
                      onClick={() => item.product && handleAddToCart(item.product)}
                      disabled={isAdding || !item.product}
                    >
                      {isAdding ? <ButtonSpinner size="sm" /> : "Add to Cart"}
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
          </ProductGrid>
        </RecommendedSection>
      )}
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
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
  object-fit: cover;
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

// RemoveButton now extends DangerButton from global buttons
const RemoveButton = styled.div``;

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

const ProductCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.img`
  height: 180px;
  width: 100%;
  object-fit: cover;
  background-color: #f1f3f5;
`;

const ProductInfo = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductName = styled.h3`
  margin: 0 0 10px;
  font-size: 1.1rem;
  color: #343a40;
  flex-grow: 1;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #495057;
  font-size: 1.1rem;
  margin-bottom: 15px;
`;

// AddToCartButton now extends PrimaryButton from global buttons
const AddToCartButton = styled.div`
  margin-top: auto;
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: ${spin} 1s ease-in-out infinite;
`;

export default CartPage;
