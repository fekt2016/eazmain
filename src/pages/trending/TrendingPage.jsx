import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import useProduct from '../../shared/hooks/useProduct';
import Container from '../../components/ui/Container';
import PageHero from '../../components/ui/PageHero';
import Grid from '../../components/ui/Grid';
import Card from '../../components/ui/Card';
import ProductCard from '../../shared/components/ProductCard';
import { SkeletonGrid, EmptyState } from '../../components/loading';

const TrendingPageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding-bottom: var(--space-2xl);
`;

const TrendingPage = () => {
    const [searchParams] = useSearchParams();

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 24;

    useDynamicPageTitle({
        title: "Trending Products",
        description: "Discover the most popular products at Saiisai based on purchases and views.",
        defaultTitle: "Trending Products • Saiisai",
    });

    const { useGetTrendingProducts } = useProduct();

    // Fetch trending products
    const { data, isLoading, error } = useGetTrendingProducts({
        page,
        limit,
        sort: '-totalSold,-totalViews'
    });

    // Handle parsing the array properly regardless of backend structure
    const products = data?.data?.products || Array.isArray(data?.results) ? data?.results : (data?.products || []);

    if (error) {
        return (
            <TrendingPageContainer>
                <Container fluid>
                    <EmptyState>
                        <h3>Error Loading Trending Products</h3>
                        <p>Something went wrong. Please try again later.</p>
                    </EmptyState>
                </Container>
            </TrendingPageContainer>
        );
    }

    return (
        <TrendingPageContainer>
            <PageHero
                title="Trending Products"
                subtitle="Discover what everyone is buying and viewing right now."
            />

            <Container fluid>
                {isLoading ? (
                    <SkeletonGrid count={12} />
                ) : products.length === 0 ? (
                    <EmptyState>
                        <h3>No Trending Products Available</h3>
                        <p>Check back later to see what's popular!</p>
                    </EmptyState>
                ) : (
                    <div style={{ padding: '2rem 0' }}>
                        <Grid columns={4}>
                            {products.map((product, index) => (
                                <Card key={product._id} clickable variant="elevated">
                                    <ProductCard product={product} rank={page === 1 ? index + 1 : undefined} />
                                </Card>
                            ))}
                        </Grid>
                    </div>
                )}
            </Container>
        </TrendingPageContainer>
    );
};

export default TrendingPage;
