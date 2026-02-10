import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  FaBars,
  FaHeart,
  FaShoppingCart,
  FaThList,
  FaUser,
  FaHeadset,
  FaStore,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import styled from "styled-components";
import {  slideDown } from "../styles/animations";
import useAuth from '../hooks/useAuth';
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from '../hooks/useWishlist';
import { useCartTotals } from '../hooks/useCart';
import useCategory from '../hooks/useCategory';
import { useSearchSuggestions } from '../hooks/useSearch';
import { PATHS } from '../../routes/routePaths';
import HeaderSearchBar from '../components/HeaderSearchBar';
import Logo from '../components/Logo';
import { getAvatarUrl } from '../utils/avatarUtils';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { logout, userData } = useAuth();
  
  const { count: cartCount, total: cartTotal } = useCartTotals();
  const { getParentCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } =
    getParentCategories;

  // Improved search suggestions hook with better caching
  const { data: searchSuggestionsData, isLoading: isSearchProductsLoading } =
    useSearchSuggestions(debouncedSearchTerm, {
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get parent categories with subcategories
  const parentCategories = useMemo(() => {
    // Backend returns: { status: 'success', results: number, data: { categories: [...] } }
    // Service returns response.data directly
    if (!categoriesData) return [];
    return categoriesData?.data?.categories || categoriesData?.categories || [];
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

  // Debounce search term (300ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const user = useMemo(() => {
    // Handle different response structures:
    // - After login: userData is the user object directly
    // - After getCurrentUser: userData might be { data: {...user} } or { data: { data: {...user} } }
    // - After refetch: userData could be either structure
    const extractedUser = userData?.data?.data || userData?.data?.user || userData?.user || userData || null;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && extractedUser) {
      console.log('[Header] User extracted:', {
        hasPhoto: !!extractedUser?.photo,
        photo: extractedUser?.photo,
        userId: extractedUser?.id || extractedUser?._id
      });
    }
    
    return extractedUser;
  }, [userData]);


  const { data: wishlistData } = useWishlist();

  // Extract wishlist and calculate product count
  const { wishlist, wishlistCount } = useMemo(() => {
    const wishlistObj = wishlistData?.data?.wishlist || wishlistData?.data || null;
    
    // Calculate count from products array
    const products = wishlistObj?.products || [];
    const count = Array.isArray(products) ? products.length : 0;
    
    return {
      wishlist: wishlistObj,
      wishlistCount: count,
    };
  }, [wishlistData]);

  // Generate search suggestions from improved API response
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
    // New API returns: { success: true, data: [...] }
    return searchSuggestionsData?.data || searchSuggestionsData || [];
  }, [debouncedSearchTerm, searchSuggestionsData]);

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
    setSearchTerm(suggestion.text);
    setShowSearchSuggestions(false);

    switch (suggestion.type) {
      case "product":
        navigate(
          `${PATHS.SEARCH}?type=product&q=${encodeURIComponent(
            suggestion.text
          )}`
        );
        break;
      case "category":
        navigate(
          `${PATHS.SEARCH}?type=category&q=${encodeURIComponent(
            suggestion.text
          )}`
        );
        break;
      case "brand":
        navigate(
          `${PATHS.SEARCH}?type=brand&q=${encodeURIComponent(suggestion.text)}`
        );
        break;
      case "tag":
        navigate(
          `${PATHS.SEARCH}?type=tag&q=${encodeURIComponent(suggestion.text)}`
        );
        break;
      default:
        // fallback: general search
        navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(suggestion.text)}`);
    }
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
    <ModernHeader isScrolled={isScrolled}>
      <TopBar>
        <Container>
          <TopBarContent>
            <TopLinks>
              <TopLink
                as="a"
                href="https://seller.saiisai.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaStore />
                <span>Become a Seller</span>
              </TopLink>
              <TopLink to="/support">
                <FaHeadset />
                <span>24/7 Support</span>
              </TopLink>
            </TopLinks>
            
            <PromoText>
              🚀 Free shipping on orders over $50 | 🔥 Hot Deals Live Now
            </PromoText>
            
            <RightLinks>
              <TopLink to={PATHS.DEALS}>Daily Deals</TopLink>
              <TopLink to={PATHS.NEW_ARRIVALS}>New Arrivals</TopLink>
              <TopLink to={PATHS.BEST_SELLERS}>Best Sellers</TopLink>
            </RightLinks>
          </TopBarContent>
        </Container>
      </TopBar>

      <MainHeader>
        <Container>
          <HeaderContent>
            {/* Mobile Menu Button / Sidebar Toggle - Left Side */}
            {onToggleSidebar ? (
              <MobileMenuButton 
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
              </MobileMenuButton>
            ) : (
              <MobileMenuButton 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </MobileMenuButton>
            )}

            {/* Logo */}
            <Logo to={PATHS.HOME} variant="compact" />

            {/* Categories & Search */}
            <NavSection>
              <CategoriesContainer ref={categoriesDropdownRef}>
                <CategoriesButton
                  onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                  isActive={showCategoriesDropdown}
                  aria-expanded={showCategoriesDropdown}
                  aria-label="Browse product categories"
                >
                  <MenuIcon>
                    <FaThList />
                  </MenuIcon>
                  <span>Browse Categories</span>
                  <ChevronIcon>
                    {showCategoriesDropdown ? <FaChevronUp /> : <FaChevronDown />}
                  </ChevronIcon>
                </CategoriesButton>

                {showCategoriesDropdown && (
                  <CategoriesDropdown>
                    <DropdownContent>
                      <CategoryPanels>
                        <ParentCategoriesPanel>
                          <PanelTitle>All Categories</PanelTitle>
                          <CategoriesList>
                            {isCategoriesLoading ? (
                              <LoadingMessage>Loading categories...</LoadingMessage>
                            ) : isCategoriesError ? (
                              <NoCategories>Unable to load categories</NoCategories>
                            ) : parentCategories.length === 0 ? (
                              <NoCategories>No categories available</NoCategories>
                            ) : (
                              parentCategories.map((category) => (
                                <CategoryItem
                                  key={category._id}
                                  onMouseEnter={() => setHoveredCategory(category)}
                                  isActive={hoveredCategory?._id === category._id}
                                >
                                  <CategoryLink
                                    to={`/category/${category._id}`}
                                    onClick={() => setShowCategoriesDropdown(false)}
                                  >
                                    <CategoryImage
                                      src={category.image}
                                      alt={category.name}
                                      onError={(e) => {
                                        e.target.src = "/api/placeholder/30/30";
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
                              ? `${hoveredCategory.name}`
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
                                        e.target.src = "/api/placeholder/60/60";
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
                                  : "Select a category to view subcategories"}
                              </NoSubCategories>
                            )}
                          </SubCategoriesGrid>
                        </SubCategoriesPanel>
                      </CategoryPanels>
                    </DropdownContent>
                  </CategoriesDropdown>
                )}
              </CategoriesContainer>

              {/* Desktop Search */}
              <SearchContainer>
                <HeaderSearchBar
                  type="main"
                  searchTerm={searchTerm}
                  setShowSearchSuggestions={setShowSearchSuggestions}
                  setSearchTerm={setSearchTerm}
                  searchSuggestions={searchSuggestions}
                  handleSearchKeyDown={handleSearchKeyDown}
                  showSearchSuggestions={showSearchSuggestions}
                  setActiveSuggestion={setActiveSuggestion}
                  activeSuggestion={activeSuggestion}
                  isSearchProductsLoading={isSearchProductsLoading}
                  navigate={navigate}
                  handleSuggestionSelect={handleSuggestionSelect}
                  searchRef={searchRef}
                />
              </SearchContainer>
            </NavSection>

            {/* User Actions */}
            <ActionSection>
              <ActionList>
                <HeaderAction>
                  {userData && user ? (
                    <AccountDropdown ref={dropdownRef}>
                      <AccountButton
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        <UserAvatar>
                          {user?.photo ? (
                            <AvatarImage 
                              src={`${getAvatarUrl(user.photo)}?t=${Date.now()}`} 
                              alt={user?.name || 'User'}
                              key={`avatar-${user?.photo}-${user?._id || user?.id}-${Date.now()}`} // Force re-render when photo or user changes
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('✅ [Header] Avatar loaded:', getAvatarUrl(user.photo));
                              }}
                            />
                          ) : (
                            <AvatarFallback>
                              {user?.name
                                ? user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                                : user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </UserAvatar>
                        <ActionText>
                          <UserName>{user?.name || user?.email || 'User'}</UserName>
                          <UserRole>My Account</UserRole>
                        </ActionText>
                      </AccountButton>
                      {showDropdown && (
                        <DropdownMenu>
                          <DropdownSection>
                            <DropdownItem as={Link} to="/profile">
                              <FaUser />
                              My Profile
                            </DropdownItem>
                            <DropdownItem as={Link} to="/orders">
                              My Orders
                            </DropdownItem>
                            <DropdownItem as={Link} to="/reviews">
                              My Reviews
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection>
                            <DropdownItem as={Link} to="/addresses">
                              My Addresses
                            </DropdownItem>
                            <DropdownItem as={Link} to="/credit-balance">
                              Balance
                            </DropdownItem>
                            <DropdownItem as={Link} to="/coupons">
                              Coupons
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection>
                            <DropdownItem onClick={logoutHandler}>
                              Logout
                            </DropdownItem>
                          </DropdownSection>
                        </DropdownMenu>
                      )}
                    </AccountDropdown>
                  ) : (
                    <BottomLink to="/login">
                      <ActionIcon>
                        <FaUser />
                      </ActionIcon>
                      <ActionText>
                        <UserName>Account</UserName>
                        <UserRole>Login/Register</UserRole>
                      </ActionText>
                    </BottomLink>
                  )}
                </HeaderAction>

                <HeaderAction>
                  <BottomLink to="/wishlist">
                    <ActionIcon>
                      <FaHeart />
                      {wishlistCount > 0 && (
                        <ActionBadge>{wishlistCount}</ActionBadge>
                      )}
                    </ActionIcon>
                    <ActionText>
                      <UserName>Wishlist</UserName>
                      <UserRole>My Items</UserRole>
                    </ActionText>
                  </BottomLink>
                </HeaderAction>

                <HeaderAction>
                  <BottomLink to="/cart">
                    <ActionIcon>
                      <FaShoppingCart />
                      {cartCount > 0 && <ActionBadge>{cartCount}</ActionBadge>}
                    </ActionIcon>
                    <ActionText>
                      <UserName>Cart</UserName>
                      <UserRole>GH₵{cartTotal.toFixed(2)}</UserRole>
                    </ActionText>
                  </BottomLink>
                </HeaderAction>
              </ActionList>
            </ActionSection>
          </HeaderContent>

          {/* Mobile Search */}
          <MobileSearchSection>
            <HeaderSearchBar
              type="mobile"
              searchTerm={searchTerm}
              setShowSearchSuggestions={setShowSearchSuggestions}
              setSearchTerm={setSearchTerm}
              searchSuggestions={searchSuggestions}
              handleSearchKeyDown={handleSearchKeyDown}
              showSearchSuggestions={showSearchSuggestions}
              setActiveSuggestion={setActiveSuggestion}
              activeSuggestion={activeSuggestion}
              isSearchProductsLoading={isSearchProductsLoading}
              navigate={navigate}
              handleSuggestionSelect={handleSuggestionSelect}
              searchRef={searchRef}
            />
          </MobileSearchSection>
        </Container>
      </MainHeader>

      {/* Mobile Menu */}
      {isMobileMenuOpen && !onToggleSidebar && (
        <MobileMenu onClick={() => setIsMobileMenuOpen(false)}>
          <MobileMenuContent onClick={(e) => e.stopPropagation()}>
            {/* Become a Seller - Top Link */}
            <MobileMenuItem
              href="https://seller.saiisai.com"
              target="_blank"
              rel="noopener noreferrer"
              $highlight
            >
              <FaStore />
              <span>Become a Seller</span>
            </MobileMenuItem>

            {/* Navigation Links */}
            <MobileMenuItemLink to={PATHS.HOME} onClick={() => setIsMobileMenuOpen(false)}>
              <span>Home</span>
            </MobileMenuItemLink>
            <MobileMenuItemLink to={PATHS.CATEGORIES} onClick={() => setIsMobileMenuOpen(false)}>
              <span>Categories</span>
            </MobileMenuItemLink>
            <MobileMenuItemLink to={PATHS.OFFERS} onClick={() => setIsMobileMenuOpen(false)}>
              <span>Offers</span>
            </MobileMenuItemLink>
            <MobileMenuItemLink to={PATHS.BEST_SELLERS} onClick={() => setIsMobileMenuOpen(false)}>
              <span>Best Sellers</span>
            </MobileMenuItemLink>
            <MobileMenuItemLink to={PATHS.SUPPORT} onClick={() => setIsMobileMenuOpen(false)}>
              <FaHeadset />
              <span>24/7 Support</span>
            </MobileMenuItemLink>

            {/* User Actions */}
            {user ? (
              <>
                <MobileMenuDivider />
                <MobileMenuItemLink to={PATHS.PROFILE} onClick={() => setIsMobileMenuOpen(false)}>
                  <FaUser />
                  <span>My Profile</span>
                </MobileMenuItemLink>
                <MobileMenuItemLink to={PATHS.ORDERS} onClick={() => setIsMobileMenuOpen(false)}>
                  <span>My Orders</span>
                </MobileMenuItemLink>
                <MobileMenuItemLink to={PATHS.WISHLIST} onClick={() => setIsMobileMenuOpen(false)}>
                  <FaHeart />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <MobileBadge>{wishlistCount}</MobileBadge>}
                </MobileMenuItemLink>
                <MobileMenuItemLink to={PATHS.CART} onClick={() => setIsMobileMenuOpen(false)}>
                  <FaShoppingCart />
                  <span>Cart</span>
                  {cartCount > 0 && <MobileBadge>{cartCount}</MobileBadge>}
                </MobileMenuItemLink>
                <MobileMenuDivider />
                <MobileMenuItemButton
                  onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }}
                >
                  <span>Logout</span>
                </MobileMenuItemButton>
              </>
            ) : (
              <>
                <MobileMenuDivider />
                <MobileMenuItemLink to={PATHS.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <FaUser />
                  <span>Login / Register</span>
                </MobileMenuItemLink>
              </>
            )}
          </MobileMenuContent>
        </MobileMenu>
      )}
    </ModernHeader>
  );
}

// Modern Styled Components
// Using fadeIn from unified animations

const ModernHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: ${props => props.isScrolled 
    ? 'rgba(255, 255, 255, 0.95)' 
    : 'var(--color-white-0)'
  };
  backdrop-filter: ${props => props.isScrolled ? 'blur(20px)' : 'none'};
  box-shadow: ${props => props.isScrolled 
    ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
    : '0 1px 0 rgba(0, 0, 0, 0.05)'
  };
  transition: all 0.3s ease;
`;

const TopBar = styled.div`
  background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%);
  padding: 0.8rem 0;
  color: var(--color-white-0);
  font-size: var(--text-sm);
  font-family: var(--font-heading);

  @media (max-width: 768px) {
    display: none;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-lg);

  @media (max-width: 768px) {
    padding: 0 var(--space-md);
  }
`;

const TopBarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const TopLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 400;
  transition: all var(--transition-base);
  font-family: var(--font-heading);

  &:hover {
    color: var(--color-white-0);
    transform: translateY(-1px);
  }
`;

const PromoText = styled.div`
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  text-align: center;
  flex: 1;
`;

const RightLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const MainHeader = styled.div`
  padding: 1rem 0;
  position: relative; /* Ensure dropdown positioning context */
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  width: 100%;
  min-width: 0;
  position: relative; /* Ensure dropdown positioning context */
  
  @media (max-width: 1024px) {
    gap: var(--space-md);
  }

  @media (max-width: 768px) {
    gap: var(--space-sm);
  }
`;


const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex: 1;
  min-width: 0;
  max-width: 100%; 
  position: relative; /* Ensure dropdown positioning context */

  @media (max-width: 1024px) {
    gap: var(--space-md);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  flex: 2;
  min-width: 0; 
  max-width: 100%; 
  width: 100%;
  position: relative; /* Ensure dropdown positioning context */
  z-index: 100; /* Lower than dropdown but ensures proper stacking */
`;

const MobileSearchSection = styled.div`
  display: none;
  margin-top: 1rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const CategoriesContainer = styled.div`
  position: relative;
  flex-shrink: 0; /* Prevent categories button from shrinking */
`;

const CategoriesButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)' 
    : 'var(--color-white-0)'
  };
  color: ${props => props.isActive ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  border: 2px solid ${props => props.isActive ? 'transparent' : 'var(--color-grey-200)'};
  border-radius: var(--radius-xl);
  cursor: pointer;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: all var(--transition-base);
  white-space: nowrap;
  font-family: var(--font-heading);

  &:hover {
    background: ${props => props.isActive 
      ? 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)' 
      : 'var(--color-grey-50)'
    };
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

const MenuIcon = styled.span`
  font-size: 1.6rem;
`;

const ChevronIcon = styled.span`
  font-size: 1.2rem;
  opacity: 0.7;
`;

const CategoriesDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 80rem;
  background: var(--color-white-0);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 1rem;
  overflow: hidden;
  animation: ${slideDown} 0.3s ease;

  @media (max-width: 1024px) {
    width: 60rem;
  }

  @media (max-width: 768px) {
    width: 90vw;
    left: -5rem;
  }
`;

const DropdownContent = styled.div`
  padding: 0;
`;

const CategoryPanels = styled.div`
  display: flex;
  height: 45rem;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    max-height: 70vh;
    overflow-y: auto;
  }
`;

const ParentCategoriesPanel = styled.div`
  width: 35%;
  background: var(--color-grey-50);
  border-right: 1px solid var(--color-grey-200);
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-grey-200);
  }
`;

const SubCategoriesPanel = styled.div`
  width: 65%;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PanelTitle = styled.div`
  padding: 2rem;
  font-weight: 500;
  font-size: 1.6rem;
  color: var(--color-grey-800);
  background: var(--color-white-0);
  border-bottom: 1px solid var(--color-grey-200);
  font-family: var(--font-heading);
`;

const CategoriesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 1rem 0;
`;

const CategoryItem = styled.li`
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  border-left-color: ${props => props.isActive ? 'var(--color-primary-500)' : 'transparent'};
  background: ${props => props.isActive ? 'var(--color-white-0)' : 'transparent'};

  &:hover {
    background: var(--color-white-0);
    border-left-color: var(--color-primary-300);
  }
`;

const CategoryLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  text-decoration: none;
  color: var(--color-grey-700);
  transition: all 0.3s ease;
  font-family: var(--font-body);

  &:hover {
    color: var(--color-primary-500);
  }
`;

const CategoryImage = styled.img`
  width: 3.2rem;
  height: 3.2rem;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1.5rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
`;

const CategoryName = styled.span`
  flex: 1;
  font-weight: 500;
  font-size: 1.4rem;
  font-family: var(--font-heading);
`;

const SubCategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 1rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
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
  transition: all 0.3s ease;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--color-grey-50);

  &:hover {
    color: var(--color-primary-500);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    background: var(--color-white-0);
  }
`;

const SubCategoryCircleImage = styled.img`
  width: 7rem;
  height: 7rem;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1rem;
  background: var(--color-white-0);
  border: 2px solid var(--color-grey-200);
  transition: all 0.3s ease;

  ${SubCategoryGridLink}:hover & {
    border-color: var(--color-primary-500);
    transform: scale(1.05);
  }
`;

const SubCategoryGridName = styled.span`
  font-size: 1.3rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  font-family: var(--font-heading);
`;

const NoSubCategories = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--color-grey-400);
  font-style: italic;
  grid-column: 1 / -1;
`;

const LoadingMessage = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--color-grey-400);
  font-size: 1.4rem;
`;

const NoCategories = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--color-grey-400);
  font-size: 1.4rem;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  justify-self: end;
`;

const ActionList = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const HeaderAction = styled.div`
  position: relative;

  &:hover {
    color: var(--color-primary-500);
  }
`;

const BottomLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--color-grey-700);
  transition: all 0.3s ease;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;

  &:hover {
    color: var(--color-primary-500);
    background: var(--color-grey-50);
    transform: translateY(-1px);
  }
`;

const ActionIcon = styled.div`
  font-size: 2.2rem;
  position: relative;
  color: inherit;
  transition: all 0.3s ease;
`;

const UserAvatar = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--color-primary-200);
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  font-size: 1.6rem;
  font-weight: 600;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--color-grey-800);
  line-height: 1.2;
  text-transform: capitalize;
  font-family: var(--font-heading);
  max-width: 15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserRole = styled.span`
  font-size: 1.1rem;
  color: var(--color-grey-500);
  line-height: 1.2;
  font-family: var(--font-body);
`;

const ActionBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-700) 100%);
  color: var(--color-white-0);
  font-size: var(--text-xs);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  border: 2px solid var(--color-white-0);
  box-shadow: 0 2px 8px rgba(248, 113, 113, 0.3);
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 2.2rem;
  cursor: pointer;
  color: var(--color-grey-700);
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    background: var(--color-grey-50);
    color: var(--color-primary-500);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const AccountDropdown = styled.div`
  position: relative;
`;

const AccountButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-grey-50);
    color: var(--color-primary-500);
  }

  &:hover ${UserAvatar} {
    border-color: var(--color-primary-400);
    transform: scale(1.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  min-width: 25rem;
  z-index: 1000;
  padding: 1rem 0;
  margin-top: 1rem;
  animation: ${slideDown} 0.3s ease;
`;

const DropdownSection = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2rem;
  color: var(--color-grey-700);
  cursor: pointer;
  font-size: 1.4rem;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-body);

  &:hover {
    background: var(--color-grey-50);
    color: var(--color-primary-500);
    padding-left: 2.5rem;
  }
`;

// Mobile Menu Styled Components
const MobileMenu = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  background: var(--color-white-0);
  width: 100%;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: ${slideDown} 0.3s ease;
`;

const mobileMenuItemStyles = `
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.6rem 2rem;
  color: var(--color-grey-700);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 500;
  border-bottom: 1px solid var(--color-grey-100);
  transition: all 0.3s ease;
  font-family: var(--font-heading);
  position: relative;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: left;

  &:hover {
    background: var(--color-grey-50);
    color: var(--color-primary-500);
    padding-left: 2.5rem;
  }

  svg {
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MobileMenuItem = styled.a`
  ${mobileMenuItemStyles}
  background: ${props => props.$highlight 
    ? 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-700) 100%)' 
    : 'transparent'
  };
  color: ${props => props.$highlight ? 'var(--color-white-0)' : 'var(--color-grey-700)'};

  &:hover {
    background: ${props => props.$highlight 
      ? 'linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-800) 100%)' 
      : 'var(--color-grey-50)'
    };
    color: ${props => props.$highlight ? 'var(--color-white-0)' : 'var(--color-primary-500)'};
    padding-left: ${props => props.$highlight ? '2rem' : '2.5rem'};
  }
`;

const MobileMenuItemLink = styled(Link)`
  ${mobileMenuItemStyles}
`;

const MobileMenuItemButton = styled.button`
  ${mobileMenuItemStyles}
`;

const MobileMenuDivider = styled.div`
  height: 1px;
  background: var(--color-grey-200);
  margin: 0.5rem 0;
`;

const MobileBadge = styled.span`
  margin-left: auto;
  background: linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-700) 100%);
  color: var(--color-white-0);
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 1.2rem;
  min-width: 2.4rem;
  text-align: center;
`;