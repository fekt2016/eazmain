import React, { useMemo } from 'react';
import styled from 'styled-components';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import Container from '../../components/ui/Container';
import Grid from '../../components/ui/Grid';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import useProduct from '../../shared/hooks/useProduct';
import { useEazShop } from '../../shared/hooks/useEazShop';
import useCategory from '../../shared/hooks/useCategory';
import ProductCard from '../../shared/components/ProductCard';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedProducts from './components/FeaturedProducts';
import NewArrivalsSection from './components/NewArrivalsSection';
import BestSellersSection from './components/BestSellersSection';
import NewsletterSection from './components/NewsletterSection';

const HomePageWrapper = styled.div`
  background: var(--color-grey-50);
`;

const HomePage = () => {
  useDynamicPageTitle({
    title: "Saiisai - Shop the Best Products Online",
    description: "Discover amazing deals and products on Saiisai. Fast delivery across Ghana.",
    defaultTitle: "Saiisai",
  });

  // Fetch data
  const { getProducts } = useProduct();
  const { data: productsData } = getProducts;
  const { useGetEazShopProducts } = useEazShop();
  const { data: eazshopData } = useGetEazShopProducts();
  const { getCategories } = useCategory();
  const { data: categoriesData } = getCategories;

  const featuredProducts = useMemo(() => {
    const allProducts = productsData?.results || [];
    return allProducts.slice(0, 8).filter(p => p.featured || p.promoted);
  }, [productsData]);

  const newArrivals = useMemo(() => {
    const allProducts = productsData?.results || [];
    return allProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [productsData]);

  const bestSellers = useMemo(() => {
    const allProducts = productsData?.results || [];
    return allProducts
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 6);
  }, [productsData]);

  const categories = useMemo(() => {
    const cats = categoriesData?.results || [];
    return cats.filter(cat => !cat.parentCategory).slice(0, 6);
  }, [categoriesData]);

  return (
    <HomePageWrapper>
      <HeroSection />
      
      <Container>
        <CategoriesSection categories={categories} />
        
        <SectionTitle title="Featured Products" subtitle="Our hand-picked selection" />
        <Grid responsiveColumns>
          {featuredProducts.map(product => (
            <Card key={product._id} clickable variant="elevated">
              <ProductCard product={product} />
            </Card>
          ))}
        </Grid>

        <SectionTitle title="New Arrivals" subtitle="Fresh in stock" />
        <Grid responsiveColumns>
          {newArrivals.map(product => (
            <Card key={product._id} clickable variant="elevated">
              <ProductCard product={product} />
            </Card>
          ))}
        </Grid>

        <SectionTitle title="Best Sellers" subtitle="Top picks by customers" />
        <Grid responsiveColumns>
          {bestSellers.map((product, index) => (
            <Card key={product._id} clickable variant="elevated">
              <ProductCard product={product} rank={index + 1} />
            </Card>
          ))}
        </Grid>

        <NewsletterSection />
      </Container>
    </HomePageWrapper>
  );
};

export default HomePage;
