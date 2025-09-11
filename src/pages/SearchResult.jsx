import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  // FaFilter,
  // FaStar,
  // FaHeart,
  // FaShoppingCart,
  FaChevronDown,
} from "react-icons/fa";
import { useSearchResults } from "../hooks/useSearch";
import ProductCard from "../components/ProductCard";

export default function SearchResultsPage() {
  const useQueryParams = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);

    // Convert URLSearchParams → plain object
    const paramsObject = {};
    for (const [key, value] of queryParams.entries()) {
      paramsObject[key] = value;
    }

    return paramsObject;
  };

  const queryParams = useQueryParams();
  const [sortBy, setSortBy] = useState("relevance");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    category: [],
    priceRange: { min: 0, max: 1000 },
    rating: null,
    inStock: false,
    onSale: false,
  });

  const { data: productData, isLoading } = useSearchResults(queryParams);
  const products = useMemo(() => {
    return productData?.data?.data || [];
  }, [productData]);

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

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

  // const handleAddToCart = (productId) => {
  //   console.log("Add to cart:", productId);
  //   // Implement add to cart functionality
  // };

  // const handleAddToWishlist = (productId) => {
  //   console.log("Add to wishlist:", productId);
  //   // Implement add to wishlist functionality
  // };

  if (isLoading) {
    return (
      <>
        <LoadingContainer>
          <Spinner />
          <p>Searching for ""...</p>
        </LoadingContainer>
      </>
    );
  }

  return (
    <>
      <SearchResultsContainer>
        <FiltersBar>
          <FilterSection>
            <FilterLabel>Filters:</FilterLabel>

            <Dropdown>
              <DropdownToggle
                onClick={() => toggleDropdown("category")}
                isActive={activeDropdown === "category"}
              >
                <span>Category</span>
                <FaChevronDown />
              </DropdownToggle>
              <DropdownContent isOpen={activeDropdown === "category"}>
                <FilterOption>
                  <input
                    type="checkbox"
                    id="cat-electronics"
                    checked={filters.category.includes("Electronics")}
                    onChange={() => handleCategoryChange("Electronics")}
                  />
                  <label htmlFor="cat-electronics">Electronics</label>
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    id="cat-fashion"
                    checked={filters.category.includes("Fashion")}
                    onChange={() => handleCategoryChange("Fashion")}
                  />
                  <label htmlFor="cat-fashion">Fashion</label>
                </FilterOption>
                <FilterOption>
                  <input
                    type="checkbox"
                    id="cat-home"
                    checked={filters.category.includes("Home & Kitchen")}
                    onChange={() => handleCategoryChange("Home & Kitchen")}
                  />
                  <label htmlFor="cat-home">Home & Kitchen</label>
                </FilterOption>
              </DropdownContent>
            </Dropdown>

            <Dropdown>
              <DropdownToggle
                onClick={() => toggleDropdown("price")}
                isActive={activeDropdown === "price"}
              >
                <span>Price</span>
                <FaChevronDown />
              </DropdownToggle>
              <DropdownContent isOpen={activeDropdown === "price"}>
                <PriceRange>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      handlePriceChange(0, parseInt(e.target.value))
                    }
                  />
                  <PriceValues>
                    <span>${filters.priceRange.min}</span>
                    <span>${filters.priceRange.max}</span>
                  </PriceValues>
                </PriceRange>
              </DropdownContent>
            </Dropdown>

            <Dropdown>
              <DropdownToggle
                onClick={() => toggleDropdown("rating")}
                isActive={activeDropdown === "rating"}
              >
                <span>Rating</span>
                <FaChevronDown />
              </DropdownToggle>
              <DropdownContent isOpen={activeDropdown === "rating"}>
                <FilterOption>
                  <input
                    type="radio"
                    name="rating"
                    id="rating-4"
                    checked={filters.rating === 4}
                    onChange={() => handleRatingChange(4)}
                  />
                  <label htmlFor="rating-4">4★ & above</label>
                </FilterOption>
                <FilterOption>
                  <input
                    type="radio"
                    name="rating"
                    id="rating-3"
                    checked={filters.rating === 3}
                    onChange={() => handleRatingChange(3)}
                  />
                  <label htmlFor="rating-3">3★ & above</label>
                </FilterOption>
                <FilterOption>
                  <input
                    type="radio"
                    name="rating"
                    id="rating-2"
                    checked={filters.rating === 2}
                    onChange={() => handleRatingChange(2)}
                  />
                  <label htmlFor="rating-2">2★ & above</label>
                </FilterOption>
              </DropdownContent>
            </Dropdown>

            <FilterOption>
              <input
                type="checkbox"
                id="in-stock"
                checked={filters.inStock}
                onChange={() =>
                  setFilters({ ...filters, inStock: !filters.inStock })
                }
              />
              <label htmlFor="in-stock">In Stock Only</label>
            </FilterOption>

            <FilterOption>
              <input
                type="checkbox"
                id="on-sale"
                checked={filters.onSale}
                onChange={() =>
                  setFilters({ ...filters, onSale: !filters.onSale })
                }
              />
              <label htmlFor="on-sale">On Sale</label>
            </FilterOption>
          </FilterSection>

          <SortSection>
            <SortOptions>
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </SortOptions>
          </SortSection>
        </FiltersBar>
        <PageHeader>
          <SearchQuery>Search Results for </SearchQuery>
        </PageHeader>

        <ProductsGrid>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ProductsGrid>

        {/* <Pagination>
          <PaginationButton disabled>Previous</PaginationButton>
          <PaginationButton active>1</PaginationButton>
          <PaginationButton>2</PaginationButton>
          <PaginationButton>3</PaginationButton>
          <PaginationEllipsis>...</PaginationEllipsis>
          <PaginationButton>10</PaginationButton>
          <PaginationButton>Next</PaginationButton>
        </Pagination> */}
      </SearchResultsContainer>
    </>
  );
}

// Styled Components with cohesive color scheme
const SearchResultsContainer = styled.div`
  /* padding: 2rem 5%; */
  /* background-color: #f8f9fc; */
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 1rem;
`;

const SearchQuery = styled.h1`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-bottom: 0.5rem;
`;

const FiltersBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-radius: 0.8rem;
  flex-wrap: wrap;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
  font-weight: 500;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: ${(props) => (props.isActive ? "#edf2f7" : "#f7fafc")};
  border: 1px solid #e2e8f0;
  border-radius: 0.4rem;
  font-size: 1.4rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
`;

const DropdownContent = styled.div`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--color-white-0);
  min-width: 200px;
  padding: 1.5rem;
  border-radius: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-top: 0.5rem;
`;

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;

  input {
    margin-right: 0.8rem;
  }

  label {
    font-size: 1.4rem;
    color: var(--color-grey-500);
    cursor: pointer;
  }
`;

const PriceRange = styled.div`
  margin-top: 1rem;

  input {
    width: 100%;
  }
`;

const PriceValues = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const SortSection = styled.div`
  display: flex;
  align-items: center;
`;

const SortOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  label {
    font-size: 1.4rem;
    color: var(--color-grey-500);
  }

  select {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.4rem;
    background: #ffffff;
    font-size: 1.4rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 2rem;
`;

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
