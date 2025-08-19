import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Mock coupon data
  useEffect(() => {
    setTimeout(() => {
      setCoupons([
        {
          id: "cpn1",
          code: "SUMMER25",
          title: "Summer Special",
          description: "25% off all summer items",
          discount: "25%",
          expiration: "2023-09-30",
          minPurchase: 50,
          status: "active",
        },
        {
          id: "cpn2",
          code: "WELCOME10",
          title: "Welcome Offer",
          description: "$10 off your first order",
          discount: "$10",
          expiration: "2023-08-15",
          minPurchase: 30,
          status: "used",
        },
        {
          id: "cpn3",
          code: "FREESHIP",
          title: "Free Shipping",
          description: "Free delivery on all orders",
          discount: "Free Shipping",
          expiration: "2023-12-31",
          minPurchase: 0,
          status: "active",
        },
        {
          id: "cpn4",
          code: "VIP50",
          title: "VIP Discount",
          description: "50% off for VIP members",
          discount: "50%",
          expiration: "2023-07-01",
          minPurchase: 100,
          status: "expired",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredCoupons = coupons.filter(
    (coupon) => filter === "all" || coupon.status === filter
  );

  const handleApplyCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    // In real app: apply coupon to order
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "var(--color-green-700)";
      case "used":
        return "var(--color-blue-700)";
      case "expired":
        return "var(--color-grey-500)";
      default:
        return "var(--color-grey-500)";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>My Coupons</Title>
        <Subtitle>Manage your coupons and apply them during checkout</Subtitle>

        {selectedCoupon && (
          <AppliedCouponBanner>
            <CheckIcon />
            <div>
              <AppliedText>Coupon Applied!</AppliedText>
              <CouponInfo>
                {selectedCoupon.code} - {selectedCoupon.title}
              </CouponInfo>
            </div>
          </AppliedCouponBanner>
        )}
      </Header>

      <FilterSection>
        {["all", "active", "used", "expired"].map((f) => (
          <FilterButton
            key={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All Coupons"
              : f === "active"
              ? "Available"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </FilterButton>
        ))}
      </FilterSection>

      {filteredCoupons.length === 0 ? (
        <EmptyState>
          <WarningIcon />
          <EmptyTitle>No coupons found</EmptyTitle>
          <EmptyMessage>
            {filter === "active"
              ? "You don't have any available coupons at the moment"
              : `You don't have any ${filter} coupons`}
          </EmptyMessage>
        </EmptyState>
      ) : (
        <CouponsGrid>
          {filteredCoupons.map((coupon) => (
            <CouponCard key={coupon.id} status={coupon.status}>
              <CardHeader>
                <div>
                  <CouponTitle>{coupon.title}</CouponTitle>
                  <DiscountValue>{coupon.discount}</DiscountValue>
                  {coupon.minPurchase > 0 && (
                    <MinPurchase>Min. order ${coupon.minPurchase}</MinPurchase>
                  )}
                </div>
                <StatusBadge color={getStatusStyle(coupon.status)}>
                  {coupon.status.charAt(0).toUpperCase() +
                    coupon.status.slice(1)}
                </StatusBadge>
              </CardHeader>

              <CardBody>
                <Description>{coupon.description}</Description>

                <ExpirationRow>
                  <span>Expires: {formatDate(coupon.expiration)}</span>
                  <CopyButton onClick={() => copyToClipboard(coupon.code)}>
                    <CopyIcon />
                    Copy Code
                  </CopyButton>
                </ExpirationRow>

                <ActionRow>
                  <CouponCode>{coupon.code}</CouponCode>

                  {coupon.status === "active" ? (
                    <ApplyButton onClick={() => handleApplyCoupon(coupon)}>
                      Apply
                    </ApplyButton>
                  ) : (
                    <DisabledButton>
                      {coupon.status === "used" ? "Already Used" : "Expired"}
                    </DisabledButton>
                  )}
                </ActionRow>
              </CardBody>
            </CouponCard>
          ))}
        </CouponsGrid>
      )}

      <InfoSection>
        <InfoTitle>How to use your coupons</InfoTitle>
        <InfoList>
          <li>Available coupons can be applied during checkout</li>
          <li>Each coupon can only be used once</li>
          <li>Coupons expire on the specified date</li>
          <li>Some coupons may have minimum order requirements</li>
        </InfoList>
      </InfoSection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 3.2rem 2.4rem;

  @media ${devicesMax.md} {
    padding: 2.4rem 1.6rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3.2rem;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;

  @media ${devicesMax.md} {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
`;

const AppliedCouponBanner = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem;
  background-color: var(--color-green-100);
  border: 1px solid var(--color-green-700);
  border-radius: var(--border-radius-md);
  margin-top: 2rem;
  max-width: 40rem;
`;

const CheckIcon = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  background-color: var(--color-green-700);
  border-radius: 50%;
  margin-right: 1.2rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.6rem;
    height: 1.2rem;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -60%) rotate(45deg);
  }
`;

const AppliedText = styled.p`
  font-weight: 600;
  color: var(--color-green-700);
`;

const CouponInfo = styled.p`
  color: var(--color-green-700);
  font-size: 1.4rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 3.2rem;
`;

const FilterButton = styled.button`
  padding: 1rem 1.6rem;
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.active ? "var(--color-brand-600)" : "var(--color-grey-100)"};
  color: ${(props) =>
    props.active ? "var(--color-white-0)" : "var(--color-grey-700)"};
  border: none;

  &:hover {
    background-color: ${(props) =>
      props.active ? "var(--color-brand-700)" : "var(--color-grey-200)"};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const Spinner = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border: 4px solid var(--color-brand-100);
  border-top: 4px solid var(--color-brand-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4.8rem 2.4rem;
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
`;

const WarningIcon = styled.div`
  width: 6.4rem;
  height: 6.4rem;
  background-color: var(--color-yellow-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.6rem;

  &::before {
    content: "!";
    font-size: 3.2rem;
    font-weight: bold;
    color: var(--color-yellow-700);
  }
`;

const EmptyTitle = styled.h3`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  max-width: 50rem;
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32rem, 1fr));
  gap: 2.4rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled.div`
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s;
  background-color: var(--color-white-0);
  box-shadow: var(--shadow-sm);
  border: 1px solid
    ${(props) =>
      props.status === "active"
        ? "var(--color-green-300)"
        : "var(--color-grey-200)"};

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-0.2rem);
  }

  opacity: ${(props) => (props.status !== "active" ? "0.85" : "1")};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background-color: ${(props) =>
    props.status === "active"
      ? "var(--color-green-50)"
      : "var(--color-grey-50)"};
`;

const CouponTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
`;

const DiscountValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-brand-600);
  margin: 0.8rem 0;
`;

const MinPurchase = styled.span`
  font-size: 1.2rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-600);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-tiny);
`;

const StatusBadge = styled.span`
  padding: 0.4rem 1.2rem;
  border-radius: var(--border-radius-cir);
  font-size: 1.2rem;
  font-weight: 600;
  background-color: ${(props) => props.color + "1a"};
  color: ${(props) => props.color};
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const Description = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-bottom: 1.6rem;
`;

const ExpirationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin-bottom: 1.6rem;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;

  &:hover {
    color: var(--color-brand-800);
    text-decoration: underline;
  }
`;

const CopyIcon = styled.span`
  display: inline-block;
  width: 1.4rem;
  height: 1.4rem;
  margin-right: 0.4rem;
  background-color: var(--color-brand-600);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/%3E%3C/svg%3E");
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.6rem;
`;

const CouponCode = styled.span`
  font-family: monospace;
  padding: 0.8rem 1.2rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const ApplyButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const DisabledButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: not-allowed;
`;

const InfoSection = styled.div`
  margin-top: 4rem;
  padding: 2.4rem;
  background-color: var(--color-blue-100);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-blue-700);
`;

const InfoTitle = styled.h3`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--color-blue-700);
  margin-bottom: 1.2rem;
`;

const InfoList = styled.ul`
  padding-left: 2.4rem;
  color: var(--color-blue-700);

  li {
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
  }
`;

export default CouponsPage;
