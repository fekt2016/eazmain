import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaTag, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useGetDeals } from '../../shared/hooks/useDeals';
import DealsToolbar from '../../components/deals/DealsToolbar';
import DealsCountdown from '../../components/deals/DealsCountdown';
import DealsGrid from '../../components/deals/DealsGrid';
import { LoadingState } from '../../components/loading';
import Pagination from '../../components/ui/Pagination';
import { PATHS } from '../../routes/routePaths';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const DealsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'default';
  const category = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24;

  const [sortOption, setSortOption] = useState(sort);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useDynamicPageTitle({
    title: 'Deals & Discounts',
    description: 'Enjoy exclusive discounts on top products at Saiisai.',
    defaultTitle: 'Deals & Discounts • Saiisai',
  });

  const { data, isLoading, error } = useGetDeals({
    sort: sortOption,
    category: selectedCategory,
    page,
    limit,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    if (page > 1) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageBanner>
          <BannerOverlay />
          <BannerInner>
            <BannerIcon>
              <FaTag />
            </BannerIcon>
            <BannerTextGroup>
              <BannerTitle>Deals &amp; Discounts</BannerTitle>
              <BannerSub>Enjoy exclusive discounts on top products.</BannerSub>
            </BannerTextGroup>
          </BannerInner>
        </PageBanner>
        <LoadingState message="Loading deals…" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageBanner>
          <BannerOverlay />
          <BannerInner>
            <BannerIcon>
              <FaTag />
            </BannerIcon>
            <BannerTextGroup>
              <BannerTitle>Deals &amp; Discounts</BannerTitle>
              <BannerSub>Enjoy exclusive discounts on top products.</BannerSub>
            </BannerTextGroup>
          </BannerInner>
        </PageBanner>
        <ContentWrap>
          <EmptyBox>
            <EmptyIconWrap style={{ background: '#fff1f0' }}>⚠️</EmptyIconWrap>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyText>We couldn&apos;t load deals. Please try again later.</EmptyText>
            <ShopButton to={PATHS.HOME}>
              Back to home <FaArrowRight />
            </ShopButton>
          </EmptyBox>
        </ContentWrap>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageBanner>
        <BannerOverlay />
        <BannerInner>
          <BannerIcon>
            <FaTag />
          </BannerIcon>
          <BannerTextGroup>
            <BannerTitle>Deals &amp; Discounts</BannerTitle>
            <BannerSub>
              {products.length} deal{products.length !== 1 ? 's' : ''} right now
              {selectedCategory ? ' — filtered by category' : ''}
            </BannerSub>
          </BannerTextGroup>
        </BannerInner>
      </PageBanner>

      <ContentWrap>
        <DealsToolbar
          sortOption={sortOption}
          selectedCategory={selectedCategory}
          onSortChange={handleSortChange}
          onCategoryChange={handleCategoryChange}
        />

        <DealsCountdown />

        {products.length === 0 ? (
          <EmptyBox>
            <EmptyIconWrap>
              <FaTag />
            </EmptyIconWrap>
            <EmptyTitle>No deals right now</EmptyTitle>
            <EmptyText>
              There&apos;s nothing to display at the moment. Try another category or check
              back soon for new offers.
            </EmptyText>
            <ShopButton to={PATHS.PRODUCTS}>
              <FaShoppingBag /> Browse all products
            </ShopButton>
          </EmptyBox>
        ) : (
          <>
            <DealsGrid products={products} />
            {totalPages > 1 && (
              <PaginationWrap>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </PaginationWrap>
            )}
            <BottomRow>
              <ContinueLink to={PATHS.HOME}>
                <FaShoppingBag /> Continue shopping
              </ContinueLink>
            </BottomRow>
          </>
        )}
      </ContentWrap>
    </PageContainer>
  );
};

export default DealsPage;

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9f7f4;
  font-family: 'Inter', sans-serif;
`;

const PageBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  overflow: hidden;
  padding: 2.5rem 2rem;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212, 136, 42, 0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(212, 136, 42, 0.15) 0%, transparent 60%);
  pointer-events: none;
`;

const BannerInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  animation: ${fadeUp} 0.4s ease;
`;

const BannerIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.2);
  border: 2px solid rgba(212, 136, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #d4882a;
  flex-shrink: 0;
`;

const BannerTextGroup = styled.div``;

const BannerTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const BannerSub = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
`;

const ContentWrap = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
`;

const PaginationWrap = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
`;

const ContinueLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: 2px solid #d4882a;
  border-radius: 30px;
  color: #d4882a;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    background: #d4882a;
    color: #ffffff;
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1.5rem;
  max-width: 480px;
  margin: 3rem auto;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  animation: ${fadeUp} 0.4s ease;
`;

const EmptyIconWrap = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #d4882a;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1f2e;
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1.75rem 0;
  line-height: 1.55;
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #d4882a;
  color: #ffffff;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s ease;

  &:hover {
    background: #b8711f;
  }
`;
