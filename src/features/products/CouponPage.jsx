import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { spin } from "../../shared/styles/animations";
import { devicesMax } from '../../shared/styles/breakpoint';
import { FaCopy, FaCheck, FaGift, FaClock, FaShoppingBag, FaTag, FaInfoCircle, FaFire } from "react-icons/fa";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Mock coupon data
  useEffect(() => {
    setTimeout(() => {
      setCoupons([
        {
          id: "cpn1",
          code: "SUMMER25",
          title: "Summer Special",
          description: "25% off all summer collection items",
          discount: "25%",
          expiration: "2024-09-30",
          minPurchase: 50,
          status: "active",
          category: "seasonal",
          featured: true
        },
        {
          id: "cpn2",
          code: "WELCOME10",
          title: "Welcome Offer",
          description: "$10 off your first order",
          discount: "$10",
          expiration: "2024-08-15",
          minPurchase: 30,
          status: "used",
          category: "welcome"
        },
        {
          id: "cpn3",
          code: "FREESHIP",
          title: "Free Shipping",
          description: "Free delivery on all orders",
          discount: "Free Shipping",
          expiration: "2024-12-31",
          minPurchase: 0,
          status: "active",
          category: "shipping"
        },
        {
          id: "cpn4",
          code: "VIP50",
          title: "VIP Discount",
          description: "50% off for VIP members",
          discount: "50%",
          expiration: "2024-07-01",
          minPurchase: 100,
          status: "expired",
          category: "vip"
        },
        {
          id: "cpn5",
          code: "FLASH30",
          title: "Flash Sale",
          description: "30% off limited time offer",
          discount: "30%",
          expiration: "2024-06-20",
          minPurchase: 25,
          status: "active",
          category: "flash",
          featured: true
        },
        {
          id: "cpn6",
          code: "LOYAL15",
          title: "Loyalty Reward",
          description: "15% off for loyal customers",
          discount: "15%",
          expiration: "2024-11-30",
          minPurchase: 40,
          status: "active",
          category: "loyalty"
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredCoupons = coupons.filter(
    (coupon) => filter === "all" || coupon.status === filter
  );

  const featuredCoupons = coupons.filter(coupon => coupon.featured && coupon.status === "active");

  const handleApplyCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    // In real app: apply coupon to order
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      alert(`Failed to copy: ${code}`);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: "var(--color-green-500)", bg: "var(--color-green-50)", text: "Ready to use" },
      used: { color: "var(--color-blue-500)", bg: "var(--color-blue-50)", text: "Already used" },
      expired: { color: "var(--color-grey-400)", bg: "var(--color-grey-100)", text: "Expired" }
    };
    return configs[status] || configs.expired;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysUntilExpiry = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <SpinnerContainer>
          <Spinner />
          <LoadingText>Loading your coupons...</LoadingText>
        </SpinnerContainer>
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>My Coupons</Title>
            <Subtitle>Redeem your rewards and save on your next purchase</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatItem>
              <StatNumber>{coupons.filter(c => c.status === 'active').length}</StatNumber>
              <StatLabel>Available</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNumber>${coupons.reduce((sum, c) => sum + (c.status === 'active' ? parseInt(c.discount) || 0 : 0), 0)}</StatNumber>
              <StatLabel>Total Savings</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNumber>{coupons.filter(c => c.status === 'used').length}</StatNumber>
              <StatLabel>Redeemed</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>

        {selectedCoupon && (
          <AppliedBanner>
            <BannerContent>
              <Checkmark>
                <FaCheck />
              </Checkmark>
              <BannerText>
                <BannerTitle>Coupon Applied!</BannerTitle>
                <BannerSubtitle>
                  {selectedCoupon.code} - {selectedCoupon.title} has been applied to your cart
                </BannerSubtitle>
              </BannerText>
            </BannerContent>
            <ViewCartButton>View Cart</ViewCartButton>
          </AppliedBanner>
        )}
      </HeaderSection>

      {featuredCoupons.length > 0 && (
        <FeaturedSection>
          <SectionTitle>
            <FaFire style={{ color: "var(--color-orange-500)", marginRight: "8px" }} />
            Featured Offers
          </SectionTitle>
          <FeaturedGrid>
            {featuredCoupons.map((coupon) => (
              <FeaturedCard key={coupon.id}>
                <FeaturedBadge>Hot Deal</FeaturedBadge>
                <FeaturedContent>
                  <FeaturedDiscount>{coupon.discount}</FeaturedDiscount>
                  <FeaturedTitle>{coupon.title}</FeaturedTitle>
                  <FeaturedCode>{coupon.code}</FeaturedCode>
                </FeaturedContent>
              </FeaturedCard>
            ))}
          </FeaturedGrid>
        </FeaturedSection>
      )}

      <ContentSection>
        <FilterHeader>
          <FilterGroup>
            {[
              { key: "all", label: "All Coupons" },
              { key: "active", label: "Available" },
              { key: "used", label: "Used" },
              { key: "expired", label: "Expired" }
            ].map((item) => (
              <FilterTab
                key={item.key}
                active={filter === item.key}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </FilterTab>
            ))}
          </FilterGroup>
          
          <CouponCount>
            {filteredCoupons.length} {filter === 'all' ? 'total' : filter} coupon{filteredCoupons.length !== 1 ? 's' : ''}
          </CouponCount>
        </FilterHeader>

        {filteredCoupons.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaGift />
            </EmptyIcon>
            <EmptyTitle>No coupons found</EmptyTitle>
            <EmptyMessage>
              {filter === "active" 
                ? "You don't have any available coupons at the moment. Check back later for new offers!"
                : `You don't have any ${filter} coupons in your collection.`}
            </EmptyMessage>
          </EmptyState>
        ) : (
          <CouponsGrid>
            {filteredCoupons.map((coupon) => {
              const statusConfig = getStatusConfig(coupon.status);
              const daysUntilExpiry = getDaysUntilExpiry(coupon.expiration);
              
              return (
                <CouponCard key={coupon.id} status={coupon.status}>
                  <CardHeader>
                    <DiscountBadge>
                      <FaTag />
                      <DiscountValue>{coupon.discount}</DiscountValue>
                    </DiscountBadge>
                    <StatusIndicator color={statusConfig.color}>
                      {statusConfig.text}
                    </StatusIndicator>
                  </CardHeader>

                  <CardBody>
                    <CouponTitle>{coupon.title}</CouponTitle>
                    <Description>{coupon.description}</Description>

                    <DetailsRow>
                      <DetailItem>
                        <FaClock />
                        <span>Expires {formatDate(coupon.expiration)}</span>
                        {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                          <ExpiryWarning>{daysUntilExpiry}d left</ExpiryWarning>
                        )}
                      </DetailItem>
                      {coupon.minPurchase > 0 && (
                        <DetailItem>
                          <FaShoppingBag />
                          <span>Min. order ${coupon.minPurchase}</span>
                        </DetailItem>
                      )}
                    </DetailsRow>

                    <ActionSection>
                      <CodeSection>
                        <CodeLabel>Your code:</CodeLabel>
                        <CodeDisplay onClick={() => copyToClipboard(coupon.code)}>
                          <CodeText>{coupon.code}</CodeText>
                          <CopyButton>
                            {copiedCode === coupon.code ? <FaCheck /> : <FaCopy />}
                          </CopyButton>
                        </CodeDisplay>
                      </CodeSection>

                      {coupon.status === "active" ? (
                        <ApplyButton onClick={() => handleApplyCoupon(coupon)}>
                          Apply Coupon
                        </ApplyButton>
                      ) : (
                        <DisabledButton disabled>
                          {coupon.status === "used" ? "Already Used" : "Expired"}
                        </DisabledButton>
                      )}
                    </ActionSection>
                  </CardBody>
                </CouponCard>
              );
            })}
          </CouponsGrid>
        )}
      </ContentSection>

      <InfoSection>
        <InfoHeader>
          <FaInfoCircle />
          How to use your coupons
        </InfoHeader>
        <InfoGrid>
          <InfoItem>
            <InfoNumber>1</InfoNumber>
            <InfoContent>
              <InfoTitle>Browse Available Coupons</InfoTitle>
              <InfoText>Check your available coupons and their expiration dates</InfoText>
            </InfoContent>
          </InfoItem>
          <InfoItem>
            <InfoNumber>2</InfoNumber>
            <InfoContent>
              <InfoTitle>Copy the Code</InfoTitle>
              <InfoText>Click on the coupon code to copy it to your clipboard</InfoText>
            </InfoContent>
          </InfoItem>
          <InfoItem>
            <InfoNumber>3</InfoNumber>
            <InfoContent>
              <InfoTitle>Apply at Checkout</InfoTitle>
              <InfoText>Paste the code in the coupon field during checkout</InfoText>
            </InfoContent>
          </InfoItem>
          <InfoItem>
            <InfoNumber>4</InfoNumber>
            <InfoContent>
              <InfoTitle>Enjoy Savings</InfoTitle>
              <InfoText>Your discount will be automatically applied to your order</InfoText>
            </InfoContent>
          </InfoItem>
        </InfoGrid>
      </InfoSection>
    </PageContainer>
  );
};

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media ${devicesMax.md} {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsCard = styled.div`
  display: flex;
  background: var(--color-white-0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
  min-width: 30rem;

  @media ${devicesMax.sm} {
    min-width: auto;
    width: 100%;
  }
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1.2rem;
`;

const StatNumber = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-primary-600);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  background: var(--color-grey-200);
  margin: 0.4rem 0;
`;

const AppliedBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--color-green-500) 0%, var(--color-green-600) 100%);
  color: var(--color-white-0);
  padding: 1.6rem 2.4rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1.2rem;
    text-align: center;
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Checkmark = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
`;

const BannerText = styled.div``;

const BannerTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
`;

const BannerSubtitle = styled.div`
  font-size: 1.4rem;
  opacity: 0.9;
`;

const ViewCartButton = styled.button`
  background: var(--color-white-0);
  color: var(--color-green-600);
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const FeaturedSection = styled.section`
  margin-bottom: 3.2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.6rem;
  display: flex;
  align-items: center;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.6rem;
`;

const FeaturedCard = styled.div`
  background: linear-gradient(135deg, var(--color-orange-500) 0%, var(--color-red-500) 100%);
  color: var(--color-white-0);
  padding: 2.4rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(249, 115, 22, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(249, 115, 22, 0.4);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`;

const FeaturedContent = styled.div`
  position: relative;
  z-index: 2;
`;

const FeaturedDiscount = styled.div`
  font-size: 3.2rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
`;

const FeaturedTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const FeaturedCode = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  opacity: 0.9;
  letter-spacing: 1px;
`;

const ContentSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  padding: 2.4rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2.4rem;
  gap: 2rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  background: var(--color-grey-50);
  padding: 0.4rem;
  border-radius: 12px;
  flex: 1;
`;

const FilterTab = styled.button`
  flex: 1;
  padding: 1rem 1.6rem;
  border: none;
  background: ${props => props.active ? 'var(--color-white-0)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-primary-600)' : 'var(--color-grey-600)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    color: var(--color-primary-600);
  }
`;

const CouponCount = styled.div`
  font-size: 1.4rem;
  color: var(--color-grey-500);
  font-weight: 500;
  white-space: nowrap;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
`;

const Spinner = styled.div`
  width: 5rem;
  height: 5rem;
  border: 3px solid var(--color-grey-200);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6.4rem 2.4rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 8rem;
  height: 8rem;
  background: var(--color-grey-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  color: var(--color-grey-400);
  margin-bottom: 2rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  max-width: 40rem;
  line-height: 1.5;
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled.div`
  background: var(--color-white-0);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-grey-200);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }

  opacity: ${props => props.status !== "active" ? "0.7" : "1"};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
`;

const DiscountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  color: var(--color-primary-500);
`;

const DiscountValue = styled.div`
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--color-primary-600);
`;

const StatusIndicator = styled.div`
  padding: 0.6rem 1.2rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CardBody = styled.div`
  padding: 0 2rem 2rem;
`;

const CouponTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const Description = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-bottom: 1.6rem;
  line-height: 1.5;
`;

const DetailsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);

  svg {
    width: 1.4rem;
    opacity: 0.7;
  }
`;

const ExpiryWarning = styled.span`
  background: var(--color-orange-100);
  color: var(--color-orange-600);
  padding: 0.2rem 0.8rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  margin-left: auto;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1.2rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CodeSection = styled.div`
  flex: 1;
`;

const CodeLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin-bottom: 0.4rem;
  font-weight: 500;
`;

const CodeDisplay = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-grey-50);
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: var(--color-grey-100);
    border-color: var(--color-grey-300);
  }
`;

const CodeText = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  flex: 1;
  letter-spacing: 1px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary-500);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-600);
  }
`;

const ApplyButton = styled.button`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  padding: 1rem 1.6rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
`;

const DisabledButton = styled.button`
  background: var(--color-grey-200);
  color: var(--color-grey-500);
  border: none;
  padding: 1rem 1.6rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: not-allowed;
  white-space: nowrap;
`;

const InfoSection = styled.div`
  margin-top: 4rem;
  background: var(--color-white-0);
  border-radius: 20px;
  padding: 2.4rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
`;

const InfoHeader = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 2rem;

  svg {
    color: var(--color-primary-500);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
`;

const InfoNumber = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h4`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const InfoText = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  line-height: 1.5;
`;

export default CouponsPage;