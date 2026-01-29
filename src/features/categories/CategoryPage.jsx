import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes, FaSortAmountDown } from "react-icons/fa";
import useCategory from '../../shared/hooks/useCategory';
import useProducts from '../../shared/hooks/useProduct';
import ProductCard from '../../shared/components/ProductCard';
import Pagination from '../../shared/components/pagination';
import SkeletonLoader from '../../shared/components/SkeletonLoader';
import Container from '../../shared/components/Container';
import { devicesMax } from '../../shared/styles/breakpoint';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { fadeIn, slideUp } from '../../shared/styles/animations';
import { ErrorState } from '../../components/loading';

export default function CategoryPage() {
  const { id } = useParams();
  
  // Guard against missing category id
  if (!id) {
    return (
      <Container>
        <ErrorState
          title="Category ID Missing"
          message="Category ID is required. Please go back and try again."
        />
      </Container>
    );
  }
  
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [subcategories, setSubcategories] = useState([]);

  // Fetch category details
  const { useCategoryById } = useCategory();
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useCategoryById(id);

  // Set subcategories when category data loads
  useEffect(() => {
    if (categoryData?.data?.subcategories) {
      setSubcategories(categoryData?.data?.subcategories);
    }
  }, [categoryData]);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: itemsPerPage,
      sort: sortOption,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };

    if (selectedSubcategory) {
      params.subcategories = [selectedSubcategory];
    }

    return params;
  }, [page, itemsPerPage, sortOption, priceRange, selectedSubcategory]);

  // Fetch products for category
  const { useGetProductsByCategory } = useProducts();
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsByCategory(id, queryParams);

  const category = useMemo(() => {
    if (!categoryData) return {};
    // Handle various response structures
    // 1. Standard API response: { status: 'success', data: { category: ... } }
    if (categoryData.data?.category) return categoryData.data.category;
    // 2. Direct data response: { category: ... }
    if (categoryData.category) return categoryData.category;
    // 3. Nested data response: { data: { ... } } -> where inner data is category
    if (categoryData.data) return categoryData.data;
    // 4. Direct category object (fallback)
    return categoryData;
  }, [categoryData]);

  useDynamicPageTitle({
    title: "Category",
    dynamicTitle: category?.name && `${category.name} — Browse Products`,
    description: category?.description,
    defaultTitle: "Saiisai Categories",
  });

  const products = useMemo(() => {
    return productsData?.data?.products || [];
  }, [productsData]);

  const totalProducts = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const toggleFilters = () => setShowFilters(!showFilters);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
    setPage(1);
  };

  const selectSubcategory = (subId) => {
    if (selectedSubcategory === subId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subId);
    }
    setPage(1);
  };

  const clearSubcategory = () => {
    setSelectedSubcategory(null);
    setPage(1);
  };

  const handlePageChange = (newPage) => setPage(newPage);

  useEffect(() => {
    refetchProducts();
  }, [selectedSubcategory, refetchProducts]);

  if (categoryError) return (
    <ErrorContainer>
      <ErrorContent>
        <h2>Category Not Found</h2>
        <p>We couldn't find the category you're looking for.</p>
      </ErrorContent>
    </ErrorContainer>
  );

  return (
    <PageContainer>
      {/* Premium Category Hero */}
      <HeroSection>
        <Container style={{ width: '100%', maxWidth: '100%' }}>
          {isCategoryLoading ? (
            <SkeletonLoader width="100%" height="400px" borderRadius="32px" />
          ) : (
            <HeroWrapper>
              <HeroBackground>
                <HeroImage
                  src={category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"}
                  alt={category.name}
                />
                <HeroOverlay />
              </HeroBackground>

              <HeroContent>
                <HeroBadge>
                  <FaFilter /> {totalProducts} Products
                </HeroBadge>
                <HeroTitle>{category.name}</HeroTitle>
                <HeroDescription>
                  {category.description || "Explore our curated collection of premium products designed for your lifestyle."}
                </HeroDescription>

                {subcategories.length > 0 && (
                  <QuickCategories>
                    {subcategories.slice(0, 5).map(sub => (
                      <QuickCatTag
                        key={sub._id}
                        onClick={() => selectSubcategory(sub._id)}
                        $active={selectedSubcategory === sub._id}
                      >
                        {sub.name}
                      </QuickCatTag>
                    ))}
                  </QuickCategories>
                )}
              </HeroContent>
            </HeroWrapper>
          )}
        </Container>
      </HeroSection>

      {/* Subcategory Tabs */}
      {subcategories.length > 0 && (
        <SubcategorySection>
          <Container style={{ width: '100%', maxWidth: '100%' }}>
            <SectionTitle>Explore Categories</SectionTitle>
            <SubcategoryTabsContainer>
              <SubcategoryTabs>
                <SubcategoryTab
                  $isActive={!selectedSubcategory}
                  onClick={clearSubcategory}
                >
                  <TabImageWrapper $isActive={!selectedSubcategory}>
                    <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=100&h=100&fit=crop" alt="All" />
                  </TabImageWrapper>
                  <TabLabel>All Items</TabLabel>
                </SubcategoryTab>

                {subcategories.map((sub) => (
                  <SubcategoryTab
                    key={sub._id}
                    $isActive={selectedSubcategory === sub._id}
                    onClick={() => selectSubcategory(sub._id)}
                  >
                    <TabImageWrapper $isActive={selectedSubcategory === sub._id}>
                      <img
                        src={sub.image || `https://source.unsplash.com/random/100x100?${sub.name}`}
                        alt={sub.name}
                        onError={(e) => {
                          const initial = sub.name.charAt(0).toUpperCase();
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ffc400' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='36' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </TabImageWrapper>
                    <TabLabel>{sub.name}</TabLabel>
                  </SubcategoryTab>
                ))}
              </SubcategoryTabs>
            </SubcategoryTabsContainer>
          </Container>
        </SubcategorySection>
      )}

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
              <FilterGroup>
                <FilterSectionTitle>Price Range</FilterSectionTitle>
                <PriceRangeContainer>
                  <PriceInputsWrapper>
                    <PriceInputGroup>
                      <label>Min</label>
                      <PriceInput
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        min="0"
                      />
                    </PriceInputGroup>
                    <PriceSeparator>-</PriceSeparator>
                    <PriceInputGroup>
                      <label>Max</label>
                      <PriceInput
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        min={priceRange[0]}
                      />
                    </PriceInputGroup>
                  </PriceInputsWrapper>

                  <RangeSliderContainer>
                    <SliderTrack>
                      <SliderRange
                        style={{
                          left: `${(priceRange[0] / 5000) * 100}%`,
                          right: `${100 - (priceRange[1] / 5000) * 100}%`
                        }}
                      />
                    </SliderTrack>
                    <RangeInput
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                    />
                    <RangeInput
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                    />
                  </RangeSliderContainer>
                </PriceRangeContainer>
              </FilterGroup>

              {/* Placeholder for more filters */}
              <FilterGroup>
                <FilterSectionTitle>
                  <span>Availability</span>
                  <FaChevronUp size={12} />
                </FilterSectionTitle>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input type="checkbox" />
                    <span>In Stock</span>
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input type="checkbox" />
                    <span>On Sale</span>
                  </CheckboxLabel>
                </CheckboxGroup>
              </FilterGroup>
            </FilterScroll>

            <FilterFooter>
              <ApplyButton onClick={toggleFilters}>
                Show {products.length} Results
              </ApplyButton>
            </FilterFooter>
          </FilterSidebar>

          {/* Products Section */}
          <ProductsSection>
            <ProductsHeader>
              <ResultsInfo>
                <ResultsCount>
                  Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
                </ResultsCount>
                {selectedSubcategory && (
                  <ActiveFilterBadge>
                    {subcategories.find((s) => s._id === selectedSubcategory)?.name}
                    <FaTimes onClick={clearSubcategory} />
                  </ActiveFilterBadge>
                )}
              </ResultsInfo>

              <ControlsContainer>
                <MobileFilterButton onClick={toggleFilters}>
                  <FaFilter /> Filters
                </MobileFilterButton>

                <SortContainer>
                  <FaSortAmountDown />
                  <SortSelect value={sortOption} onChange={handleSortChange}>
                    <option value="">Featured</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-ratingsAverage">Top Rated</option>
                    <option value="-createdAt">Newest Arrivals</option>
                  </SortSelect>
                </SortContainer>
              </ControlsContainer>
            </ProductsHeader>

            {/* Products Grid */}
            {isProductsLoading ? (
              <ProductsGrid>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonLoader key={idx} height="380px" borderRadius="16px" />
                ))}
              </ProductsGrid>
            ) : products.length === 0 ? (
              <EmptyState>
                <EmptyImage src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="No products" />
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or check back later for new arrivals.</p>
                <ClearButton onClick={() => {
                  setPriceRange([0, 5000]);
                  setSelectedSubcategory(null);
                  setSortOption("");
                }}>Clear All Filters</ClearButton>
              </EmptyState>
            ) : (
              <>
                <ProductsGrid>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </ProductsGrid>

                {totalPages > 1 && (
                  <PaginationWrapper>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </PaginationWrapper>
                )}
              </>
            )}
          </ProductsSection>
      </MainLayout>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  padding: 2rem 0 4rem;
  background-color: #f8fafc;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
`;

const HeroSection = styled.div`
  position: relative;
  margin-bottom: 5rem;
  animation: ${fadeIn} 0.8s ease-out;
  width: 100%;
  padding: 0 2rem;

  @media ${devicesMax.sm} {
    padding: 0 1rem;
  }
`;

const HeroWrapper = styled.div`
  position: relative;
  height: 400px;
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @media ${devicesMax.md} {
    height: 350px;
    border-radius: 24px;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease-out;

  ${HeroWrapper}:hover & {
    transform: scale(1.05);
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg, 
    rgba(0,0,0,0.8) 0%, 
    rgba(0,0,0,0.6) 50%, 
    rgba(0,0,0,0.3) 100%
  );
  backdrop-filter: blur(2px);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 6rem;
  max-width: 800px;
  color: white;

  @media ${devicesMax.md} {
    padding: 0 3rem;
  }
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.6rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.5s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: 5.6rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${slideUp} 0.5s ease-out 0.1s backwards;

  @media ${devicesMax.md} {
    font-size: 3.6rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.8rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 3rem;
  max-width: 600px;
  animation: ${slideUp} 0.5s ease-out 0.2s backwards;

  @media ${devicesMax.md} {
    font-size: 1.5rem;
  }
`;

const QuickCategories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  animation: ${slideUp} 0.5s ease-out 0.3s backwards;
`;

const QuickCatTag = styled.button`
  padding: 0.8rem 1.6rem;
  background: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => $active ? 'var(--color-primary-600)' : 'white'};
  border: 1px solid ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: white;
    color: var(--color-primary-600);
    transform: translateY(-2px);
  }
`;

const SubcategorySection = styled.div`
  margin-bottom: 3rem;
  width: 100%;
  padding: 0 2rem;

  @media ${devicesMax.sm} {
    padding: 0 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.5rem;
`;

const SubcategoryTabsContainer = styled.div`
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SubcategoryTabs = styled.div`
  display: flex;
  gap: 2rem;
`;

const SubcategoryTab = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  group: true;

  &:hover img {
    transform: scale(1.1);
  }
`;

const TabImageWrapper = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ $isActive }) => ($isActive ? 'var(--color-primary-500)' : 'transparent')};
  box-shadow: ${({ $isActive }) => ($isActive ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none')};
  transition: all 0.3s ease;
  background: white;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
`;

const TabLabel = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const MainLayout = styled.div`
  display: flex;
  gap: 3rem;
  position: relative;
  width: 100%;
  padding: 0 2rem;

  @media ${devicesMax.sm} {
    padding: 0 1rem;
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const FilterSidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-grey-100);

  @media ${devicesMax.lg} {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
    border-radius: 0;
    transform: translateX(${({ $show }) => ($show ? '0' : '-100%')});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    width: 320px;
    max-width: 100vw;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-grey-100);

  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-grey-900);
    letter-spacing: -0.02em;
  }
`;

const CloseFiltersButton = styled.button`
  background: var(--color-grey-50);
  border: none;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-red-500);
  }
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const FilterScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-200);
    border-radius: 4px;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 3rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterSectionTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PriceInputsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PriceInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;

  label {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--color-grey-500);
  }
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-grey-200);
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-900);
  background: var(--color-grey-50);
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--color-primary-500);
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
`;

const PriceSeparator = styled.span`
  margin-top: 2.2rem;
  color: var(--color-grey-400);
  font-weight: 500;
`;

const RangeSliderContainer = styled.div`
  position: relative;
  height: 2rem;
  margin-top: 0.5rem;
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
  background: var(--color-primary-500);
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
    border: 2px solid var(--color-primary-500);
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.2);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  
  input {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 4px;
    border: 2px solid var(--color-grey-300);
    accent-color: var(--color-primary-500);
    cursor: pointer;
  }

  &:hover {
    color: var(--color-primary-600);
  }
`;

const FilterFooter = styled.div`
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid var(--color-grey-100);
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 1.5rem;
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media ${devicesMax.md} {
    flex-direction: column;
    gap: 2rem;
    align-items: flex-start;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const ResultsCount = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);

  strong {
    color: var(--color-grey-900);
    font-weight: 700;
  }
`;

const ActiveFilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  
  svg {
    cursor: pointer;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media ${devicesMax.md} {
    width: 100%;
    justify-content: space-between;
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2rem;
  background: white;
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--color-grey-800);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  @media ${devicesMax.lg} {
    display: flex;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-grey-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary-200);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  svg {
    color: var(--color-grey-500);
  }
`;

const SortSelect = styled.select`
  border: none;
  background: transparent;
  font-size: 1.4rem;
  color: var(--color-grey-800);
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding-right: 1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
  animation: ${fadeIn} 0.5s ease-out;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 2.4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--color-grey-900);
  }

  p {
    font-size: 1.6rem;
    color: var(--color-grey-600);
    margin-bottom: 3rem;
  }
`;

const EmptyImage = styled.img`
  width: 120px;
  margin-bottom: 2rem;
  opacity: 0.5;
`;

const ClearButton = styled.button`
  padding: 1.2rem 2.4rem;
  background: var(--color-primary-500);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const ErrorContent = styled.div`
  text-align: center;
  
  h2 {
    font-size: 2.4rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.6rem;
    color: var(--color-grey-600);
  }
`;
