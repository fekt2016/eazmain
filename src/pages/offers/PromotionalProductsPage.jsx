import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../shared/services/productApi";
import SectionTitle from "../../components/ui/SectionTitle";
import Grid from "../../components/ui/Grid";
import Card from "../../components/ui/Card";
import Container from "../../components/ui/Container";
import ProductCard from "../../shared/components/ProductCard";
import { PATHS } from "../../routes/routePaths";

const PageWrapper = styled.div`
  background: var(--color-grey-50);
  min-height: 100vh;
  padding: 2rem 0 3rem;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Breadcrumb = styled.nav`
  font-size: 0.875rem;
  color: var(--color-grey-600);

  a {
    color: inherit;
    text-decoration: none;
  }

  span {
    margin: 0 0.25rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--color-grey-600);
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-grey-600);
`;

const PromotionalProductsPage = () => {
  const { promoId } = useParams();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promo-products", promoId],
    enabled: !!promoId,
    queryFn: async () => {
      const res = await productService.getAllProducts({
        promotionKey: promoId,
        limit: 100,
      });

      // Backend getAllProduct response shape:
      // { status, results, total, data: { data: [ ...products ] } }
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.data?.products)) return res.data.products;
      if (Array.isArray(res?.products)) return res.products;
      if (Array.isArray(res)) return res;
      return [];
    },
  });

  const products = useMemo(() => data ?? [], [data]);

  const title = promoId
    ? promoId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Special Offer";

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Breadcrumb>
            <Link to={PATHS.HOME}>Home</Link>
            <span>/</span>
            <Link to={PATHS.OFFERS}>Offers</Link>
            <span>/</span>
            <span>{title}</span>
          </Breadcrumb>
          <SectionTitle title={title} subtitle="Products curated for this promotion" />
          <Subtitle>
            Discover items selected just for this campaign. Availability and pricing may be
            limited to the promotion period.
          </Subtitle>
        </Header>

        {isLoading ? (
          <EmptyState>Loading promotional products…</EmptyState>
        ) : isError ? (
          <EmptyState>
            We couldn&apos;t load this promotion right now. Please refresh or try again later.
          </EmptyState>
        ) : products.length === 0 ? (
          <EmptyState>
            No products are currently attached to this promotion.
          </EmptyState>
        ) : (
          <Grid responsiveColumns>
            {products.map((product) => (
              <Card key={product._id} clickable variant="elevated">
                <ProductCard product={product} />
              </Card>
            ))}
          </Grid>
        )}
      </Container>
    </PageWrapper>
  );
};

export default PromotionalProductsPage;

