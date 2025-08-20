import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBars,
  FaHeart,
  FaSearch,
  FaShoppingCart,
  FaThList,
  FaUser,
  FaHeadset,
  FaStore, // Seller domain icon
  FaMobile, // Mobile app icon
} from "react-icons/fa";
import styled from "styled-components";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import { useCartTotals } from "../hooks/useCart";
import useCategory from "../hooks/useCategory";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  const { logout, userData, isLoading: isUserLoading } = useAuth();
  const { count: cartCount } = useCartTotals();

  const { getParentCategories } = useCategory();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    getParentCategories;

  const categories = useMemo(() => {
    return categoriesData?.data?.categories || [];
  }, [categoriesData]);

  const user = userData?.user || userData?.data || null;
  const { data: wishlistData } = useWishlist();
  const wishlist = useMemo(() => {
    return wishlistData?.data || [];
  }, [wishlistData]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Close modal if clicked outside
      if (
        showCategoriesModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowCategoriesModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoriesModal]);

  const logoutHandler = () => {
    logout.mutate();
  };

  if (isUserLoading || isCategoriesLoading) return <div>Loading...</div>;

  return (
    <StyledHeader>
      <HeaderTop>
        <Logo>
          <LogoIcon>🛒</LogoIcon>
          <LogoText to="/">Eaz Shop</LogoText>
        </Logo>

        <TopLinks>
          {/* Seller Portal Button */}
          <TopButton href="https://seller.eazshop.com" target="_blank">
            <FaStore />
            <span>Seller Portal</span>
          </TopButton>

          {/* Mobile App Button */}
          <TopButton href="https://app.eazshop.com/download" target="_blank">
            <FaMobile />
            <span>Get App</span>
          </TopButton>

          {/* Support Link */}
          <SupportLink to="/support">
            <FaHeadset />
            <span>Support</span>
          </SupportLink>
        </TopLinks>
      </HeaderTop>

      <BottomHeader>
        <CategoriesContainer>
          <CategoriesButton
            ref={buttonRef}
            onClick={() => setShowCategoriesModal(!showCategoriesModal)}
          >
            <FaThList />
            <span>Categories</span>
          </CategoriesButton>

          {showCategoriesModal && (
            <CategoriesModal ref={modalRef}>
              <ModalContent>
                <ModalHeader>
                  <h3>All Categories</h3>
                  <CloseButton onClick={() => setShowCategoriesModal(false)}>
                    &times;
                  </CloseButton>
                </ModalHeader>
                <CategoriesGrid>
                  {categories?.length === 0 ? (
                    <NoCategories>No categories available</NoCategories>
                  ) : (
                    categories?.map((category) => (
                      <CategoryCard
                        key={category._id}
                        to={`/category/${category._id}`}
                        onClick={() => setShowCategoriesModal(false)}
                      >
                        <CategoryImage
                          src={category.image}
                          alt={category.name}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=No+Image";
                            e.target.onerror = null;
                          }}
                        />
                        <CategoryName>{category.name}</CategoryName>
                      </CategoryCard>
                    ))
                  )}
                </CategoriesGrid>
              </ModalContent>
            </CategoriesModal>
          )}
        </CategoriesContainer>

        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search for products, brands, and sellers..."
          />
          <SearchButton>
            <FaSearch />
          </SearchButton>
        </SearchBar>

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
                {wishlist?.products?.length > 0 && (
                  <ActionBadge>{wishlist.products.length}</ActionBadge>
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

// New button style for top links
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

const BottomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5%;
  background-color: #fff;
  position: relative;

  @media (max-width: 992px) {
    flex-wrap: wrap;
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

const CategoriesModal = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 800px;
  max-width: 90vw;
  z-index: 1000;
  margin-top: 10px;

  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-height: 80vh;
  }
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #4e73df;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const NoCategories = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: #6c757d;
`;

const CategoryCard = styled(Link)`
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #f8f9fc;
  border: 1px solid #eaecf4;
`;

const CategoryName = styled.div`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const SearchBar = styled.div`
  display: flex;
  flex: 1;
  max-width: 600px;
  margin: 0 20px;

  @media (max-width: 992px) {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin-top: 15px;
  }
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 992px) {
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
  min-width: 180px;
  z-index: 1000;
  padding: 2px 0;
  margin-top: 10px;
`;

const DropdownItem = styled.div`
  padding: 8px 20px;
  color: #2e3a59;
  cursor: pointer;
  font-size: 10px;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  display: block;

  &:hover {
    background: #f8f9fc;
    color: #4e73df;
  }
`;
