import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logger from '../../shared/utils/logger';
import { FaArrowRight, FaShieldAlt, FaMapMarkerAlt, FaFilter, FaTimes, FaSortAmountDown, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useGetFeaturedSellers } from '../../shared/hooks/useSeller';
import Container from '../../shared/components/Container';
import { devicesMax } from '../../shared/styles/breakpoint';
import { PATHS } from "../../routes/routePaths";
import { LoadingState } from '../../components/loading';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import StarRating from '../../shared/components/StarRating';

export default function SellersListPage() {
  useDynamicPageTitle({
    title: 'Sellers - EazShop',
    description: 'Discover trusted sellers on EazShop',
    defaultTitle: 'Sellers - EazShop',
    defaultDescription: 'Discover trusted sellers on EazShop',
  });
  const { data: sellersData, isLoading } = useGetFeaturedSellers({ limit: 100 });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOption, setSortOption] = useState("rating-desc");

  const allSellers = useMemo(() => {
    // Handle different response structures
    if (!sellersData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(sellersData)) {
      return sellersData;
    }
    
    // If it's an object with sellers array
    if (sellersData?.sellers && Array.isArray(sellersData.sellers)) {
      return sellersData.sellers;
    }
    
    // If it's an object with data.sellers
    if (sellersData?.data?.sellers && Array.isArray(sellersData.data.sellers)) {
      return sellersData.data.sellers;
    }
    
    // If it's an object with responseData.sellers
    if (sellersData?.responseData?.sellers && Array.isArray(sellersData.responseData.sellers)) {
      return sellersData.responseData.sellers;
    }
    
    return [];
    }, [sellersData]);

  // Get unique locations
  const locations = useMemo(() => {
    const locationSet = new Set();
    allSellers.forEach(seller => {
      if (seller.location) {
        locationSet.add(seller.location);
      }
    });
    return Array.from(locationSet).sort();
  }, [allSellers]);

  // Filter and sort sellers
  const sellers = useMemo(() => {
    let filtered = [...allSellers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(seller => 
        (seller.shopName || seller.name || "").toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(seller => {
        const rating = seller.rating || seller.ratings?.average || 0;
        return rating >= minRating;
      });
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(seller => 
        seller.location === locationFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "rating-desc":
          return (b.rating || b.ratings?.average || 0) - (a.rating || a.ratings?.average || 0);
        case "rating-asc":
          return (a.rating || a.ratings?.average || 0) - (b.rating || b.ratings?.average || 0);
        case "products-desc":
          return (b.productCount || b.products?.length || 0) - (a.productCount || a.products?.length || 0);
        case "products-asc":
          return (a.productCount || a.products?.length || 0) - (b.productCount || b.products?.length || 0);
        case "name-asc":
          return (a.shopName || a.name || "").localeCompare(b.shopName || b.name || "");
        case "name-desc":
          return (b.shopName || b.name || "").localeCompare(a.shopName || a.name || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [allSellers, searchQuery, minRating, locationFilter, sortOption]);

  const toggleFilters = () => setShowFilters(!showFilters);
  const clearFilters = () => {
    setSearchQuery("");
    setMinRating(0);
    setLocationFilter("");
    setSortOption("rating-desc");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <LoadingState />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Container>
          <PageTitle>Verified Sellers</PageTitle>
          <PageDescription>Shop from trusted and verified sellers on EazShop</PageDescription>
        </Container>
      </PageHeader>

      <ContentWrapper>
        <Container>
          <ContentLayout>
            {/* Filter Overlay */}
            <FilterOverlay $isOpen={showFilters} onClick={toggleFilters} />

            {/* Filter Sidebar */}
            <FilterSidebar $isOpen={showFilters}>
            <FilterHeader>
              <h3>Filters</h3>
              <CloseButton onClick={toggleFilters}>
                <FaTimes />
              </CloseButton>
            </FilterHeader>

            <FilterScroll>
              {/* Search Filter */}
              <FilterGroup>
                <FilterSectionTitle>
                  <span>Search</span>
                </FilterSectionTitle>
                <SearchInputWrapper>
                  <FaSearch />
                  <SearchInput
                    type="text"
                    placeholder="Search by shop name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </SearchInputWrapper>
              </FilterGroup>

              {/* Rating Filter */}
              <FilterGroup>
                <FilterSectionTitle>
                  <span>Minimum Rating</span>
                </FilterSectionTitle>
                <RatingFilter>
                  {[0, 3, 4, 4.5].map((rating) => (
                    <RatingOption
                      key={rating}
                      $active={minRating === rating}
                      onClick={() => setMinRating(rating)}
                    >
                      <StarRating rating={rating} size="16px" />
                      <span>{rating === 0 ? 'All' : `${rating}+`}</span>
                    </RatingOption>
                  ))}
                </RatingFilter>
              </FilterGroup>

              {/* Location Filter */}
              {locations.length > 0 && (
                <FilterGroup>
                  <FilterSectionTitle>
                    <span>Location</span>
                  </FilterSectionTitle>
                  <LocationSelect
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </LocationSelect>
                </FilterGroup>
              )}

              {/* Clear Filters */}
              {(searchQuery || minRating > 0 || locationFilter) && (
                <ClearFiltersButton onClick={clearFilters}>
                  Clear All Filters
                </ClearFiltersButton>
              )}
            </FilterScroll>
          </FilterSidebar>

          {/* Main Content */}
          <MainContent>
            <ContentHeader>
              <ResultsInfo>
                <ResultsCount>
                  Showing <strong>{sellers.length}</strong> of <strong>{allSellers.length}</strong> sellers
                </ResultsCount>
                {(searchQuery || minRating > 0 || locationFilter) && (
                  <ActiveFilters>
                    {searchQuery && (
                      <FilterBadge>
                        Search: "{searchQuery}"
                        <FaTimes onClick={() => setSearchQuery("")} />
                      </FilterBadge>
                    )}
                    {minRating > 0 && (
                      <FilterBadge>
                        Rating: {minRating}+
                        <FaTimes onClick={() => setMinRating(0)} />
                      </FilterBadge>
                    )}
                    {locationFilter && (
                      <FilterBadge>
                        Location: {locationFilter}
                        <FaTimes onClick={() => setLocationFilter("")} />
                      </FilterBadge>
                    )}
                  </ActiveFilters>
                )}
              </ResultsInfo>

              <ControlsContainer>
                <MobileFilterButton onClick={toggleFilters}>
                  <FaFilter /> Filters
                </MobileFilterButton>

                <SortContainer>
                  <FaSortAmountDown />
                  <SortSelect value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="rating-asc">Lowest Rated</option>
                    <option value="products-desc">Most Products</option>
                    <option value="products-asc">Fewest Products</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </SortSelect>
                </SortContainer>
              </ControlsContainer>
            </ContentHeader>

            {sellers.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🏪</EmptyIcon>
                <EmptyTitle>No Sellers Found</EmptyTitle>
                <EmptyText>
                  {searchQuery || minRating > 0 || locationFilter
                    ? "Try adjusting your filters to see more results."
                    : "Check back later for new sellers."}
                </EmptyText>
                {(searchQuery || minRating > 0 || locationFilter) && (
                  <ClearFiltersButton onClick={clearFilters} style={{ marginTop: '2rem' }}>
                    Clear All Filters
                  </ClearFiltersButton>
                )}
              </EmptyState>
            ) : (
              <SellersGrid>
                {sellers.map((seller) => {
              const productImages = seller.products
                ?.flatMap((product) => product.images || [])
                ?.filter((img) => img)
                ?.slice(0, 3) || [];

              return (
                <SellerCard key={seller.id || seller._id} to={`${PATHS.SELLERS}/${seller.id || seller._id}`}>
                  <SellerCardHeader>
                    <SellerAvatarContainer>
                      <SellerAvatar
                        src={seller.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E"}
                        alt={seller.shopName || seller.name}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ffc400' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3EShop%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <VerifiedBadge>
                        <FaShieldAlt />
                      </VerifiedBadge>
                    </SellerAvatarContainer>
                    <SellerHeaderContent>
                      <SellerName>{seller.shopName || seller.name}</SellerName>
                      <SellerRating>
                        <StarRating rating={seller.rating || seller.ratings?.average || 0} size="14px" />
                        <RatingText>
                          {(seller.rating || seller.ratings?.average || 0).toFixed(1)}
                        </RatingText>
                      </SellerRating>
                      {seller.location && (
                        <SellerLocation>
                          <FaMapMarkerAlt size={12} />
                          <span>{seller.location}</span>
                        </SellerLocation>
                      )}
                    </SellerHeaderContent>
                  </SellerCardHeader>
                  
                  <SellerCardBody>
                    <SellerStats>
                      <StatItem>
                        <StatIcon>📦</StatIcon>
                        <StatContent>
                          <StatValue>{seller.productCount || seller.products?.length || 0}</StatValue>
                          <StatLabel>Products</StatLabel>
                        </StatContent>
                      </StatItem>
                      {seller.totalSold && (
                        <StatItem>
                          <StatIcon>✅</StatIcon>
                          <StatContent>
                            <StatValue>{seller.totalSold}</StatValue>
                            <StatLabel>Sold</StatLabel>
                          </StatContent>
                        </StatItem>
                      )}
                    </SellerStats>
                    
                    {productImages.length > 0 && (
                      <ProductPreviewSection>
                        <PreviewLabel>Featured Products</PreviewLabel>
                        <ProductPreview>
                          {productImages.map((image, index) => (
                            <PreviewImageWrapper key={index}>
                              <PreviewImage
                                src={image}
                                alt={`Product ${index + 1}`}
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='24'%3EP%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </PreviewImageWrapper>
                          ))}
                          {productImages.length < 3 && (seller.productCount || seller.products?.length || 0) > productImages.length && (
                            <MoreProductsIndicator>
                              +{Math.max(0, (seller.productCount || seller.products?.length || 0) - productImages.length)}
                            </MoreProductsIndicator>
                          )}
                        </ProductPreview>
                      </ProductPreviewSection>
                    )}
                  </SellerCardBody>
                  
                  <SellerCardFooter>
                    <ViewShopButton>
                      View Shop <FaArrowRight />
                    </ViewShopButton>
                  </SellerCardFooter>
                </SellerCard>
              );
                })}
              </SellersGrid>
            )}
          </MainContent>
          </ContentLayout>
        </Container>
      </ContentWrapper>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--color-grey-50) 0%, var(--color-white-0) 100%);
`;

const PageHeader = styled.div`
  padding: 3rem 0;
  text-align: center;
  margin-bottom: 2rem;
  background: var(--color-white-0);
  border-bottom: 1px solid var(--color-grey-200);
`;

const PageTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--color-grey-800);
  margin-bottom: 1rem;
  letter-spacing: -1px;

  @media ${devicesMax.md} {
    font-size: 2.5rem;
  }
`;

const PageDescription = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  margin: 0;
`;

const ContentWrapper = styled.div`
  padding: 2rem 0;
  width: 100%;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media ${devicesMax.md} {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FilterSidebar = styled.aside`
  width: 280px;
  background: var(--color-white-0);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 2rem;
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  flex-shrink: 0;

  @media ${devicesMax.md} {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    z-index: 1000;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    border-radius: 0;
    overflow-y: auto;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #1e293b;
  }

  @media ${devicesMax.md} {
    display: block;
  }
`;

const FilterScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 2rem;
`;

const FilterSectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1.2rem;
    color: #94a3b8;
    font-size: 1.4rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 4rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #ffc400;
    background: white;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const RatingFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RatingOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${props => props.$active ? '#ffc400' : '#e2e8f0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? '#fff9e6' : 'white'};

  &:hover {
    border-color: #ffc400;
    background: #fff9e6;
  }

  span {
    font-size: 1.4rem;
    font-weight: 600;
    color: #1e293b;
  }
`;

const LocationSelect = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.4rem;
  background: #f8f9fa;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ffc400;
    background: white;
  }
`;

const ClearFiltersButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ResultsInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultsCount = styled.p`
  font-size: 1.6rem;
  color: #64748b;
  margin-bottom: 1rem;

  strong {
    color: #1e293b;
    font-weight: 700;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  border: 1px solid rgba(255, 196, 0, 0.3);
  border-radius: 20px;
  font-size: 1.3rem;
  color: #1e293b;
  font-weight: 500;

  svg {
    cursor: pointer;
    color: #64748b;
    transition: color 0.3s ease;

    &:hover {
      color: #1e293b;
    }
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MobileFilterButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ffc400;
    color: #ffc400;
  }

  @media ${devicesMax.md} {
    display: flex;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;

  svg {
    color: #64748b;
    font-size: 1.4rem;
  }
`;

const SortSelect = styled.select`
  border: none;
  background: none;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  outline: none;
`;

const SellersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  width: 100%;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FilterOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;

  @media ${devicesMax.md} {
    display: block;
  }
`;

const ViewShopButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;

  svg {
    transition: transform 0.3s ease;
  }
`;

const SellerAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
`;

const SellerCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 196, 0, 0.3);

    ${ViewShopButton} {
      background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
      transform: translateX(5px);
      color: white;
      border-color: rgba(255, 196, 0, 0.3);

      svg {
        transform: translateX(3px);
      }
    }

    ${SellerAvatar} {
      transform: scale(1.05);
    }
  }
`;

const SellerCardHeader = styled.div`
  position: relative;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
`;

const SellerAvatarContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const SellerHeaderContent = styled.div`
  width: 100%;
`;

const SellerName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const RatingText = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: #475569;
`;

const SellerLocation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #64748b;
  margin-top: 0.5rem;

  svg {
    color: #94a3b8;
  }
`;

const SellerCardBody = styled.div`
  padding: 1.5rem 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SellerStats = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-around;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  ${SellerCard}:hover & {
    background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    border-color: rgba(255, 196, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.span`
  font-size: 2rem;
  line-height: 1;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
`;

const ProductPreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PreviewLabel = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductPreview = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const PreviewImageWrapper = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  flex-shrink: 0;

  ${SellerCard}:hover & {
    border-color: rgba(255, 196, 0, 0.4);
    transform: scale(1.05);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MoreProductsIndicator = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffc400 0%, #ffb300 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  border: 2px solid rgba(255, 196, 0, 0.3);
  flex-shrink: 0;
`;

const SellerCardFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const EmptyIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
`;

const EmptyTitle = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  color: #64748b;
`;

