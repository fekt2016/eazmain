import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaLeaf,
  FaTshirt,
  FaMobileAlt,
  FaShoePrints,
  FaUtensils,
  FaPumpSoap,
  FaGem,
  FaHeadset,
  FaBook,
  FaFileContract,
} from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  ProductCareContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryDescription,
  CareSection,
  CareSectionHeader,
  CareSectionIcon,
  CareSectionTitle,
  CareTipsList,
  CareTip,
  CareTipText,
  FAQSection,
  FAQList,
  FAQItem,
  FAQQuestion,
  FAQAnswer,
  CTASection,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
} from './productcare.styles';

/**
 * Product Care Page
 * Educational guide for product care and maintenance
 */
const ProductCarePage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'Product Care Guide • EazShop',
    description: 'Learn how to properly care for your clothes, electronics, home items, beauty products and more.',
    keywords: 'product care, care guide, maintenance tips, cleaning instructions, EazShop',
    defaultTitle: 'Product Care Guide • EazShop',
    defaultDescription: 'Learn how to properly care for your clothes, electronics, home items, beauty products and more.',
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

  // Category data
  const categories = [
    {
      id: 'clothing',
      title: 'Clothing & Fashion',
      icon: <FaTshirt />,
      description: 'Washing, drying, and fabric care tips.',
      bgColor: 'var(--color-blue-100)',
      iconColor: 'var(--color-blue-700)',
    },
    {
      id: 'electronics',
      title: 'Electronics',
      icon: <FaMobileAlt />,
      description: 'Handling, cleaning, and battery care guidelines.',
      bgColor: 'var(--color-grey-100)',
      iconColor: 'var(--color-grey-700)',
    },
    {
      id: 'shoes',
      title: 'Shoes',
      icon: <FaShoePrints />,
      description: 'Proper cleaning, storage, and odor prevention.',
      bgColor: 'var(--color-primary-50)',
      iconColor: 'var(--color-primary-500)',
    },
    {
      id: 'home-kitchen',
      title: 'Home & Kitchen Items',
      icon: <FaUtensils />,
      description: 'Maintenance, safety, and cleaning instructions.',
      bgColor: 'var(--color-yellow-100)',
      iconColor: 'var(--color-yellow-700)',
    },
    {
      id: 'beauty',
      title: 'Beauty & Personal Care',
      icon: <FaPumpSoap />,
      description: 'Safe usage, cleaning, and expiration details.',
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-600)',
    },
    {
      id: 'jewelry',
      title: 'Jewelry & Accessories',
      icon: <FaGem />,
      description: 'Mining free cleaning and proper storage.',
      bgColor: 'var(--color-indigo-100)',
      iconColor: 'var(--color-indigo-700)',
    },
  ];

  // Care tips data
  const careTips = {
    clothing: [
      'Always wash clothes according to the care label.',
      'Sort colors to avoid dye transfer.',
      'Wash delicate fabrics in cold water.',
      'Avoid excessive heat when drying.',
      'Steam or iron using proper fabric settings.',
      'Store items in a cool, dry place.',
      'Avoid prolonged sunlight exposure.',
    ],
    electronics: [
      'Keep devices away from moisture and heat.',
      'Clean screens with microfiber cloths.',
      'Avoid overcharging batteries.',
      'Use protective cases.',
      'Unplug devices during lightning storms.',
      'Do not use third-party unsafe chargers.',
    ],
    shoes: [
      'Air-dry shoes; avoid high heat.',
      'Clean soles with mild soap.',
      'Stuff shoes with paper to maintain their shape.',
      'Use waterproof spray (if applicable).',
      'Store shoes in breathable bags or boxes.',
    ],
    'home-kitchen': [
      'Handwash wooden utensils.',
      'Avoid metal scrubbers on coated pans.',
      'Store knives safely in blocks or magnetic strips.',
      'Disinfect kitchen surfaces regularly.',
    ],
    beauty: [
      'Keep products sealed after use.',
      'Store beauty items away from heat.',
      'Do not share personal care tools.',
      'Discard expired skincare and makeup.',
      'Clean tools and brushes regularly.',
    ],
    jewelry: [
      'Avoid exposure to perfumes and chemicals.',
      'Clean with a gentle cloth.',
      'Store in anti-tarnish bags.',
      'Keep items separated to avoid scratches.',
    ],
  };

  // FAQ data
  const faqs = [
    {
      question: 'What if I followed all care instructions but received a damaged item?',
      answer: 'Contact our support team for assistance. We\'ll help you resolve the issue and ensure you\'re satisfied with your purchase.',
    },
    {
      question: 'Do products come with care labels?',
      answer: 'Most clothing and home products include care instructions. Check the product description or packaging for specific care guidelines.',
    },
  ];

  // Scroll to section handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ProductCareContainer>
      {/* Hero Section */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroIcon variants={fadeUp}>
            <FaLeaf />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>Product Care Guide</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Helpful tips on how to clean, maintain, and extend the life of your purchases.
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {/* Category Grid */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Care Categories</SectionTitle>
        <SectionDescription>
          Select a category to learn more about proper care and maintenance
        </SectionDescription>
        <CategoryGrid>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              onClick={() => scrollToSection(category.id)}
            >
              <CategoryIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
            </CategoryCard>
          ))}
        </CategoryGrid>
      </SectionWrapper>

      {/* Detailed Care Sections */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Detailed Care Instructions</SectionTitle>
        <SectionDescription>
          Comprehensive guides for maintaining your products
        </SectionDescription>

        {/* Clothing & Fashion */}
        <CareSection
          id="clothing"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-blue-100)" $iconColor="var(--color-blue-700)">
              <FaTshirt />
            </CareSectionIcon>
            <CareSectionTitle>Clothing & Fashion</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips.clothing.map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>

        {/* Electronics */}
        <CareSection
          id="electronics"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-grey-100)" $iconColor="var(--color-grey-700)">
              <FaMobileAlt />
            </CareSectionIcon>
            <CareSectionTitle>Electronics</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips.electronics.map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>

        {/* Shoes */}
        <CareSection
          id="shoes"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-primary-50)" $iconColor="var(--color-primary-500)">
              <FaShoePrints />
            </CareSectionIcon>
            <CareSectionTitle>Shoes</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips.shoes.map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>

        {/* Home & Kitchen Items */}
        <CareSection
          id="home-kitchen"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-yellow-100)" $iconColor="var(--color-yellow-700)">
              <FaUtensils />
            </CareSectionIcon>
            <CareSectionTitle>Home & Kitchen Items</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips['home-kitchen'].map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>

        {/* Beauty & Personal Care */}
        <CareSection
          id="beauty"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-red-100)" $iconColor="var(--color-red-600)">
              <FaPumpSoap />
            </CareSectionIcon>
            <CareSectionTitle>Beauty & Personal Care</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips.beauty.map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>

        {/* Jewelry & Accessories */}
        <CareSection
          id="jewelry"
          variants={staggerItem}
          $bgColor="var(--color-white-0)"
        >
          <CareSectionHeader>
            <CareSectionIcon $bgColor="var(--color-indigo-100)" $iconColor="var(--color-indigo-700)">
              <FaGem />
            </CareSectionIcon>
            <CareSectionTitle>Jewelry & Accessories</CareSectionTitle>
          </CareSectionHeader>
          <CareTipsList>
            {careTips.jewelry.map((tip, index) => (
              <CareTip key={index}>
                <CareTipText>{tip}</CareTipText>
              </CareTip>
            ))}
          </CareTipsList>
        </CareSection>
      </SectionWrapper>

      {/* FAQ Section */}
      <FAQSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <FAQList>
          {faqs.map((faq, index) => (
            <FAQItem key={index} variants={staggerItem}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQItem>
          ))}
        </FAQList>
      </FAQSection>

      {/* CTA Section */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTATitle>Need More Help?</CTATitle>
        <CTASubtitle>
          Our support team is here to assist you with any questions about product care or your orders.
        </CTASubtitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to="/help-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBook />
            Visit Help Center
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeadset />
            Contact Support
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.REFUND_POLICY}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFileContract />
            Return & Refund Policy
          </CTAButton>
        </CTAButtons>
      </CTASection>
    </ProductCareContainer>
  );
};

export default ProductCarePage;

