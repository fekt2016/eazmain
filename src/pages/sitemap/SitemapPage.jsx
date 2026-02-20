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
 * Displays all pages and resources across the Saiisai ecosystem
 */
const SitemapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // SEO
  useDynamicPageTitle({
    title: 'Sitemap | Saiisai',
    description: 'Explore all pages and resources across the Saiisai platform ecosystem.',
    keywords: 'sitemap, pages, navigation, Saiisai, Seller, Admin',
    defaultTitle: 'Sitemap | Saiisai',
    defaultDescription: 'Explore all pages and resources across the Saiisai platform ecosystem.',
  });

  // Sitemap sections data
  const sitemapSections = [
    {
      id: 'saiisai',
      title: 'Saiisai (Buyer App)',
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
      id: 'saiisaiseller',
      title: 'Saiisai Seller (Seller Portal)',
      links: [
        { label: 'Dashboard', path: 'https://seller.saiisai.com/dashboard', external: true },
        { label: 'Products', path: 'https://seller.saiisai.com/products', external: true },
        { label: 'Create Product', path: 'https://seller.saiisai.com/products/add', external: true },
        { label: 'Orders', path: 'https://seller.saiisai.com/orders', external: true },
        { label: 'Payouts', path: 'https://seller.saiisai.com/finance/payouts', external: true },
        { label: 'Withdrawals', path: 'https://seller.saiisai.com/finance/withdrawals', external: true },
        { label: 'Reviews', path: 'https://seller.saiisai.com/reviews', external: true },
        { label: 'Store Setup', path: 'https://seller.saiisai.com/store/settings', external: true },
        { label: 'Settings', path: 'https://seller.saiisai.com/settings', external: true },
        { label: 'Support Center', path: 'https://seller.saiisai.com/support', external: true },
        { label: 'Policies', path: 'https://seller.saiisai.com/seller/policies', external: true },
      ],
    },
    {
      id: 'saiisaiadmin',
      title: 'Saiisai Admin (Admin Portal)',
      links: [
        { label: 'Admin Dashboard', path: 'https://admin.saiisai.com/dashboard', external: true },
        { label: 'Manage Sellers', path: 'https://admin.saiisai.com/sellers', external: true },
        { label: 'Manage Products', path: 'https://admin.saiisai.com/products', external: true },
        { label: 'Orders Panel', path: 'https://admin.saiisai.com/orders', external: true },
        { label: 'Payments & Wallet', path: 'https://admin.saiisai.com/payment-request', external: true },
        { label: 'Withdrawals', path: 'https://admin.saiisai.com/balance-history', external: true },
        { label: 'User Reports', path: 'https://admin.saiisai.com/users', external: true },
        { label: 'Activity Logs', path: 'https://admin.saiisai.com/activity-logs', external: true },
        { label: 'System Settings', path: 'https://admin.saiisai.com/platform-settings', external: true },
        { label: 'Support / Internal Tools', path: 'https://admin.saiisai.com/support', external: true },
      ],
    },
    {
      id: 'saiisaicompany',
      title: 'Saiisai (Company Website)',
      links: [
        { label: 'Home', path: 'https://saiisai.com', external: true },
        { label: 'Services', path: 'https://saiisai.com/services', external: true },
        { label: 'Pricing', path: 'https://saiisai.com/pricing', external: true },
        { label: 'Portfolio', path: 'https://saiisai.com/portfolio', external: true },
        { label: 'Hosting Plans', path: 'https://saiisai.com/hosting', external: true },
        { label: 'Domain Search', path: 'https://saiisai.com/domains', external: true },
        { label: 'About Saiisai', path: 'https://saiisai.com/about', external: true },
        { label: 'Press & Media', path: 'https://saiisai.com/press', external: true },
        { label: 'Careers', path: 'https://saiisai.com/careers', external: true },
        { label: 'Contact Us', path: 'https://saiisai.com/contact', external: true },
        { label: 'Sitemap', path: PATHS.SITEMAP },
      ],
    },
    {
      id: 'legal',
      title: 'Legal & Policies',
      links: [
        { label: 'Privacy Policy', path: PATHS.PRIVACY },
        { label: 'Terms of Use', path: PATHS.TERMS },
        { label: 'VAT & Tax Policy', path: PATHS.VAT_TAX_POLICY },
        { label: 'Cookie Policy', path: '/cookies' },
        { label: 'Return & Refund Policy', path: PATHS.REFUND_POLICY },
        { label: 'Seller Policies', path: 'https://seller.saiisai.com/seller/policies', external: true },
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

