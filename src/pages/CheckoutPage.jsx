import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useGetUserAddress, useCreateAddress } from "../hooks/useAddress";
import { useCreateOrder } from "../hooks/useOrder";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCart,
  getCartStructure,
  useCartActions,
  useCartTotals,
} from "../hooks/useCart";
import { useApplyCoupon } from "../hooks/useCoupon";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: addressData, isLoading: isAddressLoading } =
    useGetUserAddress();
  const { mutate: createAddress, isLoading: isAddressCreating } =
    useCreateAddress();
  const { data: cartData, isLoading: isCartLoading } = useGetCart();
  const { mutate: applyCouponMutation, isLoading: isApplyingCoupon } =
    useApplyCoupon();
  console.log(isApplyingCoupon);
  // States
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  console.log(discount);
  const [couponMessage, setCouponMessage] = useState("");
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payment_on_delivery");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [couponData, setCouponData] = useState(null);

  // Address states
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    streetAddress: "",
    landmark: "",
    city: "",
    region: "",
    digitalAddress: "",
    contactPhone: "",
  });

  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    network: "mtn",
    number: "",
    name: "",
  });

  // Memoized data
  const address = useMemo(() => {
    return (
      addressData?.data?.addresses || addressData?.data?.data?.addresses || []
    );
  }, [addressData]);

  const defaultAddress = useMemo(() => {
    return address.find((addr) => addr.isDefault);
  }, [address]);
  console.log("default ", defaultAddress);

  const rawItems = getCartStructure(cartData);
  const products = useMemo(() => {
    return rawItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      variant: item.variant,
    }));
  }, [rawItems]);

  const { clearCart } = useCartActions();
  const { total: subTotal } = useCartTotals();
  const { mutate: createOrderMutate } = useCreateOrder();

  // Calculate totals
  const shipping = subTotal > 0 ? 9.99 : 0;
  const taxRate = 0.08;
  const taxableAmount = Math.max(0, subTotal - discount);
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + shipping + tax;

  // Effects
  useEffect(() => {
    if (!isAddressLoading && address.length > 0) {
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (address.length > 0) {
        setSelectedAddressId(address[0]._id);
      }
    }
  }, [isAddressLoading, address, defaultAddress]);

  useEffect(() => {
    if (!isAddressLoading && address.length === 0) {
      setActiveTab("new");
    }
  }, [isAddressLoading, address]);

  // Handlers
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setActiveTab("existing");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setErrors({});
    setFormError("");

    if (name === "contactPhone") {
      let digits = value.replace(/\D/g, "").substring(0, 10);
      let formatted = digits;
      if (digits.length > 3) {
        formatted = `${digits.substring(0, 3)} ${digits.substring(3, 6)}`;
        if (digits.length > 6) {
          formatted += ` ${digits.substring(6, 10)}`;
        }
      }
      setNewAddress((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "digitalAddress") {
      let cleaned = value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .substring(0, 9);
      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = `${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}`;
        if (cleaned.length > 5) {
          formatted += `-${cleaned.substring(5, 9)}`;
        }
      }
      setNewAddress((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setNewAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMobileMoneyChange = (e) => {
    const { name, value } = e.target;
    setMobileMoneyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    const newErrors = {};
    const requiredFields = [
      "fullName",
      "streetAddress",
      "city",
      "region",
      "contactPhone",
    ];

    requiredFields.forEach((field) => {
      if (!newAddress[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (newAddress.contactPhone) {
      const digits = newAddress.contactPhone.replace(/\D/g, "");
      if (
        !/^(020|023|024|025|026|027|028|029|050|054|055|056|057|059)\d{7}$/.test(
          digits
        )
      ) {
        newErrors.contactPhone = "Invalid Ghana phone number";
      }
    }

    if (
      newAddress.digitalAddress &&
      !/^[A-Z]{2}-\d{3}-\d{4}$/.test(newAddress.digitalAddress)
    ) {
      newErrors.digitalAddress = "Invalid format. Use AA-123-4567";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewAddress = (e) => {
    e.preventDefault();
    if (!validateAddress()) {
      setFormError("Please fix the errors in the form");
      return;
    }

    const formattedAddress = {
      ...newAddress,
      contactPhone: newAddress.contactPhone.replace(/\D/g, ""),
    };

    createAddress(formattedAddress, {
      onSuccess: () => {
        setNewAddress({
          fullName: "",
          streetAddress: "",
          landmark: "",
          city: "",
          region: "",
          digitalAddress: "",
          contactPhone: "",
        });
        setActiveTab("existing");
        setErrors({});
        setFormError("");
      },
      onError: (error) => {
        setFormError(
          error.response?.data?.message || "Failed to create address"
        );
      },
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    applyCouponMutation(
      { couponCode: couponCode.toUpperCase(), orderAmount: subTotal },
      {
        onSuccess: (data) => {
          console.log(data);
          if (data.status === "success" && data.data.valid) {
            let discountAmount;
            if (data.data.discountType === "percentage") {
              console.log(data.data.discountValue, subTotal);
              discountAmount = (subTotal * data.data.discountValue) / 100;
              console.log(discountAmount);
            } else {
              discountAmount = data.data.discountValue;
            }

            // if (data.discountType === "percentage") {
            //   setDiscount(discountAmount / 100);
            // }
            setDiscount(discountAmount);
            setCouponMessage(
              data?.data.discountType === "percentage"
                ? `Coupon applied: ${data.data.discountValue}% off`
                : `Coupon applied! GH₵${discountAmount.toFixed(2)} discount`
            );
            setCouponData({
              couponId: data.data.couponId,
              batchId: data.data.batchId,
            });
          } else {
            setDiscount(0);
            setCouponMessage(data.message || "Invalid coupon code");
            setCouponData(null);
          }
        },
        onError: (error) => {
          setDiscount(0);
          setCouponMessage(
            error.response?.data?.message || "Failed to apply coupon"
          );
          setCouponData(null);
        },
      }
    );
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      setFormError("Please select a shipping address");
      return;
    }

    if (paymentMethod === "mobile_money" && !mobileMoneyDetails.number) {
      setFormError("Please enter mobile money details");
      return;
    }

    if (!products || products.length === 0) {
      setFormError("Please add items to cart");
      return;
    }

    const orderData = {
      address: selectedAddressId,
      paymentMethod,
      orderItems: products.map((product) => ({
        product: product.product._id,
        quantity: product.quantity,
        price: product.product.variants.find((v) => v._id === product.variant)
          .price,
        variant: product.variant,
      })),
      ...(couponData && {
        couponCode,
        couponId: couponData.couponId,
        batchId: couponData.batchId,
        discountAmount: discount,
      }),
    };

    createOrderMutate(orderData, {
      onSuccess: (data) => {
        const order = data?.data?.data?.order;
        if (!order) return;

        navigate(`/order-confirmation`, {
          state: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalPrice,
            orderDate: order.createdAt,
            paymentMethod,
            shippingAddress: order.shippingAddress,
            shippingCost: shipping,
            tax,
            subTotal,
            discount,
            orderItems: order.orderItems.map((p) => ({
              id: p.product._id,
              name: p.product.name,
              image: p.product.imageCover,
              price: p.price,
              quantity: p.quantity,
            })),
            status: order.orderStatus,
            contactEmail: order.user.email,
          },
        });
        clearCart();
        queryClient.invalidateQueries("cart");
      },
      onError: (error) => {
        setFormError(error.response?.data?.message || "Failed to place order");
      },
    });
  };

  if (isAddressLoading || isCartLoading) {
    return <LoadingContainer>Loading addresses...</LoadingContainer>;
  }

  return (
    <CheckoutContainer>
      <CheckoutGrid>
        <ShippingSection>
          <SectionHeader>
            <SectionTitle>Shipping Information</SectionTitle>
          </SectionHeader>

          <TabContainer>
            <TabButton
              active={activeTab === "existing"}
              onClick={() => setActiveTab("existing")}
            >
              Select Address
            </TabButton>
            <TabButton
              active={activeTab === "new"}
              onClick={() => setActiveTab("new")}
            >
              Add New Address
            </TabButton>
          </TabContainer>

          <TabContent>
            {activeTab === "existing" ? (
              <AddressList>
                {address.map((addr) => (
                  <AddressItem
                    key={addr._id}
                    selected={selectedAddressId === addr._id}
                    onClick={() => handleAddressSelect(addr._id)}
                  >
                    <RadioContainer>
                      <RadioInput
                        hidden
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => handleAddressSelect(addr._id)}
                      />
                      <CustomRadio selected={selectedAddressId === addr._id} />
                    </RadioContainer>
                    <AddressInfo>
                      <AddressName>{addr.streetAddress}</AddressName>
                      <AddressText>{addr.landmark}</AddressText>
                      <div>
                        <AddressText>{addr.city}</AddressText>
                        <AddressText>{addr.region}</AddressText>
                      </div>
                      <AddressText>{addr.contactPhone}</AddressText>
                    </AddressInfo>
                  </AddressItem>
                ))}
              </AddressList>
            ) : (
              <AddressForm onSubmit={handleNewAddress}>
                {formError && <ErrorMessage>{formError}</ErrorMessage>}
                <FormRow>
                  <FormGroup>
                    <Label>Full Name *</Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={newAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="Full name"
                      required
                    />
                    {errors.fullName && (
                      <ErrorText>{errors.fullName}</ErrorText>
                    )}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Street Address *</Label>
                    <Input
                      type="text"
                      name="streetAddress"
                      value={newAddress.streetAddress}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street"
                      required
                    />
                    {errors.streetAddress && (
                      <ErrorText>{errors.streetAddress}</ErrorText>
                    )}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Landmark</Label>
                    <Input
                      type="text"
                      name="landmark"
                      value={newAddress.landmark}
                      onChange={handleAddressChange}
                      placeholder="Near Osu Castle"
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>City *</Label>
                    <Input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Accra"
                      required
                    />
                    {errors.city && <ErrorText>{errors.city}</ErrorText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Region *</Label>
                    <Input
                      type="text"
                      name="region"
                      value={newAddress.region}
                      onChange={handleAddressChange}
                      placeholder="Greater Accra"
                      required
                    />
                    {errors.region && <ErrorText>{errors.region}</ErrorText>}
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Digital Address</Label>
                    <Input
                      type="text"
                      name="digitalAddress"
                      value={newAddress.digitalAddress}
                      onChange={handleAddressChange}
                      placeholder="GA-123-4567"
                    />
                    {errors.digitalAddress && (
                      <ErrorText>{errors.digitalAddress}</ErrorText>
                    )}
                    <HintText>Format: AA-123-4567 (e.g., GA-123-4567)</HintText>
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <Label>Contact Number *</Label>
                    <Input
                      type="tel"
                      name="contactPhone"
                      value={newAddress.contactPhone}
                      onChange={handleAddressChange}
                      placeholder="020 123 4567"
                      required
                    />
                    {errors.contactPhone && (
                      <ErrorText>{errors.contactPhone}</ErrorText>
                    )}
                    <HintText>
                      Format: 020, 023, 024, etc. followed by 7 digits
                    </HintText>
                  </FormGroup>
                </FormRow>
                <ButtonGroup>
                  <CancelButton
                    type="button"
                    onClick={() => setActiveTab("existing")}
                  >
                    Cancel
                  </CancelButton>
                  <SaveButton type="submit" disabled={isAddressCreating}>
                    {isAddressCreating ? "Saving..." : "Save Shipping Address"}
                  </SaveButton>
                </ButtonGroup>
              </AddressForm>
            )}
          </TabContent>
        </ShippingSection>

        <PaymentSection>
          <SectionHeader>
            <SectionTitle>Payment Method</SectionTitle>
            <SecurityBadge>
              <ShieldIcon>🔒</ShieldIcon>
              <span>Secure Payment</span>
            </SecurityBadge>
          </SectionHeader>

          <PaymentOptions>
            <PaymentOption>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "payment_on_delivery"}
                onChange={() => setPaymentMethod("payment_on_delivery")}
                id="payment-delivery"
              />
              <PaymentLabel htmlFor="payment-delivery">
                <PaymentTitle>Payment on Delivery</PaymentTitle>
                <PaymentDescription>
                  Pay with cash when your order arrives or pay with mobile money
                </PaymentDescription>
              </PaymentLabel>
            </PaymentOption>

            <PaymentOption>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "mobile_money"}
                onChange={() => setPaymentMethod("mobile_money")}
                id="payment-mobile"
              />
              <PaymentLabel htmlFor="payment-mobile">
                <PaymentTitle>Mobile Money</PaymentTitle>
                <PaymentDescription>
                  Pay via MTN Mobile Money, Vodafone Cash, etc.
                </PaymentDescription>

                {paymentMethod === "mobile_money" && (
                  <MobileMoneyForm>
                    <FormGroup>
                      <Label>Network</Label>
                      <Select
                        name="network"
                        value={mobileMoneyDetails.network}
                        onChange={handleMobileMoneyChange}
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Vodafone Cash</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Mobile Number</Label>
                      <Input
                        type="tel"
                        name="number"
                        value={mobileMoneyDetails.number}
                        onChange={handleMobileMoneyChange}
                        placeholder="020 123 4567"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Account Name</Label>
                      <Input
                        type="text"
                        name="name"
                        value={mobileMoneyDetails.name}
                        onChange={handleMobileMoneyChange}
                        placeholder="Name on mobile account"
                      />
                    </FormGroup>
                  </MobileMoneyForm>
                )}
              </PaymentLabel>
            </PaymentOption>

            <PaymentOption>
              <RadioInput
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                id="payment-bank"
              />
              <PaymentLabel htmlFor="payment-bank">
                <PaymentTitle>Bank Transfer</PaymentTitle>
                <PaymentDescription>Direct bank transfer</PaymentDescription>

                {paymentMethod === "bank" && (
                  <PaymentDetails>
                    <BankDetails>
                      <BankInfo>
                        <strong>Bank Name:</strong> Ghana Commercial Bank
                      </BankInfo>
                      <BankInfo>
                        <strong>Account Name:</strong> ShopGH Ltd
                      </BankInfo>
                      <BankInfo>
                        <strong>Account Number:</strong> 1234567890
                      </BankInfo>
                      <BankInfo>
                        <strong>Reference:</strong> Order #ORD-20230708
                      </BankInfo>
                    </BankDetails>
                    <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                      Please use the reference number when making your payment
                    </p>
                  </PaymentDetails>
                )}
              </PaymentLabel>
            </PaymentOption>
          </PaymentOptions>
        </PaymentSection>

        <OrderSummary>
          <SectionTitle>Order Summary</SectionTitle>

          <CouponForm>
            <CouponInput
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={isApplyingCoupon || discount > 0}
            />
            <ApplyButton
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || discount > 0}
            >
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </ApplyButton>
            {couponMessage && (
              <CouponMessage success={discount > 0}>
                {couponMessage}
              </CouponMessage>
            )}
          </CouponForm>

          <SummaryItem>
            <span>Subtotal:</span>
            <span>GH₵{subTotal.toFixed(2)}</span>
          </SummaryItem>

          {discount > 0 && (
            <SummaryItem>
              <span>Discount:</span>
              <span>-GH₵{discount.toFixed(2)}</span>
            </SummaryItem>
          )}

          <SummaryItem>
            <span>Shipping:</span>
            <span>GH₵{shipping.toFixed(2)}</span>
          </SummaryItem>

          <SummaryItem>
            <span>Tax ({taxRate * 100}%):</span>
            <span>GH₵{tax.toFixed(2)}</span>
          </SummaryItem>

          <SummaryTotal>
            <span>Total:</span>
            <span>GH₵{total.toFixed(2)}</span>
          </SummaryTotal>

          <SubmitOrderButton onClick={handlePlaceOrder}>
            Place Order
          </SubmitOrderButton>

          <SecurityFooter>
            <PaymentIcons>
              <PaymentIcon>🔒</PaymentIcon>
              <span>Secure Payment</span>
            </PaymentIcons>
            <PaymentIcons>
              <Icon>💳</Icon>
              <Icon>📱</Icon>
              <Icon>🏦</Icon>
            </PaymentIcons>
          </SecurityFooter>
        </OrderSummary>
      </CheckoutGrid>
    </CheckoutContainer>
  );
};

// Styled Components
const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 0.9rem;
`;

const ErrorText = styled.span`
  color: #dc3545;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
`;

const HintText = styled.span`
  color: #6c757d;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #28a745;
`;

const ShieldIcon = styled.span`
  font-size: 1.2rem;
`;

const SecurityFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const PaymentIcon = styled.span`
  font-size: 1.5rem;
  margin-left: auto;
`;

const PaymentIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
`;

const Icon = styled.span`
  font-size: 1.5rem;
`;

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "shipping payment"
      "summary summary";

    .shipping-section {
      grid-area: shipping;
    }
    .payment-section {
      grid-area: payment;
    }
    .order-summary {
      grid-area: summary;
    }
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ShippingSection = styled(Section)``;
const PaymentSection = styled(Section)``;
const OrderSummary = styled(Section)``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AddressItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #28a745;
    background-color: #f0fff4;
  }
`;

const AddressInfo = styled.div`
  flex: 1;
`;

const AddressName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const AddressText = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 3px;
`;

const AddressForm = styled.form`
  margin-top: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props) => (props.error ? "#dc3545" : "#ddd")};
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    border-color: #28a745;
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;

  &:focus {
    border-color: #28a745;
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
  }
`;

const SaveButton = styled.button`
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #94d3a2;
    cursor: not-allowed;
  }
`;

const SubmitOrderButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
`;

const CustomRadio = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ selected }) => (selected ? "#28a745" : "#ccc")};
  border-radius: 50%;
  background: ${({ selected }) => (selected ? "#28a745" : "#fff")};
  margin-left: 6px;
  position: relative;
  transition: border-color 0.2s, background 0.2s;

  &::after {
    content: "";
    display: ${({ selected }) => (selected ? "block" : "none")};
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
  }
`;

const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  padding: 12px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;

  &:hover {
    background: #c82333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 0;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background: ${({ active }) => (active ? "#28a745" : "#f0f0f0")};
  color: ${({ active }) => (active ? "white" : "#333")};
  border: none;
  border-bottom: 2px solid
    ${({ active }) => (active ? "#218838" : "transparent")};
  border-radius: 4px 4px 0 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #28a745;
    color: white;
  }
`;

const TabContent = styled.div`
  margin-top: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
`;

const SummaryTotal = styled(SummaryItem)`
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;
`;

const CouponForm = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
`;

const CouponInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ApplyButton = styled.button`
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #94d3a2;
    cursor: not-allowed;
  }
`;

const CouponMessage = styled.div`
  position: absolute;
  bottom: -25px;
  left: 0;
  font-size: 0.9rem;
  color: ${(props) => (props.success ? "#28a745" : "#dc3545")};
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const PaymentOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: all 0.2s;

  &:hover {
    border-color: #28a745;
    background-color: #f0fff4;
  }
`;

const PaymentLabel = styled.label`
  flex: 1;
  cursor: pointer;
`;

const PaymentTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const PaymentDescription = styled.div`
  font-size: 0.9rem;
  color: #555;
`;

const PaymentDetails = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const MobileMoneyForm = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;

  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BankDetails = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
  border: 1px solid #eee;
`;

const BankInfo = styled.div`
  font-size: 0.95rem;
  margin-bottom: 4px;
  color: #333;
`;

export default CheckoutPage;
