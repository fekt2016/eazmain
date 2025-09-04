import { useCallback, useMemo } from "react";
import styled from "styled-components";

import HeroSlider from "../components/sliders/HeroSlider";
import useProduct from "../hooks/useProduct";
import ProductCard from "../components/ProductCard";
import { getOrCreateSessionId } from "../utils/sessionUtils";
import useAnalytics from "../hooks/useAnalytics";
import TopSellers from "../components/Carousel/TopSellers";

const HomePage = () => {
  const { getProducts } = useProduct();
  const { recordProductView } = useAnalytics();

  const { data: productsData } = getProducts;

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

  return (
    <PageContainer>
      <HeroSlider items={sliderItems} />
      <TopSellers />

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
  /* background-color: red; */
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 30px;
`;

const NewsletterSection = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: var(--border-radius-lg);
  padding: 7rem 5%;
  margin: 0 5% 6rem;
  color: var(--color-white-0);
  text-align: center;
`;

const NewsletterContent = styled.div`
  max-width: 70rem;
  margin: 0 auto;
`;

const NewsletterTitle = styled.h2`
  font-size: 3.6rem;
  font-weight: 700;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const NewsletterText = styled.p`
  font-size: 1.8rem;
  margin-bottom: 30px;
  opacity: 0.9;

  @media (max-width: 76.8rem) {
    font-size: 1.6rem;
  }
`;

const NewsletterForm = styled.div`
  display: flex;
  max-width: 50rem;
  margin: 0 auto;

  @media (max-width: 57.6rem) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 1.5rem 2rem;
  border: none;
  border-radius: 5rem 0 0 5rem;
  font-size: 1.6rem;
  outline: none;

  @media (max-width: 57.6rem) {
    border-radius: 5rem;
    margin-bottom: 1rem;
  }
`;

const NewsletterButton = styled.button`
  background-color: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  padding: 0 30px;
  border-radius: 0 50px 50px 0;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--color-primary-600);
  }

  @media (max-width: 57.6rem) {
    border-radius: 5rem;
    padding: 1.5rem;
  }
`;

const RatingValue = styled.span`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-left: 8px;
`;

// Add AccountDropdown styled component

export default HomePage;
