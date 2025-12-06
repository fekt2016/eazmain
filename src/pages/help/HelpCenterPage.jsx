import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaQuestionCircle,
  FaShoppingBag,
  FaCreditCard,
  FaTruck,
  FaUserCircle,
  FaBox,
  FaUndo,
  FaShieldAlt,
  FaBook,
  FaSearch,
} from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  HelpContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  CategoriesGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryDescription,
  CategoryLink,
  SearchSection,
  SearchInput,
  SearchButton,
  QuickLinksGrid,
  QuickLinkCard,
  QuickLinkIcon,
  QuickLinkTitle,
  QuickLinkDescription,
  CTASection,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
} from './help.styles';

/**
 * Help Center Page for EazShop
 * Provides help resources, FAQs, and support information
 */
const HelpCenterPage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'Help Center - EazShop',
    description: 'Get help with your orders, account, payments, shipping, and more. Find answers to frequently asked questions.',
    defaultTitle: 'Help Center - EazShop',
    defaultDescription: 'Get help with your orders, account, payments, shipping, and more.',
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Help categories
  const helpCategories = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      description: 'Track orders, delivery issues, and order modifications',
      icon: <FaShoppingBag />,
      bgColor: 'var(--color-blue-100)',
      iconColor: 'var(--color-blue-700)',
      href: `${PATHS.HELP}/category/orders`,
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      description: 'Payment methods, refunds, and billing questions',
      icon: <FaCreditCard />,
      bgColor: 'var(--color-green-100)',
      iconColor: 'var(--color-green-700)',
      href: `${PATHS.HELP}/category/payments`,
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      description: 'Shipping options, returns, and exchanges',
      icon: <FaTruck />,
      bgColor: 'var(--color-indigo-100)',
      iconColor: 'var(--color-indigo-700)',
      href: `${PATHS.HELP}/category/shipping`,
    },
    {
      id: 'account',
      title: 'Account & Profile',
      description: 'Account management, profile updates, and security',
      icon: <FaUserCircle />,
      bgColor: 'var(--color-yellow-100)',
      iconColor: 'var(--color-yellow-700)',
      href: `${PATHS.HELP}/category/account`,
    },
    {
      id: 'products',
      title: 'Products & Care',
      description: 'Product information, care guides, and warranties',
      icon: <FaBox />,
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-700)',
      href: PATHS.PRODUCT_CARE,
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      description: 'Return process, refund policy, and exchanges',
      icon: <FaUndo />,
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-700)',
      href: PATHS.REFUND_POLICY,
    },
  ];

  // Quick links
  const quickLinks = [
    {
      title: 'Contact Support',
      description: 'Get in touch with our support team',
      icon: <FaShieldAlt />,
      href: PATHS.CONTACT,
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: <FaQuestionCircle />,
      href: PATHS.FAQ,
    },
    {
      title: 'Shipping Policy',
      description: 'Learn about our shipping options',
      icon: <FaTruck />,
      href: PATHS.SHIPPING_POLICY,
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: <FaShieldAlt />,
      href: PATHS.PRIVACY,
    },
  ];

  return (
    <HelpContainer>
      {/* SECTION 1 — HERO */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroIcon variants={fadeUp}>
            <FaBook />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>Help Center</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Find answers to your questions and get the support you need
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {/* SECTION 2 — SEARCH */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
          />
          <SearchButton>
            <FaSearch />
            Search
          </SearchButton>
        </SearchSection>
      </SectionWrapper>

      {/* SECTION 3 — HELP CATEGORIES */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <SectionTitle>Browse by Category</SectionTitle>
        <SectionDescription>
          Find help articles organized by topic
        </SectionDescription>
        <CategoriesGrid>
          {helpCategories.map((category) => (
            <CategoryCard
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <CategoryIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
              <CategoryLink
                to={category.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More →
              </CategoryLink>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </SectionWrapper>

      {/* SECTION 4 — QUICK LINKS */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Quick Links</SectionTitle>
        <SectionDescription>
          Common resources and support options
        </SectionDescription>
        <QuickLinksGrid>
          {quickLinks.map((link, index) => (
            <QuickLinkCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <QuickLinkIcon>
                {link.icon}
              </QuickLinkIcon>
              <QuickLinkTitle>{link.title}</QuickLinkTitle>
              <QuickLinkDescription>{link.description}</QuickLinkDescription>
              <CategoryLink
                to={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit →
              </CategoryLink>
            </QuickLinkCard>
          ))}
        </QuickLinksGrid>
      </SectionWrapper>

      {/* SECTION 5 — CTA */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTATitle>Still Need Help?</CTATitle>
        <CTASubtitle>
          Our support team is here to assist you 24/7
        </CTASubtitle>
        <CTAButtons>
          <CTAButton
            to={PATHS.CONTACT}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </CTAButton>
          <CTAButton
            to={PATHS.SUPPORT}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open Support Ticket
          </CTAButton>
        </CTAButtons>
      </CTASection>
    </HelpContainer>
  );
};

export default HelpCenterPage;

