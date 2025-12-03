import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useGetDeals } from '../../shared/hooks/useDeals';
import Container from '../../components/ui/Container';
import PageHero from '../../components/ui/PageHero';
import DealsToolbar from '../../components/deals/DealsToolbar';
import DealsCountdown from '../../components/deals/DealsCountdown';
import DealsGrid from '../../components/deals/DealsGrid';
import { SkeletonGrid, EmptyState } from '../../components/loading';
import Pagination from '../../components/ui/Pagination';
import styled from 'styled-components';

const DealsPageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding-bottom: var(--space-2xl);
`;

const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query parameters
  const sort = searchParams.get('sort') || 'default';
  const category = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24;

  // State for filters
  const [sortOption, setSortOption] = useState(sort);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useDynamicPageTitle({
    title: "Deals & Discounts",
    description: "Enjoy exclusive discounts on top products at EazShop.",
    defaultTitle: "Deals & Discounts • EazShop",
  });

  // Fetch deals
  const { data, isLoading, error } = useGetDeals({
    sort: sortOption,
    category: selectedCategory,
    page,
    limit,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalProducts = data?.total || 0;

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    if (page > 1) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <DealsPageContainer>
        <Container fluid>
          <EmptyState>
            <h3>Error Loading Deals</h3>
            <p>Something went wrong. Please try again later.</p>
          </EmptyState>
        </Container>
      </DealsPageContainer>
    );
  }

  return (
    <DealsPageContainer>
      <PageHero
        title="Deals & Discounts"
        subtitle="Enjoy exclusive discounts on top products."
      />
      
      <Container fluid>
        <DealsToolbar
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />

        {/* Optional: Show countdown if there's an active deal event */}
        <DealsCountdown />

        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState>
            <h3>No Deals Available</h3>
            <p>No deals available right now. Check back later!</p>
          </EmptyState>
        ) : (
          <>
            <DealsGrid products={products} />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </Container>
    </DealsPageContainer>
  );
};

export default DealsPage;

