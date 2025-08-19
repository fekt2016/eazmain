import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";
import useCategory from "../hooks/useCategory";
import useProducts from "../hooks/useProduct";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/pagination";
import SkeletonLoader from "../components/SkeletonLoader";

export default function CategoryPage() {
  const { id } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
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

    // Include subcategory if selected
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
    return categoryData?.data || {};
  }, [categoryData]);

  const products = useMemo(() => {
    return productsData?.data?.products || [];
  }, [productsData]);

  const totalProducts = productsData?.totalCount || 0;
  console.log("totalProducts", totalProducts);
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
    // Toggle selection - if same subcategory clicked, deselect it
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

  // Log subcategory selection for debugging
  useEffect(() => {
    refetchProducts();
  }, [selectedSubcategory, refetchProducts]);

  if (categoryError) return <ErrorContainer>Category not found</ErrorContainer>;
  if (productsError)
    return <ErrorContainer>Error loading products</ErrorContainer>;

  return (
    <PageContainer>
      {/* Category Banner */}
      <CategoryBanner>
        {isCategoryLoading ? (
          <SkeletonLoader width="100%" height="200px" />
        ) : (
          <>
            <BannerImage
              src={
                category.image ||
                "https://via.placeholder.com/1200x200?text=Category+Banner"
              }
              alt={category.name}
            />
            <BannerContent>
              <CategoryTitle>{category.name}</CategoryTitle>
              <CategoryDescription>
                {category.description || "Explore our wide range of products"}
              </CategoryDescription>
            </BannerContent>
          </>
        )}
      </CategoryBanner>

      {/* Subcategory Tabs */}
      {subcategories.length > 0 && (
        <SubcategoryTabsContainer>
          <SubcategoryTabs>
            <SubcategoryTab
              $isActive={!selectedSubcategory}
              onClick={clearSubcategory}
            >
              <TabImage
                src="https://via.placeholder.com/50?text=All"
                alt="All subcategories"
              />
              <TabLabel>All</TabLabel>
            </SubcategoryTab>

            {subcategories.map((sub) => (
              <SubcategoryTab
                key={sub._id}
                $isActive={selectedSubcategory === sub._id}
                onClick={() => selectSubcategory(sub._id)}
              >
                <TabImage
                  src={sub.image || "https://via.placeholder.com/50"}
                  alt={sub.name}
                />
                <TabLabel>{sub.name}</TabLabel>
              </SubcategoryTab>
            ))}
          </SubcategoryTabs>
        </SubcategoryTabsContainer>
      )}

      <MainContent>
        {/* Filters Sidebar (only price filter remains) */}
        <FilterSidebar show={showFilters}>
          <FilterHeader>
            <h3>Filters</h3>
            <CloseFiltersButton onClick={toggleFilters}>
              &times;
            </CloseFiltersButton>
          </FilterHeader>

          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            <PriceRangeContainer>
              <PriceInput
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                min="0"
                max={priceRange[1] - 1}
              />
              <PriceInput
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                min={priceRange[0] + 1}
                max="10000"
              />
            </PriceRangeContainer>
            <RangeSliderContainer>
              <Slider
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
              />
              <Slider
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
              />
            </RangeSliderContainer>
          </FilterSection>
        </FilterSidebar>

        {/* Products Section */}
        <ProductsSection>
          <ProductsHeader>
            <ResultsCount>
              {totalProducts} {totalProducts === 1 ? "Item" : "Items"} found
              {selectedSubcategory && (
                <FilterInfo>
                  (filtered by{" "}
                  {
                    subcategories.find((s) => s._id === selectedSubcategory)
                      ?.name
                  }
                  )
                </FilterInfo>
              )}
            </ResultsCount>

            <ControlsContainer>
              <MobileFilterButton onClick={toggleFilters}>
                <FaFilter /> Filters{" "}
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </MobileFilterButton>

              <SortContainer>
                <SortLabel>Sort by:</SortLabel>
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
              {Array.from({ length: 12 }).map((_, idx) => (
                <SkeletonLoader key={idx} height="300px" />
              ))}
            </ProductsGrid>
          ) : products.length === 0 ? (
            <NoProductsMessage>
              No products found in this category. Try adjusting your filters.
            </NoProductsMessage>
          ) : (
            <>
              <ProductsGrid>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </ProductsGrid>

              {totalPages > 1 && (
                <PaginationContainer>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </PaginationContainer>
              )}
            </>
          )}
        </ProductsSection>
      </MainContent>
    </PageContainer>
  );
}

// Styled components
const PageContainer = styled.div`
  padding: 20px 5%;
  background-color: #f8f9fc;
  min-height: 100vh;
`;

const CategoryBanner = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const BannerImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: #e0e6f5;
`;

const BannerContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 25px 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
`;

const CategoryTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CategoryDescription = styled.p`
  font-size: 1.1rem;
  max-width: 70%;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    max-width: 100%;
    font-size: 1rem;
  }
`;

// Subcategory tabs styles
const SubcategoryTabsContainer = styled.div`
  padding: 15px 0;
  margin-bottom: 20px;
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SubcategoryTabs = styled.div`
  display: flex;
  gap: 15px;
  padding: 0 15px;
  width: max-content;
  min-width: 100%;
`;

const SubcategoryTab = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  border: 2px solid
    ${({ $isActive }) => ($isActive ? "#4e73df" : "transparent")};
  background: ${({ $isActive }) => ($isActive ? "#f0f5ff" : "transparent")};

  &:hover {
    background: #f8f9fc;
    transform: translateY(-2px);
  }
`;

const TabImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 8px;
  background-color: #f0f0f0;
`;

const TabLabel = styled.span`
  font-size: 0.8rem;
  text-align: center;
  font-weight: 500;
  color: #4a5568;
`;

const MainContent = styled.div`
  display: flex;
  gap: 25px;

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const FilterSidebar = styled.div`
  flex: 0 0 250px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;

  @media (max-width: 992px) {
    display: ${({ show }) => (show ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    width: 85%;
    overflow-y: auto;
    transform: ${({ show }) => (show ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.3s ease;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaecf4;
`;

const CloseFiltersButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;

  @media (min-width: 993px) {
    display: none;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 25px;
`;

const FilterTitle = styled.h4`
  margin-bottom: 15px;
  color: #4e73df;
  font-size: 1.1rem;
`;

const PriceRangeContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  text-align: center;
`;

const RangeSliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Slider = styled.input`
  width: 100%;
  height: 5px;
  background: #d1d3e2;
  border-radius: 5px;
  outline: none;
  margin: 10px 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #4e73df;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const ResultsCount = styled.p`
  font-weight: 500;
  color: #4e73df;
`;

const FilterInfo = styled.span`
  font-weight: normal;
  font-size: 0.9em;
  color: #6c757d;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;

  @media (max-width: 992px) {
    display: flex;
  }
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SortLabel = styled.span`
  font-size: 14px;
  color: #6c757d;
`;

const SortSelect = styled.select`
  padding: 10px 15px;
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  background: white;
  cursor: pointer;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 25px;
  margin-bottom: 30px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 12px;
  color: #6c757d;
  font-size: 1.1rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: #e74a3b;
`;
