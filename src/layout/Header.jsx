import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  FaBars,
  FaHeart,
  FaSearch,
  FaShoppingCart,
  FaThList,
  FaUser,
  FaHeadset,
  FaStore,
  FaMobile,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { useCartTotals } from "../hooks/useCart";
import useCategory from "../hooks/useCategory";
import { useSearchProducts } from "../hooks/useSearch";

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { logout, userData } = useAuth();
  const { count: cartCount } = useCartTotals();
  const { getParentCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    getParentCategories;

  // Search hook for products only
  const { data: searchProductsData, isLoading: isSearchProductsLoading } =
    useSearchProducts(debouncedSearchTerm);

  // Get parent categories with subcategories
  const parentCategories = useMemo(() => {
    return categoriesData?.data?.categories || [];
  }, [categoriesData]);

  // Set first category as default when dropdown opens
  useEffect(() => {
    if (
      showCategoriesDropdown &&
      parentCategories.length > 0 &&
      !hoveredCategory
    ) {
      setHoveredCategory(parentCategories[0]);
    }
  }, [showCategoriesDropdown, parentCategories, hoveredCategory]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const user = useMemo(() => {
    return (
      userData?.data?.data || userData?.data?.user || userData?.user || null
    );
  }, [userData]);

  const { data: wishlistData } = useWishlist();

  const wishlist = useMemo(() => {
    return wishlistData?.data?.wishlist || wishlistData?.data || [];
  }, [wishlistData]);

  // Get search results
  const searchProducts = useMemo(() => {
    return searchProductsData?.data || [];
  }, [searchProductsData]);

  // Generate search suggestions (products only)
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm) return [];

    return searchProducts
      .slice(0, 5) // Limit to 5 products
      .map((product) => ({
        type: "product",
        id: product._id,
        name: product.name,
        image: product.images?.[0] || "https://via.placeholder.com/40",
        price: product.price,
        category: product.category?.name || "Uncategorized",
      }));
  }, [debouncedSearchTerm, searchProducts]);

  // Handle keyboard navigation for search
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchSuggestions.length > 0 && showSearchSuggestions) {
        handleSuggestionSelect(searchSuggestions[activeSuggestion]);
      } else {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSearchSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSearchSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSearchSuggestions(false);
    navigate(`/product/${suggestion.id}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle clicks outside dropdowns
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
    if (
      categoriesDropdownRef.current &&
      !categoriesDropdownRef.current.contains(event.target)
    ) {
      setShowCategoriesDropdown(false);
      setHoveredCategory(null);
    }
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSearchSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const logoutHandler = () => {
    logout.mutate();
  };

  return (
    <StyledHeader>
      <Logo type="main">
        <LogoIcon>🛒</LogoIcon>
        <LogoText to="/">Eaz Shop</LogoText>
      </Logo>
      <RightHeader>
        <HeaderTop>
          <TopLinks>
            <TopButton href="https://seller.eazshop.com" target="_blank">
              <FaStore />
              <span>Seller Portal</span>
            </TopButton>
          </TopLinks>
          <MiddleLinks>
            <SupportLink to="/support">
              <span>Support</span>
              <FaHeadset />
            </SupportLink>
          </MiddleLinks>
          <RightLinks>
            <SupportLink>Daily Deals</SupportLink>
            <SupportLink>New Arrivals</SupportLink>
            <SupportLink>Best selling Items</SupportLink>
          </RightLinks>
        </HeaderTop>

        <BottomHeader>
          <CategoriesContainer ref={categoriesDropdownRef}>
            <CategoriesButton
              onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            >
              <FaThList />
              <span>Categories</span>
              {showCategoriesDropdown ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </CategoriesButton>

            {showCategoriesDropdown && (
              <CategoriesDropdown>
                <DropdownContent>
                  <DropdownHeader>
                    <h3>All Categories</h3>
                  </DropdownHeader>
                  <CategoryPanels>
                    <ParentCategoriesPanel>
                      <PanelTitle>Categories</PanelTitle>
                      <CategoriesList>
                        {isCategoriesLoading ? (
                          <LoadingMessage>Loading categories...</LoadingMessage>
                        ) : parentCategories.length === 0 ? (
                          <NoCategories>No categories available</NoCategories>
                        ) : (
                          parentCategories.map((category) => (
                            <CategoryItem
                              key={category._id}
                              onMouseEnter={() => setHoveredCategory(category)}
                              className={
                                hoveredCategory?._id === category._id
                                  ? "active"
                                  : ""
                              }
                            >
                              <CategoryLink
                                to={`/category/${category._id}`}
                                onClick={() => setShowCategoriesDropdown(false)}
                              >
                                <CategoryImage
                                  src={category.image}
                                  alt={category.name}
                                  onError={(e) => {
                                    e.target.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='8px' fill='%23fff' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    e.target.onerror = null;
                                  }}
                                />
                                <CategoryName>{category.name}</CategoryName>
                                {category.subcategories &&
                                  category.subcategories.length > 0 && (
                                    <FaChevronRight size={10} />
                                  )}
                              </CategoryLink>
                            </CategoryItem>
                          ))
                        )}
                      </CategoriesList>
                    </ParentCategoriesPanel>

                    <SubCategoriesPanel>
                      <PanelTitle>
                        {hoveredCategory
                          ? `${hoveredCategory.name} Subcategories`
                          : "Subcategories"}
                      </PanelTitle>
                      <SubCategoriesGrid>
                        {hoveredCategory &&
                        hoveredCategory.subcategories &&
                        hoveredCategory.subcategories.length > 0 ? (
                          hoveredCategory.subcategories.map((subCategory) => (
                            <SubCategoryGridItem key={subCategory._id}>
                              <SubCategoryGridLink
                                to={`/category/${subCategory._id}`}
                                onClick={() => setShowCategoriesDropdown(false)}
                              >
                                <SubCategoryCircleImage
                                  src={subCategory.image}
                                  alt={subCategory.name}
                                  onError={(e) => {
                                    e.target.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='10px' fill='%23fff' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    e.target.onerror = null;
                                  }}
                                />
                                <SubCategoryGridName>
                                  {subCategory.name}
                                </SubCategoryGridName>
                              </SubCategoryGridLink>
                            </SubCategoryGridItem>
                          ))
                        ) : (
                          <NoSubCategories>
                            {hoveredCategory
                              ? "No subcategories available"
                              : "Hover over a category to see subcategories"}
                          </NoSubCategories>
                        )}
                      </SubCategoriesGrid>
                    </SubCategoriesPanel>
                  </CategoryPanels>
                </DropdownContent>
              </CategoriesDropdown>
            )}
          </CategoriesContainer>
          <SearchContainer ref={searchRef} type="main">
            <SearchBar>
              <SearchInput
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchSuggestions(true);
                  setActiveSuggestion(0);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
              />
              <SearchButton
                onClick={() => {
                  if (searchTerm) {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                    setShowSearchSuggestions(false);
                  }
                }}
              >
                {isSearchProductsLoading ? (
                  <SpinnerIcon>
                    <FaSpinner />
                  </SpinnerIcon>
                ) : (
                  <FaSearch />
                )}
              </SearchButton>
            </SearchBar>

            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <SearchSuggestions>
                {searchSuggestions.map((suggestion, index) => {
                  console.log("Rendering suggestion:", suggestion);
                  return (
                    <SuggestionItem
                      key={`${suggestion.type}-${suggestion.id}`}
                      active={index === activeSuggestion}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <SuggestionImage>
                        <img src={suggestion.image} alt={suggestion.name} />
                      </SuggestionImage>
                      <SuggestionText>
                        <SuggestionName>{suggestion.name}</SuggestionName>
                        <SuggestionDetails>
                          <SuggestionCategory>
                            {suggestion.category}
                          </SuggestionCategory>
                          <SuggestionPrice>${suggestion.price}</SuggestionPrice>
                        </SuggestionDetails>
                      </SuggestionText>
                    </SuggestionItem>
                  );
                })}
              </SearchSuggestions>
            )}

            {showSearchSuggestions &&
              searchTerm &&
              searchSuggestions.length === 0 &&
              !isSearchProductsLoading && (
                <NoSuggestions>
                  No products found for "{searchTerm}"
                </NoSuggestions>
              )}

            {isSearchProductsLoading && (
              <LoadingSuggestions>
                <SpinnerIcon>
                  <FaSpinner />
                </SpinnerIcon>
                Searching products...
              </LoadingSuggestions>
            )}
          </SearchContainer>
          <SearchMo>
            <MobileMenuButton onClick={toggleMobileMenu}>
              <FaBars />
            </MobileMenuButton>
            <SearchContainer ref={searchRef} type="mobile">
              <SearchBar>
                <SearchInput
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                    setActiveSuggestion(0);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onKeyDown={handleSearchKeyDown}
                />
                <SearchButton
                  onClick={() => {
                    if (searchTerm) {
                      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                      setShowSearchSuggestions(false);
                    }
                  }}
                >
                  {isSearchProductsLoading ? (
                    <SpinnerIcon>
                      <FaSpinner />
                    </SpinnerIcon>
                  ) : (
                    <FaSearch />
                  )}
                </SearchButton>
              </SearchBar>

              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <SearchSuggestions>
                  {searchSuggestions.map((suggestion, index) => {
                    console.log("Rendering suggestion:", suggestion);
                    return (
                      <SuggestionItem
                        key={`${suggestion.type}-${suggestion.id}`}
                        active={index === activeSuggestion}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <SuggestionImage>
                          <img src={suggestion.image} alt={suggestion.name} />
                        </SuggestionImage>
                        <SuggestionText>
                          <SuggestionName>{suggestion.name}</SuggestionName>
                          <SuggestionDetails>
                            <SuggestionCategory>
                              {suggestion.category}
                            </SuggestionCategory>
                            <SuggestionPrice>
                              ${suggestion.price}
                            </SuggestionPrice>
                          </SuggestionDetails>
                        </SuggestionText>
                      </SuggestionItem>
                    );
                  })}
                </SearchSuggestions>
              )}

              {showSearchSuggestions &&
                searchTerm &&
                searchSuggestions.length === 0 &&
                !isSearchProductsLoading && (
                  <NoSuggestions>
                    No products found for "{searchTerm}"
                  </NoSuggestions>
                )}

              {isSearchProductsLoading && (
                <LoadingSuggestions>
                  <SpinnerIcon>
                    <FaSpinner />
                  </SpinnerIcon>
                  Searching products...
                </LoadingSuggestions>
              )}
            </SearchContainer>
          </SearchMo>
          <HeaderActions>
            <Logo type="action">
              <LogoIcon>🛒</LogoIcon>
              <LogoText to="/">Eaz Shop</LogoText>
            </Logo>
            <ActionList>
              <HeaderAction>
                {userData ? (
                  <AccountDropdown ref={dropdownRef}>
                    <AccountButton
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <ActionIcon>
                        <FaUser />
                      </ActionIcon>
                      <ActionText>{user.name || user.email}</ActionText>
                    </AccountButton>
                    {showDropdown && (
                      <DropdownMenu>
                        <DropdownItem as={Link} to="/profile">
                          My Profile
                        </DropdownItem>
                        <DropdownItem as={Link} to="/orders">
                          My Orders
                        </DropdownItem>
                        <DropdownItem as={Link} to="/reviews">
                          My Reviews
                        </DropdownItem>
                        <DropdownItem as={Link} to="/addresses">
                          My Addresses
                        </DropdownItem>
                        <DropdownItem as={Link} to="/credit-balance">
                          Balance
                        </DropdownItem>
                        <DropdownItem as={Link} to="/followed">
                          Followed
                        </DropdownItem>
                        <DropdownItem as={Link} to="/notifications">
                          Notifications
                        </DropdownItem>
                        <DropdownItem as={Link} to="/profile">
                          Settings
                        </DropdownItem>
                        <DropdownItem as={Link} to="/coupons">
                          Coupons
                        </DropdownItem>
                        <DropdownItem as={Link} to="/browser-history">
                          Browser History
                        </DropdownItem>
                        <DropdownItem as={Link} to="/permissions">
                          Permissions
                        </DropdownItem>
                        <DropdownItem onClick={logoutHandler}>
                          Logout
                        </DropdownItem>
                      </DropdownMenu>
                    )}
                  </AccountDropdown>
                ) : (
                  <BottomLink to="/login">
                    <ActionIcon>
                      <FaUser />
                    </ActionIcon>
                    <ActionText>Account</ActionText>
                  </BottomLink>
                )}
              </HeaderAction>

              <HeaderAction>
                <BottomLink to="/wishlist">
                  <ActionIcon>
                    <FaHeart />
                    {wishlist?.productCount > 0 && (
                      <ActionBadge>{wishlist.productCount}</ActionBadge>
                    )}
                  </ActionIcon>
                  <ActionText>Wishlist</ActionText>
                </BottomLink>
              </HeaderAction>

              <HeaderAction>
                <BottomLink to="/cart">
                  <ActionIcon>
                    <FaShoppingCart />
                    {cartCount > 0 && <ActionBadge>{cartCount}</ActionBadge>}
                  </ActionIcon>
                  <ActionText>Cart</ActionText>
                </BottomLink>
              </HeaderAction>
            </ActionList>
          </HeaderActions>
        </BottomHeader>
      </RightHeader>
    </StyledHeader>
  );
}

// Styled Components
const StyledHeader = styled.header`
  background: var(--color-white-0);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;

  @media (max-width: 76.8rem) {
    width: 100vw;
  }
`;
const RightHeader = styled.div`
  flex: 1;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 5%;
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 76.8rem) {
    display: none;
  }
`;

const TopLinks = styled.div`
  display: flex;
  gap: 2rem;
`;
const RightLinks = styled.div`
  display: flex;
  gap: 2rem;
`;
const TopButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-500);
  text-decoration: none;
  font-size: 1%.4rem;
  transition: color 0.3s;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  background: rgba(78, 115, 223, 0.1);

  &:hover {
    background: rgba(78, 115, 223, 0.2);
    color: var(--color-grey-500);
  }

  span {
    @media (max-width: 48rem) {
      display: none;
    }
  }
`;
const MiddleLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const SupportLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-grey-500);
  text-decoration: none;
  font-size: 1.4rem;
  transition: color 0.3s;
  padding: 6px 1%;
  border-radius: 0.4rem;
  background: rgba(78, 115, 223, 0.1);

  &:hover {
    background: rgba(78, 115, 223, 0.2);
    color: var(--color-primary-500);
  }

  span {
    @media (max-width: 48rem) {
      display: none;
    }
  }
`;

const BottomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4%;

  @media (max-width: 76.8rem) {
    flex-direction: column-reverse;
    padding: 0 1rem;
  }
`;

const Logo = styled.div`
  display: ${(props) => (props.type === "main" ? "flex" : "none")};
  padding: 0 1rem 0 2rem;
  flex-direction: ${(props) => (props.type === "action" ? "" : "column")};
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-grey-700);

  @media (max-width: 76.8rem) {
    display: ${(props) => (props.type === "action" ? "flex" : "none")};
  }
`;

const LogoIcon = styled.span`
  margin-right: 1rem;
  font-size: 2.8rem;
`;

const BottomLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-grey-700);
  transition: color 0.3s;

  &:hover {
    color: var(--color-primary-500);
  }
`;

const LogoText = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const CategoriesContainer = styled.div`
  position: relative;
  display: inline-block;

  @media (max-width: 76.8rem) {
    display: none;
    visibility: hidden;
    opacity: 0;
  }
`;

const CategoriesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1rem 2rem;
  border: none;
  border-radius: 3rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  position: relative;
  z-index: 10;

  &:hover {
    background: var(--color-primary-500);
  }

  span {
    @media (max-width: 48rem) {
      display: none;
    }
  }
`;

const CategoriesDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 80rem;
  background: var(--color-white-0);
  border-radius: 8px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-top: 1rem;
  overflow: hidden;

  @media (max-width: 90rem) {
    width: 60rem;
  }

  @media (max-width: 70rem) {
    width: 90vw;
    left: -5rem;
  }
`;

const DropdownContent = styled.div`
  padding: 0;
`;

const DropdownHeader = styled.div`
  padding: 1.5rem 2rem;
  background-color: var(--color-primary-500);
  color: var(--color-white-0);

  h3 {
    margin: 0;
    font-size: 1.6rem;
  }
`;

const CategoryPanels = styled.div`
  display: flex;
  height: 40rem;

  @media (max-width: 70rem) {
    flex-direction: column;
    height: auto;
    max-height: 70vh;
    overflow-y: auto;
  }
`;

const ParentCategoriesPanel = styled.div`
  width: 40%;
  border-right: 1px solid #eaecf4;
  overflow-y: auto;

  @media (max-width: 70rem) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eaecf4;
  }
`;

const SubCategoriesPanel = styled.div`
  width: 60%;
  overflow-y: auto;
  padding: 10px;

  @media (max-width: 70rem) {
    width: 100%;
  }
`;

const PanelTitle = styled.div`
  padding: 1.2rem 2rem;
  font-weight: 600;
  background-color: var(--color-white-0);
  border-bottom: 1px solid var(--color-white-0);
`;

const CategoriesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li`
  border-bottom: 1px solid var(--color-white-0);
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.active {
    background: var(--color-white-0);
  }
`;

const CategoryLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1.2rem 2rem;
  text-decoration: none;
  color: var(--color-grey-700);

  &:hover {
    color: var(--color-primary-500);
  }
`;

const CategoryImage = styled.img`
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1.2rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-white-0);
`;

const CategoryName = styled.span`
  flex: 1;
  font-weight: 500;
  font-size: 1.4rem;
`;

const SubCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;

  @media (max-width: 90rem) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 50rem) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
  }
`;

const SubCategoryGridItem = styled.div`
  text-align: center;
`;

const SubCategoryGridLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--color-grey-800);
  transition: transform 0.2s;

  &:hover {
    color: var(--color-primary-500);
    transform: translateY(-3px);
  }
`;

const SubCategoryCircleImage = styled.img`
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 8px;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
`;

const SubCategoryGridName = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
`;

const NoSubCategories = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
  font-style: italic;
  grid-column: 1 / -1;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
`;

const NoCategories = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  /* Desktop (default): gap-based */
  justify-content: flex-end;

  /* Tablet and below: spread items apart */
  @media (max-width: 76.8rem) {
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }
`;

const HeaderAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:hover {
    color: var(--color-primary-500);
  }
`;
const ActionList = styled.div`
  display: flex;
  gap: 1.5rem;
  padding-right: 1.5rem;
`;
const ActionIcon = styled.div`
  font-size: 2.2rem;
  position: relative;
  color: var(--color-grey-500);
`;

const ActionText = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);

  @media (max-width: 48rem) {
    display: none;
  }
`;

const ActionBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: var(--color-white-0);
  font-size: 1.1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 2.4rem;
  cursor: pointer;
  color: var(--color-primary-500);

  @media (max-width: 99.2rem) {
    display: block;
  }
`;

const AccountDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const AccountButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;

  &:hover {
    color: var(--color-primary-500);

    ${ActionIcon}, ${ActionText} {
      color: var(--color-primary-500);
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-white-0);
  border: 1px solid var(--color-white-0);
  border-radius: 8px;
  box-shadow: 0 8px 2.4rem rgba(46, 58, 89, 0.08);
  min-width: 20rem;
  z-index: 1000;
  padding: 5px 0;
  margin-top: 1rem;
`;

const DropdownItem = styled.div`
  padding: 1rem 2rem;
  color: var(--color-grey-700);
  cursor: pointer;
  font-size: 1.4rem;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  display: block;

  &:hover {
    background: var(--color-white-0);
    color: var(--color-primary-500);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 0 2rem;

  /* Desktop only */
  ${(props) =>
    props.type === "main" &&
    `
    @media (max-width: 76.8rem) {
      display: none;
    }
  `}

  /* Mobile & Tablet only */
  ${(props) =>
    props.type === "mobile" &&
    `
    display: none;
    @media (max-width: 76.8rem) {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0;
    }
  `}
`;
const SearchMo = styled.div`
  display: none;
  visibility: hidden;
  opacity: 0;
  @media (max-width: 76.8rem) {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 2px 1rem;
    display: flex;
    visibility: visible;
    opacity: 1;
  }
`;

const SearchSuggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 1.5rem rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  max-height: 30rem;
  overflow-y: auto;
  z-index: 1000;
  padding: 1rem 0;
  border: 2px solid var(--primary-500);
  border-top: none;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.active ? "#f8f9fc" : "transparent")};

  &:hover {
    background-color: var(--color-white-0);
  }
`;

const SuggestionImage = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1.5rem;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SuggestionText = styled.div`
  flex: 1;
`;

const SuggestionName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const SuggestionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SuggestionCategory = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-400);
`;

const SuggestionPrice = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-primary-500);
`;

const NoSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
  margin-top: 2px;
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1000;
  border: 2px solid var(--color-primary-50);
  border-top: none;
`;

const SearchBar = styled.div`
  display: flex;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 18px;
  border: 2px solid var(--color-grey-200);
  border-radius: 3rem 0 0 3rem;
  font-size: 1.5rem;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: var(--color-primary-500);
  }
`;

const SearchButton = styled.button`
  background-color: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  padding: 0 2.5rem;
  border-radius: 0 3rem 3rem 0;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-primary-500);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerIcon = styled.span`
  animation: ${spin} 1s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white-0);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  padding: 2rem;
  text-align: center;
  color: var(--color-grey-400);
  z-index: 1000;
  border: 2px solid var(--color-primary-500);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
