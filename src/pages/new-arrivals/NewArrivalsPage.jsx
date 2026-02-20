import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useGetNewArrivals } from '../../shared/hooks/useNewArrivals';
import Container from '../../components/ui/Container';
import { SkeletonGrid, EmptyState } from '../../components/loading';
import NewArrivalsHero from '../../shared/components/newArrivals/NewArrivalsHero';
import NewArrivalsToolbar from '../../shared/components/newArrivals/NewArrivalsToolbar';
import NewArrivalsGrid from '../../shared/components/newArrivals/NewArrivalsGrid';
import Pagination from '../../shared/components/newArrivals/Pagination';
import {
  NewArrivalsPageContainer,
} from './newArrivals.styles';

const NewArrivalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get query parameters
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24;

  // State for filters
  const [sortOption, setSortOption] = useState(sort);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useDynamicPageTitle({
    title: "New Arrivals",
    description: "Discover the latest products added to Saiisai.",
    defaultTitle: "New Arrivals • Saiisai",
  });

  // Fetch new arrivals
  const { data, isLoading, error } = useGetNewArrivals({
    sort: sortOption,
    category: selectedCategory,
    page,
    limit,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalProducts = data?.total || 0;

  // Handle changes (same logic)
  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    if (page > 1) newParams.set('page', '1');
    setSearchParams(newParams);
  };

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

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <NewArrivalsPageContainer>
        <Container fluid>
          <EmptyState>
            <h3>Error Loading New Arrivals</h3>
            <p>Something went wrong. Please try again later.</p>
          </EmptyState>
        </Container>
      </NewArrivalsPageContainer>
    );
  }

  return (
    <NewArrivalsPageContainer>
      <NewArrivalsHero totalProducts={totalProducts} />

      <Container fluid>
        <NewArrivalsToolbar
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />

        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState>
            <h3>No New Arrivals</h3>
            <p>Check back soon for new products!</p>
          </EmptyState>
        ) : (
          <>
            <NewArrivalsGrid products={products} />
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
    </NewArrivalsPageContainer>
  );
};

export default NewArrivalsPage;

