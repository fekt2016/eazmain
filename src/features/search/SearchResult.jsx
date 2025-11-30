import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes, FaSortAmountDown, FaSearch } from "react-icons/fa";
import { useSearchResults } from '../../shared/hooks/useSearch';
import ProductCard from '../../shared/components/ProductCard';
import { LoadingState, SkeletonGrid } from '../../components/loading';
import { spin, fadeIn } from '../../shared/styles/animations';
import Container from '../../shared/components/Container';
import { devicesMax } from '../../shared/styles/breakpoint';
import usePageTitle from '../../shared/hooks/usePageTitle';

export default function SearchResultsPage() {
  const useQueryParams = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const paramsObject = {};
    for (const [key, value] of queryParams.entries()) {
      paramsObject[key] = value;
    }
    return paramsObject;
  };

  const queryParams = useQueryParams();
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    priceRange: { min: 0, max: 5000 },
    rating: null,
    inStock: false,
    onSale: false,
  });

  const { data: productData, isLoading } = useSearchResults(queryParams);

  const products = useMemo(() => {
    return productData?.data?.data || [];
  }, [productData]);

  const searchQuery = queryParams.q || "";
  usePageTitle(`Search: ${searchQuery} - EazShop`);

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

  return (
    <PageContainer>
      <Container>
        <SearchHeader>
          <HeaderContent>
            <SearchTitle>
              Results for <span>"{searchQuery}"</span>
            </SearchTitle>
            <ResultCount>{products.length} items found</ResultCount>
          </HeaderContent>
        </SearchHeader>

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
                  {["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports"].map((cat) => (
                    <CheckboxLabel key={cat}>
                      <input
                        type="checkbox"
                        checked={filters.category.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                      />
                      <span>{cat}</span>
                    </CheckboxLabel>
                  ))}
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
                <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </SortSelect>
              </SortContainer>
            </ControlsHeader>

            {isLoading ? (
              <ProductsGrid>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonLoader key={idx} height="380px" borderRadius="16px" />
                ))}
              </ProductsGrid>
            ) : products.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FaSearch />
                </EmptyIcon>
                <h3>No Results Found</h3>
                <p>We couldn't find any products matching "{searchQuery}".</p>
                <p>Try checking your spelling or using different keywords.</p>
              </EmptyState>
            ) : (
              <ProductsGrid>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </ProductsGrid>
            )}
          </ProductsSection>
        </MainLayout>
      </Container>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  padding: 2rem 0 4rem;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
`;

const SearchHeader = styled.div`
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  color: white;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const SearchTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
  
  span {
    color: rgba(255, 255, 255, 0.95);
    font-style: italic;
    font-weight: 600;
  }
`;

const ResultCount = styled.span`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const MainLayout = styled.div`
  display: flex;
  gap: 3rem;
  position: relative;
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
  width: 300px;
  flex-shrink: 0;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);

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
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;

  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
`;

const CloseFiltersButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-grey-500);
  cursor: pointer;
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const FilterScroll = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FilterSection = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const FilterTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    accent-color: var(--color-primary-500);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.4rem;
  color: var(--color-grey-700);

  input {
    width: 1.8rem;
    height: 1.8rem;
    accent-color: var(--color-primary-500);
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
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;

  @media ${devicesMax.lg} {
    justify-content: space-between;
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  @media ${devicesMax.lg} {
    display: flex;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    color: #667eea;
    font-size: 1.1rem;
  }
`;

const SortSelect = styled.select`
  border: none;
  background: transparent;
  font-size: 1.4rem;
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding: 0.25rem 0.5rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px dashed #e2e8f0;
  
  h3 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #1e293b;
  }

  p {
    font-size: 1.5rem;
    color: #64748b;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
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
