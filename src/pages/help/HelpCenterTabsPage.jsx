import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import HelpTabs from '../../components/help/HelpTabs';
import HelpTabPanel from '../../components/help/HelpTabPanel';
import qaData from '../../data/help/qaData';
import { devicesMax } from '../../shared/styles/breakpoint';

// ── Layout ────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 60%, #1a2035 100%);
  padding: 52px 24px 64px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.10) 1px, transparent 1px);
    background-size: 26px 26px;
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: 36px 16px 52px;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.8rem;
  letter-spacing: -0.02em;

  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

const HeroSub = styled.p`
  font-size: var(--font-size-md);
  color: rgba(255,255,255,0.7);
  margin: 0 0 2.8rem;
`;

const SearchWrap = styled.div`
  position: relative;
  max-width: 520px;
  margin: 0 auto;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1.6rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-400);
  font-size: var(--font-size-md);
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.4rem 1.6rem 1.4rem 4.4rem;
  border: none;
  border-radius: 1.2rem;
  font-size: var(--font-size-md);
  background: #fff;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  outline: none;
  color: var(--color-grey-800);

  &::placeholder { color: var(--color-grey-400); }

  &:focus {
    box-shadow: 0 4px 24px rgba(0,0,0,0.18), 0 0 0 3px rgba(212,136,42,0.25);
  }
`;

const Content = styled.div`
  max-width: 900px;
  margin: -24px auto 0;
  padding: 0 24px 60px;
  position: relative;
  z-index: 2;

  @media ${devicesMax.md} {
    padding: 0 16px 48px;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 28px 28px 20px;

  @media ${devicesMax.sm} {
    padding: 20px 16px 16px;
  }
`;

const ResultCount = styled.p`
  font-size: 0.8rem;
  color: var(--color-grey-400);
  margin: 0 0 16px;
`;

// ── Component ─────────────────────────────────────────
const HelpCenterTabsPage = () => {
  useDynamicPageTitle({
    title: 'Help Center - Saiisai',
    description: 'Find quick answers to common questions about orders, payments, returns, account management, and more.',
    defaultTitle: 'Help Center - Saiisai',
    defaultDescription: 'Get help with your orders, account, payments, shipping, and more.',
  });

  const faqSchema = useMemo(() => {
    const allQuestions = [];
    qaData.forEach(category => {
      category.items.forEach(item => {
        allQuestions.push({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        });
      });
    });
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allQuestions.slice(0, 10)
    };
  }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => qaData.map((cat) => cat.category), []);
  const currentCategoryData = qaData[activeTab] || { items: [] };

  const displayItems = useMemo(() => {
    if (searchTerm.trim()) {
      const matchingItems = [];
      qaData.forEach((category) => {
        category.items.forEach((item) => {
          if (
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            matchingItems.push(item);
          }
        });
      });
      return matchingItems;
    }
    return currentCategoryData.items || [];
  }, [searchTerm, activeTab, currentCategoryData]);

  return (
    <Page>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

      <Hero>
        <HeroInner>
          <HeroTitle>Help Center</HeroTitle>
          <HeroSub>Find quick answers to common questions</HeroSub>
          <SearchWrap>
            <SearchIcon><FaSearch /></SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrap>
        </HeroInner>
      </Hero>

      <Content>
        <Card>
          {searchTerm.trim() ? (
            <ResultCount>
              {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;
            </ResultCount>
          ) : (
            <HelpTabs
              tabs={categories}
              activeTab={activeTab}
              onTabChange={(idx) => { setActiveTab(idx); setSearchTerm(''); }}
            />
          )}

          <HelpTabPanel
            isActive={true}
            items={displayItems}
            searchTerm={searchTerm}
          />
        </Card>
      </Content>
    </Page>
  );
};

export default HelpCenterTabsPage;
