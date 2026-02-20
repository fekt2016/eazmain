import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { FaFilter, FaChevronDown, FaTimes, FaSortAmountDown, FaAward, FaCheck, FaShieldAlt, FaTruck } from "react-icons/fa";
import useProduct from "../../shared/hooks/useProduct";
import { useEazShop } from "../../shared/hooks/useEazShop";
import ProductCard from "../../shared/components/ProductCard";
import Container from "../../shared/components/Container";
import { SkeletonGrid, SkeletonCard, EmptyState } from "../../components/loading";
import { devicesMax } from "../../shared/styles/breakpoint";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";
import { fadeInUp } from "../../shared/styles/animations";

const ProductsPage = () => {
  useDynamicPageTitle({
    title: "All Products - Saiisai",
    description: "Browse all products on Saiisai",
    defaultTitle: "All Products - Saiisai",
    defaultDescription: "Browse all products on Saiisai",
  });
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [showEazShopOnly, setShowEazShopOnly] = useState(false);

  // Check if URL has eazshop query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("eazshop") === "true") {
      setShowEazShopOnly(true);
    }
  }, [location.search]);

  // Get all products
  const { getProducts } = useProduct();
  const { data: productsData, isLoading: isProductsLoading } = getProducts;

  // Get EazShop products
  const { useGetEazShopProducts } = useEazShop();
  const { data: eazshopProductsData, isLoading: isEazShopLoading } = useGetEazShopProducts();

  // Process all products (backend returns { status, results, total, data: { data: products } })
  const allProducts = useMemo(() => {
    let products = [];

    if (Array.isArray(productsData)) {
      products = productsData;
    } else if (productsData?.data?.data && Array.isArray(productsData.data.data)) {
      products = productsData.data.data;
    } else if (productsData?.results && Array.isArray(productsData.results)) {
      products = productsData.results;
    } else if (productsData?.data?.results && Array.isArray(productsData.data.results)) {
      products = productsData.data.results;
    } else if (productsData?.data?.products && Array.isArray(productsData.data.products)) {
      products = productsData.data.products;
    } else if (productsData?.data && Array.isArray(productsData.data)) {
      products = productsData.data;
    } else if (productsData?.products && Array.isArray(productsData.products)) {
      products = productsData.products;
    }

    // Only show approved, non-deleted products (active or out_of_stock)
    if (Array.isArray(products)) {
      return products.filter(
        (p) =>
          p.moderationStatus === 'approved' &&
          !p.isDeleted &&
          !p.isDeletedByAdmin &&
          !p.isDeletedBySeller &&
          p.status !== 'archived' &&
          (p.status === 'active' || p.status === 'out_of_stock')
      );
    }

    return [];
  }, [productsData]);

  // Process EazShop products
  const eazshopProducts = useMemo(() => {
    // Handle various API response structures defensively
    let products = [];

    if (!eazshopProductsData) {
      return [];
    }

    if (Array.isArray(eazshopProductsData)) {
      products = eazshopProductsData;
    } else if (eazshopProductsData?.results && Array.isArray(eazshopProductsData.results)) {
      products = eazshopProductsData.results;
    } else if (eazshopProductsData?.data?.results && Array.isArray(eazshopProductsData.data.results)) {
      products = eazshopProductsData.data.results;
    } else if (eazshopProductsData?.data?.products && Array.isArray(eazshopProductsData.data.products)) {
      products = eazshopProductsData.data.products;
    } else if (eazshopProductsData?.data && Array.isArray(eazshopProductsData.data)) {
      products = eazshopProductsData.data;
    } else if (eazshopProductsData?.products && Array.isArray(eazshopProductsData.products)) {
      products = eazshopProductsData.products;
    }

    return Array.isArray(products) ? products : [];
  }, [eazshopProductsData]);

  // Combine and filter products
  const displayProducts = useMemo(() => {
    let products = [...allProducts];

    // Add EazShop products if not already included (only if eazshopProducts is an array)
    if (Array.isArray(eazshopProducts)) {
      eazshopProducts.forEach(eazProduct => {
        // CRITICAL: Only add non-deleted EazShop products
        if (!eazProduct.isDeleted &&
          !eazProduct.isDeletedByAdmin &&
          !eazProduct.isDeletedBySeller &&
          eazProduct.status !== 'archived' &&
          !products.find(p => p._id === eazProduct._id)) {
          products.push(eazProduct);
        }
      });
    }

    // CRITICAL: Filter out deleted products (client-side safety check)
    products = products.filter(product => {
      if (product.isDeleted === true ||
        product.isDeletedByAdmin === true ||
        product.isDeletedBySeller === true ||
        product.status === 'archived') {
        return false;
      }
      return true;
    });

    // Filter by EazShop only if requested
    if (showEazShopOnly) {
      products = products.filter(p => p.isEazShopProduct);
    }

    // Sort products
    const sorted = [...products];
    switch (sortOption) {
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name":
        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [allProducts, eazshopProducts, showEazShopOnly, sortOption]);

  const toggleFilters = () => setShowFilters(!showFilters);

  if (isProductsLoading && isEazShopLoading) {
    return (
      <PageContainer>
        <Container>
          <PageHeader>
            <PageTitle>All Products</PageTitle>
          </PageHeader>
          <SkeletonGrid count={8} />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <PageHeader>
          <HeaderContent>
            <PageTitle>
              {showEazShopOnly ? "Saiisai Official Store" : "All Products"}
            </PageTitle>
            <ProductCount>{displayProducts.length} products available</ProductCount>
          </HeaderContent>
          <FilterButton onClick={toggleFilters}>
            <FaFilter /> Filter
          </FilterButton>
        </PageHeader>

        {/* EazShop Products Section - Show at top if not filtering */}
        {!showEazShopOnly && eazshopProducts.length > 0 && (
          <EazShopSection>
            <EazShopHeader>
              <HeaderLeft>
                <BadgeContainer>
                  <EazShopBadge>
                    <FaAward />
                    <span>Official Store</span>
                  </EazShopBadge>
                  <TrustBadge>
                    <FaCheck /> Trusted
                  </TrustBadge>
                  <TrustBadge>
                    <FaShieldAlt /> Verified
                  </TrustBadge>
                  <TrustBadge>
                    <FaTruck /> Fast Delivery
                  </TrustBadge>
                </BadgeContainer>
                <EazShopTitle>Saiisai Official Store</EazShopTitle>
                <EazShopSubtitle>
                  Trusted • Verified • Fast Delivery
                </EazShopSubtitle>
              </HeaderLeft>
            </EazShopHeader>
            <EazShopGrid>
              {eazshopProducts
                .filter(product => {
                  // CRITICAL: Exclude deleted products
                  return !product.isDeleted &&
                    !product.isDeletedByAdmin &&
                    !product.isDeletedBySeller &&
                    product.status !== 'archived';
                })
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    showAddToCart
                  />
                ))}
            </EazShopGrid>
            {eazshopProducts.length > 8 && (
              <ViewMoreButton onClick={() => setShowEazShopOnly(true)}>
                View All Saiisai Products <FaChevronDown />
              </ViewMoreButton>
            )}
          </EazShopSection>
        )}

        {/* Filters Sidebar */}
        {showFilters && (
          <>
            <SidebarOverlay onClick={toggleFilters} />
            <FilterSidebar>
              <FilterHeader>
                <h3>Filters</h3>
                <CloseButton onClick={toggleFilters}>
                  <FaTimes />
                </CloseButton>
              </FilterHeader>
              <FilterContent>
                <FilterGroup>
                  <FilterLabel>Show Only</FilterLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={showEazShopOnly}
                      onChange={(e) => setShowEazShopOnly(e.target.checked)}
                    />
                    <span>Saiisai Official Store</span>
                  </CheckboxLabel>
                </FilterGroup>
                <FilterGroup>
                  <FilterLabel>Sort By</FilterLabel>
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </Select>
                </FilterGroup>
              </FilterContent>
            </FilterSidebar>
          </>
        )}

        {/* Sort Bar */}
        <SortBar>
          <SortLabel>
            <FaSortAmountDown /> Sort:
          </SortLabel>
          <SortSelect
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </SortSelect>
        </SortBar>

        {/* Products Grid */}
        {displayProducts.length === 0 ? (
          <EmptyState>
            <h3>No Products Found</h3>
            <p>
              {showEazShopOnly
                ? "No Saiisai products available at the moment."
                : "No products available at the moment."}
            </p>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {displayProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                showAddToCart
              />
            ))}
          </ProductsGrid>
        )}
      </Container>
    </PageContainer>
  );
};

export default ProductsPage;

// Styled Components
const PageContainer = styled.div`
  padding: 3rem 0 5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 0.5rem;

  @media ${devicesMax.md} {
    font-size: 2.5rem;
  }
  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const ProductCount = styled.p`
  font-size: 1.4rem;
  color: #64748b;
  margin: 0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  @media ${devicesMax.sm} {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const EazShopSection = styled.section`
  margin-bottom: 4rem;
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const EazShopHeader = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const HeaderLeft = styled.div`
  color: white;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const EazShopBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.3);

  svg {
    font-size: 1rem;
  }
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);

  svg {
    font-size: 0.85rem;
  }
`;

const EazShopTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media ${devicesMax.sm} {
    font-size: 2rem;
  }
`;

const EazShopSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  margin: 0;
`;

const EazShopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 cards per row */
  gap: 1.5rem;
  position: relative;
  z-index: 1;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr); /* 3 cards on medium screens */
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 2 cards on tablets */
    gap: 1rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: repeat(2, 1fr); /* 2 cards on mobile */
    gap: 0.75rem;
  }
`;

const ViewMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const FilterSidebar = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
  overflow-y: auto;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media ${devicesMax.sm} {
    width: 100%;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #2c3e50;
  }
`;

const FilterContent = styled.div`
  padding: 2rem;
`;

const FilterGroup = styled.div`
  margin-bottom: 2rem;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  color: #475569;
  cursor: pointer;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SortBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SortLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #475569;
  font-size: 1.1rem;
`;

const SortSelect = styled.select`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
  }
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

