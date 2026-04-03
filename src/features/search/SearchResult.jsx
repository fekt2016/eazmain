import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { FaFilter, FaTimes, FaSortAmountDown, FaSearch, FaChevronLeft, FaChevronRight, FaShoppingBag } from "react-icons/fa";
import { useSearchResults, useSearchSuggestions } from '../../shared/hooks/useSearch';
import ProductCard from '../../shared/components/ProductCard';
import { LoadingState, SkeletonGrid, ErrorState } from '../../components/loading';
import { fadeIn } from '../../shared/styles/animations';
import { devicesMax } from '../../shared/styles/breakpoint';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/** Below this width: filter drawer + mobile filter button. (devicesMax.lg is ~1638px — too wide for “mobile”.) */
const mqDownLg = '(max-width: 63.9375rem)';
const mqUpLg = '(min-width: 64rem)';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { parseSearchParams, buildSearchUrl, highlightSearchTerm, escapeForDisplay } from '../../shared/utils/searchUtils.jsx';
import useCategory from '../../shared/hooks/useCategory';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories: categoryList = [], isLoading: isCategoriesLoading } = useCategory();

  // Parse URL params using utility
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return parseSearchParams(searchParams);
  }, [location.search]);

  // Initialize state from URL params
  const [sortBy, setSortBy] = useState(urlParams.sortBy || "relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: urlParams.category ? [urlParams.category] : [],
    priceRange: {
      min: urlParams.minPrice ? parseFloat(urlParams.minPrice) : 0,
      max: urlParams.maxPrice ? parseFloat(urlParams.maxPrice) : 5000,
    },
    rating: urlParams.rating ? parseFloat(urlParams.rating) : null,
    inStock: urlParams.inStock || false,
    onSale: urlParams.onSale || false,
  });

  // Keep UI state aligned with URL for back/forward nav and header-driven searches.
  useEffect(() => {
    const nextSortBy = urlParams.sortBy || "relevance";
    const nextFilters = {
      category: urlParams.category ? [urlParams.category] : [],
      priceRange: {
        min: urlParams.minPrice ? parseFloat(urlParams.minPrice) : 0,
        max: urlParams.maxPrice ? parseFloat(urlParams.maxPrice) : 5000,
      },
      rating: urlParams.rating ? parseFloat(urlParams.rating) : null,
      inStock: urlParams.inStock || false,
      onSale: urlParams.onSale || false,
    };

    setSortBy((prev) => (prev === nextSortBy ? prev : nextSortBy));
    setFilters((prev) => {
      const same =
        prev.category[0] === nextFilters.category[0] &&
        prev.priceRange.min === nextFilters.priceRange.min &&
        prev.priceRange.max === nextFilters.priceRange.max &&
        prev.rating === nextFilters.rating &&
        prev.inStock === nextFilters.inStock &&
        prev.onSale === nextFilters.onSale;
      return same ? prev : nextFilters;
    });
  }, [urlParams]);

  // Build query params for API — filter UI state must override URL fields so requests stay in sync
  // before the debounced navigate runs, and so clearing a filter actually removes it from the request.
  const queryParams = useMemo(() => {
    const params = {
      ...urlParams,
      sortBy,
      category:
        filters.category.length > 0 ? filters.category[0] : undefined,
      minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
      maxPrice: filters.priceRange.max < 5000 ? filters.priceRange.max : undefined,
      rating:
        filters.rating != null && filters.rating !== "" ? filters.rating : undefined,
      inStock: filters.inStock ? true : undefined,
      onSale: filters.onSale ? true : undefined,
    };
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === "") {
        delete params[key];
      }
    });
    return params;
  }, [urlParams, sortBy, filters]);

  // Sync URL when filters/sort change. Skip the first run so we do not clobber ?page= from a shared link.
  const skipNextUrlSyncRef = useRef(true);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (skipNextUrlSyncRef.current) {
        skipNextUrlSyncRef.current = false;
        return;
      }
      const newUrl = buildSearchUrl({
        q: urlParams.q,
        type: urlParams.type,
        category:
          filters.category.length > 0 ? filters.category[0] : undefined,
        brand: urlParams.brand,
        minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
        maxPrice: filters.priceRange.max < 5000 ? filters.priceRange.max : undefined,
        rating:
          filters.rating != null && filters.rating !== ""
            ? filters.rating
            : undefined,
        inStock: filters.inStock || undefined,
        onSale: filters.onSale || undefined,
        sortBy: sortBy !== "relevance" ? sortBy : undefined,
        page: 1,
      });

      const currentUrl = location.search.substring(1);
      if (newUrl !== currentUrl) {
        navigate(`/search?${newUrl}`, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, sortBy, urlParams.q, urlParams.type, urlParams.brand, navigate, location.search]);

  const { data: productData, isLoading, error } = useSearchResults(queryParams);

  // Extract products and pagination info with explicit fallbacks
  // Backend now provides all pagination logic including visiblePages
  // Backend response structure: { success: true, data: products[], totalProducts, currentPage, totalPages, pagination }
  // React Query returns: { data: response.data, ... } where response.data is the backend response
  const { products, sellers, totalProducts, currentPage, totalPages, pagination } = useMemo(() => {
    // productData is the backend response: { success: true, data: products[], ... }
    // Handle both direct response and nested response structures
    const data = productData || {};

    // Products can be at data.data (if nested) or data (if direct array) or data.data (if backend wraps it)
    let productsArray = [];
    if (Array.isArray(data.data)) {
      productsArray = data.data;
    } else if (Array.isArray(data)) {
      productsArray = data;
    } else if (data.data?.data && Array.isArray(data.data.data)) {
      productsArray = data.data.data;
    }

    return {
      products: productsArray,
      sellers: data.sellers || [],
      totalProducts: data.totalProducts || data.results || 0,
      currentPage: data.currentPage || data.pagination?.page || 1,
      totalPages: data.totalPages || data.pagination?.totalPages || 1,
      pagination: data.pagination || null, // Backend-provided pagination metadata
    };
  }, [productData]);

  // Derive explicit state flags from raw data for test-safe rendering
  // CRITICAL: These must be computed from the extracted values, not from productData directly
  const productsArray = Array.isArray(products) ? products : [];
  const sellersArray = Array.isArray(sellers) ? sellers : [];
  const totalPagesValue = typeof totalPages === 'number' ? totalPages : 0;

  // Explicit boolean flags - no implicit truthiness
  const hasProducts = productsArray.length > 0;
  const hasSellers = sellersArray.length > 0;
  const hasPagination = totalPagesValue > 1;

  // UI state flags - mutually exclusive and explicit
  const showError = !isLoading && !!error;
  const showEmptyState = !isLoading && !hasProducts && !hasSellers && !error;
  const showProductsGrid = !isLoading && hasProducts && !error;
  const showSellersList = !isLoading && hasSellers && !error;
  const showPagination = !isLoading && hasPagination && !error;

  const searchQuery = urlParams.q || "";
  const searchQuerySafe = escapeForDisplay(searchQuery);

  // Fetch suggestions for "Did you mean" functionality on zero results
  const { data: suggestionsData } = useSearchSuggestions(searchQuery, {
    // Only fetch if empty state is showing and we have a valid query
    // This utilizes tanstack query's lazy execution
  });

  const didYouMeanSuggestions = useMemo(() => {
    if (!showEmptyState || searchQuery.length < 2) return [];
    const data = suggestionsData?.data || suggestionsData || [];
    return data.filter(s => s.text && s.text.toLowerCase() !== searchQuery.toLowerCase());
  }, [suggestionsData, showEmptyState, searchQuery]);

  useDynamicPageTitle({
    title: "Search",
    dynamicTitle: searchQuerySafe && `Search: ${searchQuerySafe} | Saiisai`,
    description: searchQuerySafe ? `Search results for "${searchQuerySafe}"` : "Search products on Saiisai",
    defaultTitle: "Search | Saiisai",
  });

  const toggleFilters = () => setShowFilters(!showFilters);

  const handleCategoryChange = (category) => {
    const updatedCategories = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    setFilters({ ...filters, category: updatedCategories });
  };

  const handleRatingChange = (rating) => {
    setFilters({
      ...filters,
      rating: filters.rating === rating ? null : rating,
    });
  };

  const handlePriceChange = (min, max) => {
    setFilters({ ...filters, priceRange: { min, max } });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Use backend-provided pagination metadata (all logic done in backend)
  // visiblePages array contains page numbers and 'ellipsis-start'/'ellipsis-end' strings
  const visiblePages = useMemo(() => {
    if (pagination?.visiblePages) {
      return pagination.visiblePages;
    }
    // Fallback for backward compatibility (shouldn't happen with new backend)
    if (totalPagesValue <= 1) return [];
    if (totalPagesValue <= 5) {
      return Array.from({ length: totalPagesValue }, (_, i) => i + 1);
    }
    return [1, 'ellipsis-start', currentPage, 'ellipsis-end', totalPagesValue];
  }, [pagination, totalPagesValue, currentPage]);

  // Scroll to top when page changes (declarative, testable approach)
  // Watch urlParams.page (from URL) to catch page changes immediately when URL changes
  // This ensures scrolling happens as soon as the URL changes, before API data updates
  const pageFromUrl = urlParams.page || 1;

  useEffect(() => {
    // Scroll to top whenever the page in the URL changes
    // This includes initial mount (which is fine - ensures user starts at top)
    // and subsequent page changes (which is the main use case)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageFromUrl]);

  const handlePageChange = (newPage) => {
    // Validate page number before navigation
    if (newPage < 1 || newPage > totalPagesValue) {
      return;
    }
    const newUrl = buildSearchUrl({
      ...urlParams,
      page: newPage,
    });
    navigate(`/search?${newUrl}`, { replace: true });
    // Scroll is now handled by useEffect watching currentPage
  };

  const bannerQuery = searchQuerySafe || 'All products';

  return (
    <PageContainer>
      <PageBanner>
        <BannerOverlay />
        <BannerInner>
          <BannerIcon>
            <FaSearch />
          </BannerIcon>
          <BannerTextGroup>
            <BannerTitle data-testid="search-title">
              Search results for <span>&quot;{bannerQuery}&quot;</span>
            </BannerTitle>
            <BannerSub data-testid="search-result-count">
              {totalProducts > 0 ? (
                <>
                  Showing {productsArray.length} of {totalProducts}{' '}
                  {totalProducts === 1 ? 'item' : 'items'}
                  {filters.category.length > 0 && ` · ${filters.category[0]}`}
                </>
              ) : (
                'No matches yet — try adjusting filters or keywords'
              )}
            </BannerSub>
          </BannerTextGroup>
        </BannerInner>
      </PageBanner>

      <ContentWrap>
        <MainLayout>
          {/* Filters Sidebar */}
          <SidebarOverlay $show={showFilters} onClick={toggleFilters} />
          <FilterSidebar $show={showFilters}>
            <FilterHeader>
              <h3>Filters</h3>
              <CloseFiltersButton onClick={toggleFilters}>
                <FaTimes />
              </CloseFiltersButton>
            </FilterHeader>

            <FilterScroll>
              <FilterSection>
                <FilterTitle>Categories</FilterTitle>
                <CheckboxGroup>
                  {isCategoriesLoading ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-grey-500)' }}>Loading categories...</span>
                  ) : categoryList.length > 0 ? (
                    categoryList.map((cat) => {
                      const catName = cat.name || cat;
                      return (
                        <CheckboxLabel key={cat._id || catName}>
                          <input
                            type="checkbox"
                            checked={filters.category.includes(catName)}
                            onChange={() => handleCategoryChange(catName)}
                          />
                          <span>{catName}</span>
                        </CheckboxLabel>
                      );
                    })
                  ) : null}
                </CheckboxGroup>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Price Range</FilterTitle>
                <PriceRangeContainer>
                  <PriceInputGroup>
                    <label>Min</label>
                    <PriceInput
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange(parseInt(e.target.value), filters.priceRange.max)}
                      min="0"
                    />
                  </PriceInputGroup>
                  <PriceSeparator>-</PriceSeparator>
                  <PriceInputGroup>
                    <label>Max</label>
                    <PriceInput
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange(filters.priceRange.min, parseInt(e.target.value))}
                      min={filters.priceRange.min}
                    />
                  </PriceInputGroup>
                </PriceRangeContainer>
                <RangeSliderContainer>
                  <SliderTrack>
                    <SliderRange
                      style={{
                        left: `${(filters.priceRange.min / 5000) * 100}%`,
                        right: `${100 - (filters.priceRange.max / 5000) * 100}%`
                      }}
                    />
                  </SliderTrack>
                  <RangeInput
                    type="range"
                    min="0"
                    max="5000"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value), filters.priceRange.max)}
                  />
                  <RangeInput
                    type="range"
                    min="0"
                    max="5000"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange(filters.priceRange.min, parseInt(e.target.value))}
                  />
                </RangeSliderContainer>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Rating</FilterTitle>
                <RadioGroup>
                  {[4, 3, 2].map((rating) => (
                    <RadioLabel key={rating}>
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleRatingChange(rating)}
                      />
                      <span>{rating}★ & above</span>
                    </RadioLabel>
                  ))}
                </RadioGroup>
              </FilterSection>

              <FilterSection>
                <FilterTitle>Availability</FilterTitle>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={() => setFilters({ ...filters, inStock: !filters.inStock })}
                    />
                    <span>In Stock Only</span>
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={() => setFilters({ ...filters, onSale: !filters.onSale })}
                    />
                    <span>On Sale</span>
                  </CheckboxLabel>
                </CheckboxGroup>
              </FilterSection>
            </FilterScroll>

            <FilterFooter>
              <ApplyButton onClick={toggleFilters}>Apply Filters</ApplyButton>
            </FilterFooter>
          </FilterSidebar>

          {/* Products Section */}
          <ProductsSection>
            <ControlsHeader>
              <MobileFilterButton onClick={toggleFilters}>
                <FaFilter /> Filters
              </MobileFilterButton>

              <SortContainer>
                <FaSortAmountDown />
                <SortSelect value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </SortSelect>
              </SortContainer>
            </ControlsHeader>

            {/* Loading State */}
            {isLoading && (
              <ProductsGrid data-testid="search-loading-grid">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonLoader key={idx} height="380px" borderRadius="16px" />
                ))}
              </ProductsGrid>
            )}

            {/* Error State - Show when error occurs */}
            {showError && (
              <ErrorState
                data-testid="search-error-state"
                title="Error Loading Search Results"
                message={error?.message || "We encountered an error while loading search results. Please try again."}
                action={
                  <button onClick={() => window.location.reload()}>
                    Retry
                  </button>
                }
              />
            )}

            {/* Empty State - Decoupled from products rendering */}
            {showEmptyState && (
              <EmptyState data-testid="search-empty-state">
                <EmptyIcon>
                  <FaSearch />
                </EmptyIcon>
                <h3>No Results Found</h3>
                <p>
                  We couldn't find any products matching{" "}
                  <strong>"{searchQuerySafe}"</strong>.
                </p>
                {didYouMeanSuggestions.length > 0 ? (
                  <EmptySuggestions>
                    <p>Did you mean:</p>
                    <DidYouMeanList>
                      {didYouMeanSuggestions.slice(0, 3).map((suggestion, idx) => (
                        <DidYouMeanItem
                          key={idx}
                          onClick={() => {
                            navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
                          }}
                        >
                          {suggestion.text}
                        </DidYouMeanItem>
                      ))}
                    </DidYouMeanList>
                  </EmptySuggestions>
                ) : (
                  <EmptySuggestions>
                    <p>Try:</p>
                    <ul>
                      <li>Checking your spelling</li>
                      <li>Using different keywords</li>
                      <li>Removing some filters</li>
                      <li>Browsing by category instead</li>
                    </ul>
                  </EmptySuggestions>
                )}
              </EmptyState>
            )}

            {/* Sellers List */}
            {showSellersList && hasSellers && (
              <SellersSection data-testid="search-sellers-list">
                <SellersTitle>Stores matching "{searchQuerySafe}"</SellersTitle>
                <SellersGrid>
                  {sellersArray.map(seller => (
                    <SellerCard key={seller._id} onClick={() => navigate(`/sellers/${seller._id}`)}>
                      <SellerAvatar>
                        {seller.avatar ? <img src={seller.avatar} alt={seller.shopName} /> : <span>{seller.shopName.charAt(0)}</span>}
                      </SellerAvatar>
                      <SellerInfo>
                        <h4>{seller.shopName}</h4>
                        {seller.rating > 0 && <span>★ {seller.rating.toFixed(1)}</span>}
                      </SellerInfo>
                    </SellerCard>
                  ))}
                </SellersGrid>
              </SellersSection>
            )}

            {/* Products Grid - Decoupled from pagination */}
            {/* CRITICAL: Only render when showProductsGrid is true and hasProducts is true */}
            {showProductsGrid && hasProducts && (
              <ProductsGrid data-testid="search-products-grid">
                {productsArray.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    highlightTerm={searchQuery}
                  />
                ))}
              </ProductsGrid>
            )}

            {/* Pagination - Decoupled from products rendering */}
            {/* CRITICAL: Only render when showPagination is true and totalPagesValue > 1 */}
            {showPagination && hasPagination && (
              <PaginationContainer data-testid="search-pagination">
                <PaginationButton
                  data-testid="pagination-prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FaChevronLeft /> Previous
                </PaginationButton>

                <PageNumbers data-testid="pagination-numbers">
                  {visiblePages.map((page, index) => {
                    // Handle ellipsis (backend provides 'ellipsis-start' or 'ellipsis-end')
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <Ellipsis key={`ellipsis-${index}`} data-testid="pagination-ellipsis">
                          ...
                        </Ellipsis>
                      );
                    }

                    // Handle page number (backend provides numeric page numbers)
                    const pageNum = typeof page === 'number' ? page : parseInt(page);
                    return (
                      <PageNumber
                        key={pageNum}
                        data-testid={`pagination-page-${pageNum}`}
                        $active={pageNum === currentPage}
                        onClick={() => handlePageChange(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={pageNum === currentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </PageNumber>
                    );
                  })}
                </PageNumbers>

                <PaginationButton
                  data-testid="pagination-next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPagesValue}
                  aria-label="Next page"
                >
                  Next <FaChevronRight />
                </PaginationButton>
              </PaginationContainer>
            )}
          </ProductsSection>
        </MainLayout>

        {(showProductsGrid || showEmptyState) && !showError && (
          <BottomRow>
            <ContinueLink to="/">
              <FaShoppingBag /> Continue shopping
            </ContinueLink>
          </BottomRow>
        )}
      </ContentWrap>
    </PageContainer>
  );
}

// Styled Components — aligned with Wishlist / Deals (navy banner, gold accents, filter card)
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: 'Inter', sans-serif;
`;

const PageBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 1.5rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212, 136, 42, 0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212, 136, 42, 0.15) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease;
`;

const BannerIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.2);
  border: 2px solid rgba(212, 136, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #d4882a;
  flex-shrink: 0;
`;

const BannerTextGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

const BannerTitle = styled.h1`
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.35rem 0;
  line-height: 1.25;

  span {
    color: rgba(255, 255, 255, 0.92);
    font-weight: 600;
    word-break: break-word;
  }

  @media ${mqUpLg} {
    font-size: 1.85rem;
  }
`;

const BannerSub = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.45;
`;

const ContentWrap = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
`;

const MainLayout = styled.div`
  display: flex;
  gap: 1.5rem;
  position: relative;
  align-items: flex-start;

  @media ${mqUpLg} {
    gap: 2rem;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(26, 31, 46, 0.45);
  z-index: 99;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media ${mqUpLg} {
    display: none;
  }
`;

const FilterSidebar = styled.aside`
  width: 100%;
  max-width: 320px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem 1.35rem;
  height: fit-content;
  position: sticky;
  top: 1rem;
  box-shadow: 0 8px 28px rgba(26, 31, 46, 0.08);
  border: 1px solid #ede6dc;

  @media ${mqDownLg} {
    position: fixed;
    top: 0;
    left: 0;
    max-width: none;
    width: min(360px, 92vw);
    height: 100vh;
    z-index: 100;
    border-radius: 0;
    transform: translateX(${({ $show }) => ($show ? '0' : '-100%')});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media ${mqUpLg} {
    padding: 1.65rem 1.5rem;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ede6dc;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1f2e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 1.1em;
      border-radius: 2px;
      background: #d4882a;
    }
  }
`;

const CloseFiltersButton = styled.button`
  background: rgba(212, 136, 42, 0.12);
  border: 1px solid rgba(212, 136, 42, 0.35);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  font-size: 1.15rem;
  color: #1a1f2e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(212, 136, 42, 0.2);
  }

  @media ${mqUpLg} {
    display: none;
  }
`;

const FilterScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.25rem;

  @media ${mqDownLg} {
    min-height: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0ebe3;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const FilterTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0 0 0.85rem 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #3d4654;
  line-height: 1.3;

  input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #d4882a;
    flex-shrink: 0;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #3d4654;

  input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #d4882a;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PriceInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 1.2rem;
    color: var(--color-grey-500);
  }
`;

const SellersSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(26, 31, 46, 0.06);
  border: 1px solid #ede6dc;
`;

const SellersTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-dark);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &::before {
    content: '🏪';
    font-size: 1.8rem;
  }
`;

const SellersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const SellerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-grey-200);
  background: var(--color-white-0);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary-500);
    box-shadow: 0 4px 12px rgba(255, 60, 0, 0.08); /* Primary color shadow */
    transform: translateY(-2px);
  }
`;

const SellerAvatar = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: 700;
  border: 2px solid var(--color-primary-100);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SellerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-dark);
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 1.3rem;
    color: #f59e0b; /* Star color */
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--color-grey-200);
  border-radius: 8px;
  font-size: 1.4rem;
  
  &:focus {
    border-color: var(--color-primary-500);
    outline: none;
  }
`;

const PriceSeparator = styled.span`
  margin-top: 2rem;
  color: var(--color-grey-400);
`;

const RangeSliderContainer = styled.div`
  position: relative;
  height: 2rem;
  margin-top: 1rem;
`;

const SliderTrack = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: var(--color-grey-200);
  border-radius: 2px;
`;

const SliderRange = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #d4882a, #c47820);
  border-radius: 2px;
`;

const RangeInput = styled.input`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 0;
  -webkit-appearance: none;
  pointer-events: none;
  z-index: 2;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #d4882a;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FilterFooter = styled.div`
  margin-top: auto;
  padding-top: 1.25rem;
  border-top: 1px solid #ede6dc;
  flex-shrink: 0;

  @media ${mqUpLg} {
    display: none;
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 0.9rem 1rem;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 100%);
  color: #fff;
  border: 1px solid rgba(212, 136, 42, 0.45);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(26, 31, 46, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(26, 31, 46, 0.28);
  }
`;

const ProductsSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media ${mqDownLg} {
    justify-content: space-between;
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.15rem;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 100%);
  color: #fff;
  border: 1px solid rgba(212, 136, 42, 0.4);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(26, 31, 46, 0.18);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(26, 31, 46, 0.25);
  }

  @media ${mqDownLg} {
    display: flex;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.1rem;
  margin-left: auto;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #ede6dc;
  box-shadow: 0 4px 16px rgba(26, 31, 46, 0.06);

  svg {
    color: #d4882a;
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

const SortSelect = styled.select`
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #1a1f2e;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding: 0.2rem 0.25rem;
  max-width: 200px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.45s ease 0.05s both;

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  max-width: 520px;
  margin: 0 auto 1rem;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 8px 28px rgba(26, 31, 46, 0.06);
  animation: ${fadeUp} 0.4s ease;

  h3 {
    font-size: 1.35rem;
    font-weight: 700;
    margin-bottom: 0.65rem;
    color: #1a1f2e;
  }

  p {
    font-size: 0.95rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
    line-height: 1.55;
  }
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.1);
  color: #d4882a;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 0.5rem;
`;

const ContinueLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: 2px solid #d4882a;
  border-radius: 30px;
  color: #d4882a;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    background: #d4882a;
    color: #ffffff;
  }
`;

const SkeletonLoader = styled.div`
  background: #eee;
  width: 100%;
  height: ${(props) => props.height || "20px"};
  border-radius: ${(props) => props.borderRadius || "4px"};
  animation: ${css`
    ${fadeIn} 1.5s infinite ease-in-out
  `};
`;

const EmptySuggestions = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: left;
  border: 1px solid var(--color-grey-100);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  p {
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--color-text-dark);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
      position: relative;
      color: var(--color-grey-600);

      &:before {
        content: '•';
        color: var(--color-primary-500);
        position: absolute;
        left: 0;
        font-weight: bold;
      }
    }
  }
`;

const DidYouMeanList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const DidYouMeanItem = styled.span`
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--color-primary-100);

  &:hover {
    background: var(--color-primary-500);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(var(--color-primary-500-rgb), 0.2);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.65rem;
  margin-top: 2rem;
  padding: 1.5rem 0 0;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  background: #ffffff;
  border: 1px solid #ede6dc;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1f2e;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1a1f2e;
    color: #fff;
    border-color: #1a1f2e;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PageNumber = styled.button`
  min-width: 2.75rem;
  height: 2.75rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$active ? '#1a1f2e' : '#ffffff')};
  color: ${(props) => (props.$active ? '#ffffff' : '#1a1f2e')};
  border: 1px solid ${(props) => (props.$active ? '#1a1f2e' : '#ede6dc')};
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d4882a;
    color: ${(props) => (props.$active ? '#fff' : '#d4882a')};
  }
`;

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  color: var(--color-text-light);
  font-size: 1.4rem;
  user-select: none;
`;
