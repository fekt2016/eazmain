import { useCallback, useMemo } from "react";
import styled from "styled-components";

import HeroSlider from "../components/sliders/HeroSlider";
import useProduct from "../hooks/useProduct";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import { useGetFeaturedSellers } from "../hooks/useSeller";
import { Link } from "react-router-dom";
import { getOrCreateSessionId } from "../utils/sessionUtils";
import useAnalytics from "../hooks/useAnalytics";

const HomePage = () => {
  const { getProducts } = useProduct();
  const { recordProductView } = useAnalytics();

  const { data: productsData, isLoading: isProductLoading } = getProducts;

  const { data: featuredSellers, isLoading: isFeaturedSellersLoading } =
    useGetFeaturedSellers({
      limit: 8,
    });

  // console.log("featuredSellers", featuredSellers);
  const products = useMemo(() => {
    return productsData?.results || [];
  }, [productsData]);

  // Sample data for the slider
  const sliderItems = [
    {
      id: 1,
      title: "Summer Collection",
      subtitle: "Up to 50% off on all summer items",
      image:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      buttonText: "Shop Now",
      bgColor: "#ff9a9e",
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Discover our latest collection",
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      buttonText: "Explore",
      bgColor: "#a1c4fd",
    },
    {
      id: 3,
      title: "Winter Essentials",
      subtitle: "Stay warm with our premium collection",
      image:
        "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      buttonText: "Get Warm",
      bgColor: "#ffecd2",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic
  };

  const handleProductClick = useCallback(
    (productId) => {
      const sessionId = getOrCreateSessionId();

      // Optimistically send beacon if available
      if (navigator.sendBeacon) {
        const data = new Blob([JSON.stringify({ productId, sessionId })], {
          type: "application/json",
        });
        navigator.sendBeacon("/analytics/product-view", data);
      }
      // Fallback to mutation
      else {
        recordProductView.mutate({ productId, sessionId });
      }
    },
    [recordProductView]
  );

  // Toggle mobile menu

  if (isProductLoading || isFeaturedSellersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <HeroSlider items={sliderItems} />
      <Section>
        <ProductsGrid>
          {products.map((product) => {
            return (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => handleProductClick(product._id)}
              />
            );
          })}
        </ProductsGrid>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Top Sellers</SectionTitle>
          <SectionSubtitle>Shop from our trusted sellers</SectionSubtitle>
        </SectionHeader>

        <SellersGrid>
          {featuredSellers.map((seller) => (
            <SellerCard key={seller.id} to={`/seller/${seller.id}`}>
              <SellerImage>
                <img src={seller.image} alt={seller.name} />
              </SellerImage>
              <SellerInfo>
                <SellerName>{seller.shopName}</SellerName>
                <SellerRating>
                  <StarRating rating={seller.rating} />
                  <RatingValue>{seller.rating}</RatingValue>
                </SellerRating>
                <SellerProducts>{seller.products} products</SellerProducts>
                <VisitStoreButton>Visit Store</VisitStoreButton>
              </SellerInfo>
            </SellerCard>
          ))}
        </SellersGrid>
      </Section>
      <NewsletterSection>
        <NewsletterContent>
          <NewsletterTitle>Subscribe to Our Newsletter</NewsletterTitle>
          <NewsletterText>
            Get the latest updates on new products and special promotions
          </NewsletterText>
          <NewsletterForm>
            <NewsletterForm onSubmit={handleSubmit}>
              <NewsletterInput
                type="email"
                placeholder="Enter your email address"
              />
              <NewsletterButton>Subscribe</NewsletterButton>
            </NewsletterForm>
          </NewsletterForm>
        </NewsletterContent>
      </NewsletterSection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  /* background-color: #f8f9fc; */
  color: #2e3a59;
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
`;

const Section = styled.section`
  padding: 2rem;
  /* padding: 60px 5%; */
  background: white;
  /* margin-bottom: 30px; */
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  /* margin-bottom: 40px; */
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  /* margin-bottom: 15px; */
  color: #2e3a59;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #858796;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

// const CategoriesGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//   gap: 25px;
// `;

// const CategoryCard = styled.div`
//   background: white;
//   border-radius: 15px;
//   overflow: hidden;
//   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
//   text-align: center;
//   padding: 30px 20px;
//   transition: all 0.3s;
//   cursor: pointer;
//   border: 1px solid #eaecf4;

//   &:hover {
//     transform: translateY(-10px);
//     box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
//     border-color: #4e73df;
//   }
// `;

const CategoryIcon = styled.div`
  font-size: 40px;
  margin-bottom: 20px;
`;

const CategoryName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const CategoryCount = styled.p`
  color: #858796;
  font-size: 14px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const SellersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
`;

const SellerCard = styled(Link)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  border: 1px solid #eaecf4;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const SellerImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  border: 3px solid #f8f9fc;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerInfo = styled.div`
  flex: 1;
`;

const SellerName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const SellerProducts = styled.p`
  font-size: 14px;
  color: #858796;
  margin-bottom: 15px;
`;

const VisitStoreButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fc;
  color: #4e73df;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #4e73df;
    color: white;
  }
`;

const NewsletterSection = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 15px;
  padding: 70px 5%;
  margin: 0 5% 60px;
  color: white;
  text-align: center;
`;

const NewsletterContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const NewsletterTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const NewsletterText = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const NewsletterForm = styled.div`
  display: flex;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 50px 0 0 50px;
  font-size: 16px;
  outline: none;

  @media (max-width: 576px) {
    border-radius: 50px;
    margin-bottom: 10px;
  }
`;

const NewsletterButton = styled.button`
  background: #1cc88a;
  color: white;
  border: none;
  padding: 0 30px;
  border-radius: 0 50px 50px 0;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #17a673;
  }

  @media (max-width: 576px) {
    border-radius: 50px;
    padding: 15px;
  }
`;

const RatingValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #2e3a59;
  margin-left: 8px;
`;

// Add AccountDropdown styled component

export default HomePage;
