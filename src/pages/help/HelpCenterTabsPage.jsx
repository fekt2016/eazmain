import { useState, useMemo } from 'react';
import styled from 'styled-components';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import Container from '../../components/ui/Container';
import PageHeroComponent from '../../components/ui/PageHero';
import HelpSectionHeader from '../../components/help/HelpSectionHeader';
import HelpSearchBar from '../../components/help/HelpSearchBar';
import HelpTabs from '../../components/help/HelpTabs';
import HelpTabPanel from '../../components/help/HelpTabPanel';
import qaData from '../../data/help/qaData';
import { devicesMax } from '../../shared/styles/breakpoint';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  padding-bottom: var(--spacing-3xl);
`;

const ContentWrapper = styled(Container)`
  padding-top: var(--spacing-2xl);
  max-width: 120rem;
  
  @media ${devicesMax.md} {
    padding-top: var(--spacing-xl);
  }
`;

const TabsSection = styled.section`
  margin-bottom: var(--spacing-2xl);
`;

const HelpCenterTabsPage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'Help Center - Saiisai',
    description: 'Find quick answers to common questions about orders, payments, returns, account management, and more.',
    defaultTitle: 'Help Center - Saiisai',
    defaultDescription: 'Get help with your orders, account, payments, shipping, and more.',
  });

  // FAQ Schema
  const faqSchema = useMemo(() => {
    // Collect all Q&A items from data
    const allQuestions = [];
    qaData.forEach(category => {
      category.items.forEach(item => {
        allQuestions.push({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        });
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allQuestions.slice(0, 10) // Limit to top 10 for rich results
    };
  }, []);

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract categories and tab labels
  const categories = useMemo(() => qaData.map((cat) => cat.category), []);
  const tabLabels = categories;

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    // Clear search when empty
    if (!term) {
      setSearchTerm('');
    }
  };

  // Get current category data
  const currentCategoryData = qaData[activeTab] || { items: [] };

  // When searching, show results from all categories
  // When not searching, show items from the active tab's category
  const displayItems = useMemo(() => {
    if (searchTerm.trim()) {
      // Search across all categories
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
    // No search - show items from active tab
    return currentCategoryData.items || [];
  }, [searchTerm, activeTab, currentCategoryData]);

  return (
    <PageContainer>
      {/* FAQ Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      {/* Page Hero */}
      <PageHeroComponent
        title="Help Center"
        subtitle="Find quick answers to common questions"
        variant="default"
      />

      {/* Main Content */}
      <ContentWrapper constrained>
        {/* Section Header */}
        <HelpSectionHeader
          title="How can we help you?"
          subtitle="Browse our frequently asked questions organized by category, or search for specific topics."
        />

        {/* Search Bar */}
        <HelpSearchBar onSearch={handleSearch} />

        {/* Tabs Section */}
        <TabsSection>
          <HelpTabs
            tabs={tabLabels}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Show active tab panel with filtered items */}
          <HelpTabPanel
            isActive={true}
            items={displayItems}
            searchTerm={searchTerm}
          />
        </TabsSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default HelpCenterTabsPage;

