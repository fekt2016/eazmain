import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useGetBestSellers } from '../../shared/hooks/useBestSellers';
import logger from '../../shared/utils/logger';
import BestSellersHero from '../../shared/components/bestSellers/BestSellersHero';
import BestSellersToolbar from '../../shared/components/bestSellers/BestSellersToolbar';
import BestSellersGrid from '../../shared/components/bestSellers/BestSellersGrid';
import Pagination from '../../shared/components/bestSellers/Pagination';
import SellerProductsSection from '../../shared/components/bestSellers/SellerProductsSection';
import { SkeletonGrid, EmptyState } from '../../components/loading';
import {
  BestSellersPageContainer,
  ContentContainer,
} from '../bestSellers/bestSellers.styles';

const BestSellersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query parameters
  const sort = searchParams.get('sort') || 'best-seller';
  const category = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24; // Sellers per page

  // State for filters
  const [sortOption, setSortOption] = useState(sort);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useDynamicPageTitle({
    title: "Best Sellers",
    description: "Discover top-performing sellers on EazShop with the most orders. Shop from trusted merchants.",
    defaultTitle: "Best Sellers – EazShop",
    defaultDescription: "Discover top-performing sellers on EazShop.",
  });

  // Fetch best sellers (sellers with most orders)
  const { data, isLoading, error } = useGetBestSellers({
    sort: sortOption,
    category: selectedCategory,
    page,
    limit,
  });

  const sellers = data?.sellers || [];
  const totalPages = data?.totalPages || 1;
  const totalSellers = data?.total || 0;

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
      <BestSellersPageContainer>
        <ContentContainer>
          <EmptyState>
            <h3>Error Loading Best Sellers</h3>
            <p>Something went wrong. Please try again later.</p>
          </EmptyState>
        </ContentContainer>
      </BestSellersPageContainer>
    );
  }

  return (
    <BestSellersPageContainer>
      <BestSellersHero totalSellers={totalSellers} />
      <ContentContainer>
        <BestSellersToolbar
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />
        
        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : sellers.length === 0 ? (
          <EmptyState>
            <h3>No Best Sellers Found</h3>
            <p>Check back soon for top sellers!</p>
          </EmptyState>
        ) : (
          <>
            <BestSellersGrid sellers={sellers} />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </ContentContainer>

      {/* Products from Top Sellers Section */}
      {sellers.length > 0 && (
        <SellerProductsSection sellers={sellers} />
      )}
    </BestSellersPageContainer>
  );
};

export default BestSellersPage;
