import { useMemo } from "react";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import { Link } from "react-router-dom";
// import GlobalStyles from "../styles/GlobalStyles";
import { useGetFollowedSellerByUser } from "../hooks/useFollow";
// import useAuth from "../hooks/useAuth";
import useProduct from "../hooks/useProduct";
// import { useToggleFollow } from "../hooks/useFollow";

// ============== COMPONENT ==============
const FollowPage = () => {
  // const { userData } = useAuth();
  const { getProducts } = useProduct();
  const { data: productsData } = getProducts;

  const products = useMemo(() => {
    return productsData?.results || [];
  }, [productsData]);

  // const user = useMemo(() => {
  //   return userData?.user || userData?.data || null;
  // }, [userData]);

  const { data: followedData } = useGetFollowedSellerByUser();

  const followedSellers = useMemo(() => {
    return followedData?.data.follows || [];
  }, [followedData]);

  // const followedSellerIds = useMemo(() => {
  //   return followedSellers.map((follow) => follow.seller._id);
  // }, [followedSellers]);

  const sellerMap = useMemo(() => {
    return followedSellers.reduce((map, follow) => {
      if (follow.seller) {
        map[follow.seller._id] = follow.seller;
      }
      return map;
    }, {});
  }, [followedSellers]);

  const newArrivalsBySeller = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const groupedByseller = {};
    followedSellers.forEach((follow) => {
      if (follow.seller) {
        groupedByseller[follow.seller._id] = {
          seller: follow.seller,
          products: [],
        };
      }
    });

    products.forEach((product) => {
      const sellerId = product.seller?._id || product.seller;
      const seller = sellerMap[sellerId];
      if (seller && new Date(product.createdAt) > oneWeekAgo) {
        const isNew = new Date(product.createdAt) > oneWeekAgo;
        if (isNew) {
          if (!groupedByseller[sellerId]) {
            groupedByseller[sellerId] = {
              seller: seller,
              products: [],
            };
          }
          groupedByseller[sellerId].products.push(product);
        }
      }
    });
    return groupedByseller;
  }, [followedSellers, products, sellerMap]);

  // const followedSellerProducts = useMemo(() => {
  //   const oneWeekAgo = new Date();
  //   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  //   if (!followedSellerIds.length) return [];

  //   return products.filter((product) => {
  //     const isFromFollowed = followedSellerIds.includes(
  //       product.seller?._id || product.seller
  //     );

  //     const isNew = new Date(product.createdAt) > oneWeekAgo;
  //     return isFromFollowed && isNew;
  //   });
  // }, [products, followedSellerIds]);

  // Get products from followed sellers (filtered by isNew)
  // const followedSellerProducts = [];

  return (
    <>
      {/* <GlobalStyles /> */}
      <FollowPageContainer>
        {/* All Sellers Section */}
        <Section>
          <SectionHeader>
            <Title>Follow Sellers</Title>
          </SectionHeader>

          <GridContainer>
            {followedSellers.map((follow) => {
              if (!follow.seller) {
                return null;
              }
              const seller = follow.seller;
              const followerCount = Array.isArray(seller.followers)
                ? seller.followers.length
                : 0;

              return (
                <SellerCard key={follow._id}>
                  <CardHeader>
                    <Avatar src={follow.seller.avatar} alt={follow.name} />
                    <SellerInfo>
                      <Name>{follow.seller.shopName}</Name>
                    </SellerInfo>
                  </CardHeader>

                  <Stats>
                    <StatItem>
                      <StatValue>{follow.seller.productCount}</StatValue>
                      <StatLabel>Products</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatValue>{followerCount}</StatValue>
                      <StatLabel>Followers</StatLabel>
                    </StatItem>
                  </Stats>

                  {/* <FollowButton
                  $isFollowing={isFollowing}
                  onClick={() => toggleFollow(follow.id)}
                >
                  {isFollowing ? "Unfollow" : "Follow Seller"}
                </FollowButton> */}
                </SellerCard>
              );
            })}
          </GridContainer>
        </Section>
        {/* New Arrivals Sections - One per seller */}
        {Object.keys(newArrivalsBySeller).map((sellerId) => {
          const sellerGroup = newArrivalsBySeller[sellerId];
          if (sellerGroup.products.length === 0) return null;

          return (
            <Section key={sellerId}>
              <SectionHeader>
                <Subtitle>
                  New Arrivals from {sellerGroup.seller.shopName}
                </Subtitle>
              </SectionHeader>

              <GridContainer>
                {sellerGroup.products.map((product) => (
                  <ProductCard to={`/product/${product._id}`} key={product._id}>
                    <NewBadge>NEW</NewBadge>

                    <CardHeader>
                      <Avatar
                        src={sellerGroup.seller.avatar}
                        alt={sellerGroup.seller.shopName}
                      />
                      <SellerInfo>
                        <Name>{sellerGroup.seller.shopName}</Name>
                      </SellerInfo>
                    </CardHeader>

                    <ProductImage $imageUrl={product.imageCover} />

                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>
                        $
                        {(
                          product.minPrice ||
                          product.defaultPrice ||
                          0
                        ).toFixed(2)}
                      </ProductPrice>
                    </ProductInfo>
                  </ProductCard>
                ))}
              </GridContainer>
            </Section>
          );
        })}
      </FollowPageContainer>
    </>
  );
};

export default FollowPage;
// ============== STYLED COMPONENTS ==============
const FollowPageContainer = styled.div`
  padding: 3.2rem;
  max-width: 120rem;
  margin: 0 auto;

  @media ${devicesMax.md} {
    padding: 2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 4.8rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-grey-900);

  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-grey-800);
  margin-bottom: 1.6rem;

  @media ${devicesMax.sm} {
    font-size: 1.8rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
  gap: 2.4rem;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 1.8rem;
  }
`;

const SellerCard = styled.div`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: var(--shadow-lg);
  }
`;

const ProductCard = styled(Link)`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: var(--shadow-lg);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.6rem;
  gap: 1.2rem;
  background-color: var(--color-grey-50);
`;

const NewBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-green-700);
  color: var(--color-white-0);
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-sm);
  z-index: 10;
`;

const Avatar = styled.img`
  width: 5rem;
  height: 5rem;
  border-radius: var(--Border-radius-cir);
  object-fit: cover;
  border: 2px solid var(--color-sec-700);
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-grey-800);
`;

const ProductImage = styled.div`
  height: 20rem;
  background-color: var(--color-grey-100);
  background-image: ${(props) => `url(${props.$imageUrl})`};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const ProductInfo = styled.div`
  padding: 1.6rem;
`;

const ProductName = styled.h3`
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: var(--color-grey-900);
`;

const ProductPrice = styled.p`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-black-950);
  margin-bottom: 1.2rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 1.6rem;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid var(--color-grey-100);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: var(--color-grey-900);
`;

const StatLabel = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const FollowButton = styled.button`
  display: block;
  width: 100%;
  padding: 1.2rem;
  border: none;
  background-color: ${(props) =>
    props.$isFollowing ? "var(--color-grey-100)" : "var(--color-sec-700)"};
  color: ${(props) =>
    props.$isFollowing ? "var(--color-grey-700)" : "var(--color-white-0)"};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.$isFollowing ? "var(--color-grey-200)" : "var(--color-sec-800)"};
  }
`;
