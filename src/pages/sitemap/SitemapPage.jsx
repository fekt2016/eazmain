import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaHeadset, FaBook, FaComments } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  SitemapContainer,
  HeroSection,
  HeroTitle,
  HeroSubtitle,
  SearchSection,
  SearchLabel,
  SearchInput,
  SectionsGrid,
  SitemapSection,
  SectionHeader,
  LinksList,
  LinkItem,
  SitemapLink,
  FooterCTA,
  CTATitle,
  CTAButtons,
  CTAButton,
} from './sitemap.styles';

/**
 * Modern Sitemap Page
 * Displays all pages and resources across the EazWorld ecosystem
 */
const SitemapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // SEO
  useDynamicPageTitle({
    title: 'Sitemap | EazWorld',
    description: 'Explore all pages and resources across EazWorld, EazShop, EazSeller, and EazAdmin platforms.',
    keywords: 'sitemap, pages, navigation, EazWorld, EazShop, EazSeller, EazAdmin',
    defaultTitle: 'Sitemap | EazWorld',
    defaultDescription: 'Explore all pages and resources across EazWorld, EazShop, EazSeller, and EazAdmin platforms.',
  });

  // Sitemap sections data
  const sitemapSections = [
    {
      id: 'eazmain',
      title: 'EazMain (Buyer App)',
      links: [
        { label: 'Home', path: PATHS.HOME },
        { label: 'All Categories', path: PATHS.CATEGORIES },
        { label: 'Flash Sales', path: PATHS.OFFERS },
        { label: 'Cart', path: PATHS.CART },
        { label: 'Checkout', path: PATHS.CHECKOUT },
        { label: 'Orders', path: PATHS.ORDERS },
        { label: 'Wishlist', path: PATHS.WISHLIST },
        { label: 'Account', path: PATHS.PROFILE },
        { label: 'Address Book', path: PATHS.ADDRESSES },
        { label: 'Support', path: PATHS.SUPPORT },
        { label: 'Press', path: PATHS.PRESS },
        { label: 'About Us', path: PATHS.ABOUT },
        { label: 'Terms & Conditions', path: PATHS.TERMS },
        { label: 'Privacy Policy', path: PATHS.PRIVACY },
      ],
    },
    {
      id: 'eazseller',
      title: 'EazSeller (Seller Portal)',
      links: [
        { label: 'Dashboard', path: 'https://seller.eazworld.com/dashboard', external: true },
        { label: 'Products', path: 'https://seller.eazworld.com/products', external: true },
        { label: 'Create Product', path: 'https://seller.eazworld.com/products/add', external: true },
        { label: 'Orders', path: 'https://seller.eazworld.com/orders', external: true },
        { label: 'Payouts', path: 'https://seller.eazworld.com/finance/payouts', external: true },
        { label: 'Withdrawals', path: 'https://seller.eazworld.com/finance/withdrawals', external: true },
        { label: 'Reviews', path: 'https://seller.eazworld.com/reviews', external: true },
        { label: 'Store Setup', path: 'https://seller.eazworld.com/store/settings', external: true },
        { label: 'Settings', path: 'https://seller.eazworld.com/settings', external: true },
        { label: 'Support Center', path: 'https://seller.eazworld.com/support', external: true },
        { label: 'Policies', path: 'https://seller.eazworld.com/seller/policies', external: true },
      ],
    },
    {
      id: 'eazadmin',
      title: 'EazAdmin (Admin Portal)',
      links: [
        { label: 'Admin Dashboard', path: 'https://admin.eazworld.com/dashboard', external: true },
        { label: 'Manage Sellers', path: 'https://admin.eazworld.com/sellers', external: true },
        { label: 'Manage Products', path: 'https://admin.eazworld.com/products', external: true },
        { label: 'Orders Panel', path: 'https://admin.eazworld.com/orders', external: true },
        { label: 'Payments & Wallet', path: 'https://admin.eazworld.com/payment-request', external: true },
        { label: 'Withdrawals', path: 'https://admin.eazworld.com/balance-history', external: true },
        { label: 'User Reports', path: 'https://admin.eazworld.com/users', external: true },
        { label: 'Activity Logs', path: 'https://admin.eazworld.com/activity-logs', external: true },
        { label: 'System Settings', path: 'https://admin.eazworld.com/platform-settings', external: true },
        { label: 'Support / Internal Tools', path: 'https://admin.eazworld.com/support', external: true },
      ],
    },
    {
      id: 'eazworld',
      title: 'EazWorld (Company Website)',
      links: [
        { label: 'Home', path: 'https://eazworld.com', external: true },
        { label: 'Services', path: 'https://eazworld.com/services', external: true },
        { label: 'Pricing', path: 'https://eazworld.com/pricing', external: true },
        { label: 'Portfolio', path: 'https://eazworld.com/portfolio', external: true },
        { label: 'Hosting Plans', path: 'https://eazworld.com/hosting', external: true },
        { label: 'Domain Search', path: 'https://eazworld.com/domains', external: true },
        { label: 'About EazWorld', path: 'https://eazworld.com/about', external: true },
        { label: 'Press & Media', path: 'https://eazworld.com/press', external: true },
        { label: 'Careers', path: 'https://eazworld.com/careers', external: true },
        { label: 'Contact Us', path: 'https://eazworld.com/contact', external: true },
        { label: 'Sitemap', path: PATHS.SITEMAP },
      ],
    },
    {
      id: 'legal',
      title: 'Legal & Policies',
      links: [
        { label: 'Privacy Policy', path: PATHS.PRIVACY },
        { label: 'Terms of Use', path: PATHS.TERMS },
        { label: 'Cookie Policy', path: '/cookies' },
        { label: 'Return & Refund Policy', path: PATHS.REFUND_POLICY },
        { label: 'Seller Policies', path: 'https://seller.eazworld.com/seller/policies', external: true },
        { label: 'Buyer Protection Policy', path: '/buyer-protection' },
      ],
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <SitemapContainer>
      {/* Hero Section */}
      <HeroSection
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroTitle>Sitemap</HeroTitle>
        <HeroSubtitle>
          Explore all pages and resources across our platform.
        </HeroSubtitle>
      </HeroSection>

      {/* Search Bar */}
      <SearchSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SearchLabel htmlFor="sitemap-search">
          Find a page
        </SearchLabel>
        <SearchInput
          id="sitemap-search"
          type="text"
          placeholder="Search for a page..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchSection>

      {/* Sitemap Sections Grid */}
      <SectionsGrid
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sitemapSections.map((section) => (
          <SitemapSection
            key={section.id}
            variants={sectionVariants}
          >
            <SectionHeader>{section.title}</SectionHeader>
            <LinksList>
              {section.links.map((link, index) => (
                <LinkItem key={index}>
                  {link.external ? (
                    <SitemapLink
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </SitemapLink>
                  ) : (
                    <SitemapLink as={Link} to={link.path}>
                      {link.label}
                    </SitemapLink>
                  )}
                </LinkItem>
              ))}
            </LinksList>
          </SitemapSection>
        ))}
      </SectionsGrid>

      {/* Footer CTA */}
      <FooterCTA
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <CTATitle>Still can't find a page?</CTATitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            $variant="primary"
          >
            <FaHeadset style={{ marginRight: 'var(--spacing-xs)' }} />
            Contact Support
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.HELP}
            $variant="secondary"
          >
            <FaBook style={{ marginRight: 'var(--spacing-xs)' }} />
            Visit Help Center
          </CTAButton>
          <CTAButton
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (window.chatWidget) {
                window.chatWidget.open();
              } else {
                alert('Chat support will be available soon.');
              }
            }}
            $variant="secondary"
          >
            <FaComments style={{ marginRight: 'var(--spacing-xs)' }} />
            Open Chat
          </CTAButton>
        </CTAButtons>
      </FooterCTA>
    </SitemapContainer>
  );
};

export default SitemapPage;

