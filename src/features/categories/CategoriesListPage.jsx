import { useMemo } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaArrowRight } from "react-icons/fa";
import useCategory from '../../shared/hooks/useCategory';
import Container from '../../shared/components/Container';
import { devicesMax } from '../../shared/styles/breakpoint';
import { PATHS } from "../../routes/routePaths";
import { LoadingState } from '../../components/loading';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';

export default function CategoriesListPage() {
  useDynamicPageTitle({
    title: 'Categories - EazShop',
    description: 'Browse products by category on EazShop',
    defaultTitle: 'Categories - EazShop',
    defaultDescription: 'Browse products by category on EazShop',
  });
  const { getCategories } = useCategory();
  const { data: categoriesData, isLoading, isError } = getCategories;

  const categories = useMemo(() => {
    // Backend returns: { status: 'success', results: [...], meta: {...} }
    // Service now returns response.data directly
    return categoriesData?.results || categoriesData?.data?.results || [];
  }, [categoriesData]);

  // Filter to show only parent categories (top-level)
  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((cat) => !cat.parentCategory || cat.parentCategory === null);
  }, [categories]);

  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <LoadingState />
        </Container>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Container>
          <PageHeader>
            <PageTitle>All Categories</PageTitle>
            <PageDescription>Browse products by category</PageDescription>
          </PageHeader>
          <EmptyState>
            <EmptyIcon>⚠️</EmptyIcon>
            <EmptyTitle>Unable to Load Categories</EmptyTitle>
            <EmptyText>There was an error loading categories. Please try refreshing the page.</EmptyText>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <PageHeader>
          <PageTitle>All Categories</PageTitle>
          <PageDescription>Browse products by category</PageDescription>
        </PageHeader>

        {parentCategories.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📁</EmptyIcon>
            <EmptyTitle>No Categories Available</EmptyTitle>
            <EmptyText>Check back later for new categories.</EmptyText>
          </EmptyState>
        ) : (
          <CategoriesGrid>
            {parentCategories.map((category) => {
              const productCount = category.productCount || 0;
              return (
                <CategoryCard key={category._id || category.id} to={`${PATHS.CATEGORIES}/${category._id || category.id}`}>
                  <CategoryImageContainer>
                    <CategoryImage
                      src={category.image || "/api/placeholder/400/300"}
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                      }}
                    />
                    <CategoryOverlay />
                  </CategoryImageContainer>
                  <CategoryContent>
                    <CategoryName>{category.name}</CategoryName>
                    {category.description && (
                      <CategoryDescription>{category.description}</CategoryDescription>
                    )}
                    <CategoryFooter>
                      <ProductCount>{productCount} {productCount === 1 ? 'product' : 'products'}</ProductCount>
                      <ViewLink>
                        View <FaArrowRight />
                      </ViewLink>
                    </CategoryFooter>
                  </CategoryContent>
                </CategoryCard>
              );
            })}
          </CategoriesGrid>
        )}
      </Container>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  padding: 3rem 0;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const PageTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  letter-spacing: -1px;

  @media ${devicesMax.md} {
    font-size: 2.5rem;
  }
`;

const PageDescription = styled.p`
  font-size: 1.6rem;
  color: #64748b;
  margin: 0;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;

  @media ${devicesMax.md} {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Define CategoryOverlay before CategoryCard to avoid hoisting issues
const CategoryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  opacity: 0.5;
  transition: opacity 0.3s ease;
`;

const ViewLink = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffc400;
  transition: transform 0.3s ease;
`;

const CategoryCard = styled(Link)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

    ${CategoryOverlay} {
      opacity: 0.3;
    }

    ${ViewLink} {
      transform: translateX(5px);
    }
  }
`;

const CategoryImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${CategoryCard}:hover & {
    transform: scale(1.1);
  }
`;

const CategoryContent = styled.div`
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CategoryName = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.2;
`;

const CategoryDescription = styled.p`
  font-size: 1.4rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CategoryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const ProductCount = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: #475569;
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

