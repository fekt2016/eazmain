// src/components/CartPage.jsx
import styled from "styled-components";
import {
  useCartTotals,
  useGetCart,
  useCartActions,
  useAutoSyncCart,
  getCartStructure,
} from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
// import { useMemo } from "react";

const CartPage = () => {
  const { data, isLoading: isCartLoading, isError } = useGetCart();
  console.log("cart data", data);
  const { total: subTotal } = useCartTotals();

  const { updateCartItem, removeCartItem, addToCart } = useCartActions();
  useAutoSyncCart();
  const { isAuthenticated } = useAuth();
  const products = getCartStructure(data);
  console.log("products", products);

  const navigate = useNavigate();
  const handleAddToCart = (product) => {
    addToCart({ product, quantity: 1 });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem({ itemId, quantity: newQuantity });
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
    return <div>Loading...</div>;
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

          {isCartLoading ? (
            <LoadingMessage>Loading cart...</LoadingMessage>
          ) : isError ? (
            <ErrorMessage>Error loading cart data</ErrorMessage>
          ) : products.length === 0 ? (
            <EmptyCart>
              <h3>Your cart is empty</h3>
              <p>Browse our products and add items to your cart</p>
            </EmptyCart>
          ) : (
            products.map((item) => {
              console.log("Item:", item);
              return (
                <CartItem key={item._id}>
                  <ItemImage
                    src={item.product.imageCover}
                    alt={item.product.name}
                  />
                  <ItemDetails>
                    <div>
                      <div>
                        <ItemName>{item.product.name}</ItemName>
                        {/* <ItemName>sku:{cart.variant.sku}</ItemName> */}
                      </div>

                      <ItemPrice>
                        GH₵{item.product.defaultPrice.toFixed(2) || 0}
                      </ItemPrice>
                    </div>
                    <ItemActions>
                      <QuantityButton
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                        disabled={
                          item.quantity <= 1 || updateCartItem.isLoading
                        }
                      >
                        -
                      </QuantityButton>
                      <QuantityInput
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item._id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        disabled={updateCartItem.isLoading}
                      />
                      <QuantityButton
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                        disabled={updateCartItem.isLoading}
                      >
                        +
                      </QuantityButton>
                      <RemoveButton
                        onClick={() => {
                          console.log("Removing item:", item);
                          return handleRemoveItem(item._id);
                        }}
                        disabled={removeCartItem.isLoading}
                      >
                        Remove
                      </RemoveButton>
                      {(updateCartItem.isLoading ||
                        removeCartItem.isLoading) && <LoadingIndicator />}
                    </ItemActions>
                  </ItemDetails>
                  <ItemPrice>
                    GH₵{(item.product.defaultPrice * item.quantity).toFixed(2)}
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

          <CheckoutButton onClick={handleCheckout}>
            Proceed to Checkout
          </CheckoutButton>
        </CartSummary>
      </CartContainer>

      {/* Recommended Products Section - Placeholder */}
      {products.length > 0 && (
        <RecommendedSection>
          <SectionTitle>You Might Also Like</SectionTitle>
          <ProductGrid>
            {/* In a real app, fetch recommended products from API */}
            {products.slice(0, 4).map((item) => (
              <ProductCard key={item.product._id}>
                <ProductImage
                  src={item.product.imageCover}
                  alt={item.product.name}
                />
                <ProductInfo>
                  <ProductName>{item.product.name}</ProductName>
                  <ProductPrice>
                    {/* GH₵{item.product.price.toFixed(2)} */}
                  </ProductPrice>
                  <AddToCartButton
                    onClick={() => handleAddToCart(item.product)}
                    disabled={addToCart.isLoading}
                  >
                    {addToCart.isLoading ? "Adding..." : "Add to Cart"}
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
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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

const QuantityButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #dee2e6;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f1f3f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: rgba(220, 53, 69, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const CheckoutButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 20px;

  &:hover {
    background: #218838;
  }
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

const AddToCartButton = styled.button`
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;

  &:hover:not(:disabled) {
    background: #0069d9;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default CartPage;
