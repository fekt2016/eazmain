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

  const { logout, userData, isLoading: isUserLoading } = useAuth();
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

  if (isUserLoading) return <div>Loading...</div>;

  return (
    <StyledHeader>
      <HeaderTop>
        <Logo>
          <LogoIcon>🛒</LogoIcon>
          <LogoText to="/">Eaz Shop</LogoText>
        </Logo>

        <TopLinks>
          <TopButton href="https://seller.eazshop.com" target="_blank">
            <FaStore />
            <span>Seller Portal</span>
          </TopButton>

          <TopButton href="https://app.eazshop.com/download" target="_blank">
            <FaMobile />
            <span>Get App</span>
          </TopButton>

          <SupportLink to="/support">
            <FaHeadset />
            <span>Support</span>
          </SupportLink>
        </TopLinks>
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

        <SearchContainer ref={searchRef}>
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

        <HeaderActions>
          <HeaderAction>
            {userData ? (
              <AccountDropdown ref={dropdownRef}>
                <AccountButton onClick={() => setShowDropdown(!showDropdown)}>
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
                    <DropdownItem onClick={logoutHandler}>Logout</DropdownItem>
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

          <MobileMenuButton onClick={toggleMobileMenu}>
            <FaBars />
          </MobileMenuButton>
        </HeaderActions>
      </BottomHeader>
    </StyledHeader>
  );
}

// Styled Components
const StyledHeader = styled.header`
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5%;
  border-bottom: 1px solid #eaecf4;
  background-color: #f8f9fc;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 15px;
  }
`;

const TopLinks = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 480px) {
    gap: 15px;
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }
`;

const TopButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5a5c69;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(78, 115, 223, 0.1);

  &:hover {
    background: rgba(78, 115, 223, 0.2);
    color: #4e73df;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const SupportLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: 5a5c69;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(78, 115, 223, 0.1);

  &:hover {
    background: rgba(78, 115, 223, 0.2);
    color: #4e73df;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const BottomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5%;
  background-color: #fff;
  position: relative;

  @media (max-width: 992px) {
    flex-wrap: wrap;
    gap: 15px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #4e73df;
`;

const LogoIcon = styled.span`
  margin-right: 10px;
  font-size: 28px;
`;

const BottomLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #5a5c69;
  transition: color 0.3s;

  &:hover {
    color: #4e73df;
  }
`;

const LogoText = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const CategoriesContainer = styled.div`
  position: relative;
  display: inline-block;

  @media (max-width: 992px) {
    order: 1;
  }
`;

const CategoriesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  position: relative;
  z-index: 10;

  &:hover {
    background: #2e59d9;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const CategoriesDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 800px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-top: 10px;
  overflow: hidden;

  @media (max-width: 900px) {
    width: 600px;
  }

  @media (max-width: 700px) {
    width: 90vw;
    left: -50px;
  }
`;

const DropdownContent = styled.div`
  padding: 0;
`;

const DropdownHeader = styled.div`
  padding: 15px 20px;
  background-color: #4e73df;
  color: white;

  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

const CategoryPanels = styled.div`
  display: flex;
  height: 400px;

  @media (max-width: 700px) {
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

  @media (max-width: 700px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eaecf4;
  }
`;

const SubCategoriesPanel = styled.div`
  width: 60%;
  overflow-y: auto;
  padding: 10px;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const PanelTitle = styled.div`
  padding: 12px 20px;
  font-weight: 600;
  background-color: #f8f9fc;
  border-bottom: 1px solid #eaecf4;
`;

const CategoriesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li`
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.active {
    background: #f8f9fc;
  }
`;

const CategoryLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #333;

  &:hover {
    color: #4e73df;
  }
`;

const CategoryImage = styled.img`
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
  background: #f8f9fc;
  border: 1px solid #eaecf4;
`;

const CategoryName = styled.span`
  flex: 1;
  font-weight: 500;
  font-size: 14px;
`;

const SubCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 15px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
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
  color: #333;
  transition: transform 0.2s;

  &:hover {
    color: #4e73df;
    transform: translateY(-3px);
  }
`;

const SubCategoryCircleImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 8px;
  background: #f8f9fc;
  border: 1px solid #eaecf4;
`;

const SubCategoryGridName = styled.span`
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
`;

const NoSubCategories = styled.div`
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  grid-column: 1 / -1;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #6c757d;
`;

const NoCategories = styled.div`
  padding: 20px;
  text-align: center;
  color: #6c757d;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 992px) {
    order: 3;
    margin-left: auto;
  }
`;

const HeaderAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:hover {
    color: #4e73df;
  }
`;

const ActionIcon = styled.div`
  font-size: 22px;
  position: relative;
  color: #5a5c69;
`;

const ActionText = styled.span`
  font-size: 12px;
  color: #5a5c69;

  @media (max-width: 480px) {
    display: none;
  }
`;

const ActionBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b6b;
  color: white;
  font-size: 11px;
  width: 20px;
  height: 20px;
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
  font-size: 24px;
  cursor: pointer;
  color: #4e73df;

  @media (max-width: 768px) {
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
    color: #4e73df;

    ${ActionIcon}, ${ActionText} {
      color: #4e73df;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #eaecf4;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(46, 58, 89, 0.08);
  min-width: 200px;
  z-index: 1000;
  padding: 5px 0;
  margin-top: 10px;
`;

const DropdownItem = styled.div`
  padding: 10px 20px;
  color: #2e3a59;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  display: block;

  &:hover {
    background: #f8f9fc;
    color: #4e73df;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 600px;
  margin: 0 20px;

  @media (max-width: 992px) {
    order: 2;
    width: 100%;
    max-width: 100%;
    margin: 0;
  }
`;

const SearchSuggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  padding: 10px 0;
  border: 2px solid #4e73df;
  border-top: none;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.active ? "#f8f9fc" : "transparent")};

  &:hover {
    background-color: #f8f9fc;
  }
`;

const SuggestionImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
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
  font-size: 12px;
  color: #858796;
`;

const SuggestionPrice = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4e73df;
`;

const NoSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  padding: 20px;
  text-align: center;
  color: #858796;
  z-index: 1000;
  border: 2px solid #4e73df;
  border-top: none;
`;

const SearchBar = styled.div`
  display: flex;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #eaecf4;
  border-radius: 30px 0 0 30px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: #4e73df;
  }
`;

const SearchButton = styled.button`
  background: #4e73df;
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 0 30px 30px 0;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #2e59d9;
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
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-top: -2px;
  padding: 20px;
  text-align: center;
  color: #858796;
  z-index: 1000;
  border: 2px solid #4e73df;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
