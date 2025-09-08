import { useCallback, useMemo } from "react";
import styled from "styled-components";

import HeroSlider from "../components/sliders/HeroSlider";
import useProduct from "../hooks/useProduct";
import ProductCard from "../components/ProductCard";
import { getOrCreateSessionId } from "../utils/sessionUtils";
import useAnalytics from "../hooks/useAnalytics";
import TopSellers from "../components/Carousel/TopSellers";
import DealsSection from "../components/sections/DealsSection";
import { UseGetDislayDiscount } from "../hooks/useDiscount";

const HomePage = () => {
  const { getProducts } = useProduct();
  const { recordProductView } = useAnalytics();
  const { data: discountData } = UseGetDislayDiscount();
  console.log("discountData", discountData);
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
      <DealsSection
        products={products}
        handleProductClick={handleProductClick}
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  color: var(--color-grey-800);
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
`;

const Section = styled.section`
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--shadow-md);
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
  gap: 10px;

  @media (max-width: 76.8rem) {
    grid-template-columns: 1fr 1fr;
  }
`;

export default HomePage;
