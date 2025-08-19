import { FaHeart, FaShoppingBag } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { useGetSellerProfile } from "../hooks/useSeller";
import useProduct from "../hooks/useProduct";
import StarRating from "../components/StarRating";
import { useEffect, useMemo, useRef } from "react";
import { useToggleFollow, useGetSellersFollowers } from "../hooks/useFollow";
import { useAddHistoryItem } from "../hooks/useBrowserhistory";

const PublicSellerProfile = () => {
  const { id: sellerId } = useParams();

  // const products = [];
  const { useGetAllPublicProductBySeller } = useProduct();

  const {
    data: sellerData,
    isLoading: isSellerLoading,
    error: sellerError,
  } = useGetSellerProfile(sellerId);
  const { toggleFollow, isFollowing } = useToggleFollow(sellerId);
  console.log("isFollowing", isFollowing);

  const { data: followerData, isLoading: isFollowersLoading } =
    useGetSellersFollowers(sellerId);

  const followers = useMemo(() => {
    return followerData?.data.follows;
  }, [followerData]);

  const { data: products, isLoading: isProductsLoading } =
    useGetAllPublicProductBySeller(sellerId);

  const seller = useMemo(() => {
    return sellerData?.data.data.data;
  }, [sellerData]);
  const hasRecordedHistory = useRef(false);
  const addHistoryItem = useAddHistoryItem();

  useEffect(() => {
    if (seller && !hasRecordedHistory.current) {
      hasRecordedHistory.current = true;

      addHistoryItem.mutate({
        type: "seller",
        itemId: seller._id,
        itemData: {
          name: seller.shopName,
          image: seller.avatar || "",
          rating: seller.ratings?.average || 0,
          reviewsCount: seller.ratings?.count || 0,
          location: seller.location || "Unknown",
          memberSince: new Date(seller.createdAt).getFullYear(),
        },
      });
    }
  }, [seller, addHistoryItem]);

  // const [seller, setSeller] = useState(null);

  if (isSellerLoading || isProductsLoading || isFollowersLoading) {
    return <LoadingContainer>Loading seller profile...</LoadingContainer>;
  }

  if (!seller) {
    return <NotFoundContainer>Seller not found</NotFoundContainer>;
  }
  if (sellerError) {
    return <NotFoundContainer>{sellerError.message}</NotFoundContainer>;
  }

  // console.log("products", products);
  return (
    <ProfileContainer>
      <Banner bgImage={seller.avatar}>
        <ShopInfo>
          <Avatar src={seller.avatar} alt={seller.shopName} />
          <ShopName>{seller.shopName}</ShopName>
        </ShopInfo>
      </Banner>

      <ContentWrapper>
        <MainContent>
          <Section>
            <About>
              <SectionTitle>About {seller.shopName}</SectionTitle>
              <Rating>
                <StarRating rating={seller.ratings.average} />
                <span>({seller.ratings.count} reviews)</span>
              </Rating>
            </About>
            <Description>{seller.description}</Description>

            <InfoGrid>
              {/* <InfoItem>
                <strong>Owner:</strong> {seller.ownerName}
              </InfoItem> */}
              <InfoItem>
                <strong>Location:</strong> {seller.location}
              </InfoItem>
              <InfoItem>
                <strong>Member since:</strong>
                {new Date(seller.createdAt).getFullYear()}
              </InfoItem>
            </InfoGrid>
          </Section>

          {/* <Section>
            <SectionTitle>Shop Policies</SectionTitle>
            <PolicyList>
              {products.map((policy, index) => (
                <PolicyItem key={index}>
                  <FaCheck size={16} color="#4CAF50" />
                  {policy}
                </PolicyItem>
              ))}
            </PolicyList>
          </Section> */}
        </MainContent>

        <Sidebar>
          <ContactCard>
            <Follower>
              <span>{followers?.length}</span>
              <span> Followers</span>
            </Follower>

            <FollowButton onClick={toggleFollow}>
              <FaHeart size={16} />
              {isFollowersLoading
                ? "following..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </FollowButton>
          </ContactCard>
        </Sidebar>
      </ContentWrapper>

      <ProductsSection>
        <SectionHeader>
          <SectionTitle>Products from {seller.shopName}</SectionTitle>
          <ResultsCount>{products.length} items</ResultsCount>
        </SectionHeader>

        <ProductGrid>
          {products.map((product) => {
            console.log("product", product);
            return (
              <ProductCard key={product?._id} to={`/product/${product?._id}`}>
                <ProductImage src={product?.imageCover} alt={product?.name} />
                <ProductInfo>
                  <ProductName>{product?.name}</ProductName>
                  <ProductPrice>
                    ${product?.defaultPrice.toFixed(2)}
                  </ProductPrice>
                  <ProductRating>
                    <StarRating rating={product?.rating} />
                  </ProductRating>
                </ProductInfo>
                <ProductActions>
                  <ActionButton>
                    <FaHeart size={18} />
                  </ActionButton>
                  <ActionButton>
                    <FaShoppingBag size={18} />
                  </ActionButton>
                </ProductActions>
              </ProductCard>
            );
          })}
        </ProductGrid>
      </ProductsSection>
    </ProfileContainer>
  );
};

export default PublicSellerProfile;

// Styled Components
const ProfileContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 40px;
`;
const About = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;
const Follower = styled.span`
  font-size: 2rem;
  font-weight: 600;
  color: #4a6cf7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const Banner = styled.div`
  position: relative;
  height: 250px;
  background-image: url(${(props) => props.bgImage});
  background-size: cover;
  background-position: center;
  background-color: #f5f5f5;
  display: flex;
  align-items: flex-end;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ShopInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 60px;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  background-color: white;
  object-fit: cover;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ShopName = styled.h1`
  margin: 15px 0 5px;
  font-size: 2.2rem;
  color: #333;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 1rem;
  color: #666;

  span {
    margin-left: 5px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 40px;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 3;
`;

const Sidebar = styled.div`
  flex: 1;
`;

const Section = styled.section`
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const Description = styled.p`
  line-height: 1.7;
  color: #555;
  margin-bottom: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const InfoItem = styled.div`
  background: #f9f9f9;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 0.95rem;
`;

// const PolicyList = styled.ul`
//   list-style: none;
//   padding: 0;
// `;

// const PolicyItem = styled.li`
//   display: flex;
//   align-items: center;
//   gap: 10px;
//   padding: 10px 0;
//   border-bottom: 1px solid #f0f0f0;

//   &:last-child {
//     border-bottom: none;
//   }
// `;

const ContactCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
  text-align: center;
`;

// const ContactTitle = styled.h3`
//   font-size: 1.2rem;
//   margin-bottom: 20px;
// `;

// const MessageButton = styled.button`
//   width: 100%;
//   padding: 12px;
//   background: #4a6cf7;
//   color: white;
//   border: none;
//   border-radius: 6px;
//   font-weight: 600;
//   cursor: pointer;
//   margin-bottom: 12px;
//   transition: background 0.2s;

//   &:hover {
//     background: #3a5af5;
//   }
// `;

const FollowButton = styled.button`
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #4a6cf7;
  border: 1px solid #4a6cf7;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f0f4ff;
  }
`;

const ProductsSection = styled.div`
  margin-top: 40px;
  padding: 0 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ResultsCount = styled.span`
  color: #666;
  font-size: 0.95rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 25px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const ProductCard = styled(Link)`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-bottom: 1px solid #f0f0f0;
`;

const ProductInfo = styled.div`
  padding: 15px;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  margin: 0 0 8px;
  color: #333;
  font-weight: 600;
`;

const ProductPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #4a6cf7;
  margin-bottom: 5px;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #666;
`;

const ProductActions = styled.div`
  display: flex;
  padding: 0 15px 15px;
  gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 20px;
  font-size: 1.2rem;
  color: #666;
`;

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 100px 20px;
  font-size: 1.5rem;
  color: #ff4d4f;
`;
