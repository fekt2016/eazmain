import React, { useMemo } from "react";
import styled from "styled-components";
import { useEazShop } from "../../shared/hooks/useEazShop";
import ProductCard from "../../shared/components/ProductCard";
import { Link } from "react-router-dom";
import { PATHS } from "../../routes/routePaths";
import { isEazShopProduct } from "../../shared/utils/isEazShopProduct";

const Section = styled.section`
  margin: 3rem 0;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #fef3c7, #e0f2fe);
  border: 1px solid rgba(148, 163, 184, 0.3);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
`;

const Description = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ViewAllLink = styled(Link)`
  color: #0f172a;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const EmptyState = styled.p`
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

const EazShopSection = () => {
  const { useGetEazShopProducts } = useEazShop();
  const { data, isLoading } = useGetEazShopProducts();

  const products = useMemo(() => {
    const list = data?.data?.products || [];
    if (!Array.isArray(list)) return [];
    return list.filter((product) => (
      isEazShopProduct(product) &&
      !product?.isDeleted &&
      !product?.isDeletedByAdmin &&
      !product?.isDeletedBySeller &&
      product?.status !== "archived" &&
      product?.status !== "inactive"
    ));
  }, [data]);

  return (
    <Section>
      <HeaderRow>
        <Title>Saiisai Only (EazShop)</Title>
        <ViewAllLink to={PATHS.PRODUCTS}>View all</ViewAllLink>
      </HeaderRow>
      <Description>
        Curated products sold and fulfilled directly by Saiisai.
      </Description>
      {isLoading ? (
        <EmptyState>Loading Saiisai products...</EmptyState>
      ) : products.length > 0 ? (
        <ProductGrid>
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              showAddToCart
            />
          ))}
        </ProductGrid>
      ) : (
        <EmptyState>No Saiisai products available yet.</EmptyState>
      )}
    </Section>
  );
};

export default EazShopSection;

