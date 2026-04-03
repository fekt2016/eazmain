import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
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
  FaChevronDown,
  FaArrowDown,
  FaCheck,
} from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  ProductCareContainer,
  BreadcrumbBar,
  BreadcrumbLink,
  BreadcrumbSep,
  HeroSection,
  HeroInner,
  HeroBadge,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroPrimaryButton,
  HeroSecondaryLink,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
  SectionDivider,
  SectionWrapper,
  SectionIntro,
  SectionEyebrow,
  SectionTitle,
  SectionDescription,
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryDescription,
  CategoryCardFooter,
  DetailedSectionBand,
  CareSection,
  CareSectionHeader,
  CareSectionIcon,
  CareSectionTitle,
  CareTipsList,
  CareTip,
  CareTipMark,
  CareTipText,
  FAQSection,
  FAQList,
  FAQItem,
  FAQToggle,
  FAQQuestionText,
  FAQChevronWrap,
  FAQAnswerPanel,
  FAQAnswer,
  CTASection,
  CTAInner,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
  CTAButtonOutline,
} from './productcare.styles';

const CARE_CATEGORIES = [
  {
    id: 'clothing',
    careKey: 'clothing',
    title: 'Clothing & Fashion',
    icon: <FaTshirt />,
    description: 'Washing, drying, and fabric care tips.',
    bgColor: 'var(--color-blue-100)',
    iconColor: 'var(--color-blue-700)',
  },
  {
    id: 'electronics',
    careKey: 'electronics',
    title: 'Electronics',
    icon: <FaMobileAlt />,
    description: 'Handling, cleaning, and battery care guidelines.',
    bgColor: 'var(--color-grey-100)',
    iconColor: 'var(--color-grey-700)',
  },
  {
    id: 'shoes',
    careKey: 'shoes',
    title: 'Shoes',
    icon: <FaShoePrints />,
    description: 'Proper cleaning, storage, and odor prevention.',
    bgColor: 'var(--color-primary-50)',
    iconColor: 'var(--color-primary-500)',
  },
  {
    id: 'home-kitchen',
    careKey: 'home-kitchen',
    title: 'Home & Kitchen Items',
    icon: <FaUtensils />,
    description: 'Maintenance, safety, and cleaning instructions.',
    bgColor: 'var(--color-yellow-100)',
    iconColor: 'var(--color-yellow-700)',
  },
  {
    id: 'beauty',
    careKey: 'beauty',
    title: 'Beauty & Personal Care',
    icon: <FaPumpSoap />,
    description: 'Safe usage, cleaning, and expiration details.',
    bgColor: 'var(--color-red-100)',
    iconColor: 'var(--color-red-600)',
  },
  {
    id: 'jewelry',
    careKey: 'jewelry',
    title: 'Jewelry & Accessories',
    icon: <FaGem />,
    description: 'Mild, chemical-free cleaning and proper storage.',
    bgColor: 'var(--color-indigo-100)',
    iconColor: 'var(--color-indigo-700)',
  },
];

const CARE_TIPS = {
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

const FAQS = [
  {
    question: 'What if I followed all care instructions but received a damaged item?',
    answer:
      'Contact our support team for assistance. We will help you resolve the issue and ensure you are satisfied with your purchase.',
  },
  {
    question: 'Do products come with care labels?',
    answer:
      'Most clothing and home products include care instructions. Check the product description or packaging for specific guidelines.',
  },
];

const HERO_STATS = [
  { value: '6', label: 'Care categories' },
  { value: '30+', label: 'Practical tips' },
  { value: 'Free', label: 'Always' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/**
 * Product Care — buyer-facing care and maintenance guide
 */
const ProductCarePage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useDynamicPageTitle({
    title: 'Product Care Guide • Saiisai',
    description:
      'Learn how to properly care for your clothes, electronics, home items, beauty products and more.',
    keywords: 'product care, care guide, maintenance tips, cleaning instructions, Saiisai',
    defaultTitle: 'Product Care Guide • Saiisai',
    defaultDescription:
      'Learn how to properly care for your clothes, electronics, home items, beauty products and more.',
  });

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const scrollToCategories = useCallback(() => {
    scrollToSection('care-categories');
  }, [scrollToSection]);

  const toggleFaq = useCallback((index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <ProductCareContainer>
      <BreadcrumbBar aria-label="Breadcrumb">
        <BreadcrumbLink>
          <Link to={PATHS.HOME}>Home</Link>
        </BreadcrumbLink>
        <BreadcrumbSep aria-hidden>/</BreadcrumbSep>
        <BreadcrumbLink>
          <Link to={PATHS.HELP}>Help</Link>
        </BreadcrumbLink>
        <BreadcrumbSep aria-hidden>/</BreadcrumbSep>
        <span style={{ color: 'var(--color-grey-900)', fontWeight: 600 }}>Product care</span>
      </BreadcrumbBar>

      <HeroSection initial="hidden" animate="visible" variants={fadeUp}>
        <HeroInner>
          <HeroBadge>Guides</HeroBadge>
          <HeroIcon variants={fadeUp}>
            <FaLeaf aria-hidden />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>Product Care Guide</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Practical tips to clean, maintain, and extend the life of everything you buy on Saiisai.
          </HeroSubtitle>
          <HeroActions variants={fadeUp}>
            <HeroPrimaryButton
              type="button"
              onClick={scrollToCategories}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaArrowDown aria-hidden />
              Browse categories
            </HeroPrimaryButton>
            <HeroSecondaryLink
              as={Link}
              to={PATHS.HELP}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaBook aria-hidden />
              Help center
            </HeroSecondaryLink>
          </HeroActions>
          <HeroStats variants={fadeUp}>
            {HERO_STATS.map((row) => (
              <HeroStat key={row.label}>
                <HeroStatValue>{row.value}</HeroStatValue>
                <HeroStatLabel>{row.label}</HeroStatLabel>
              </HeroStat>
            ))}
          </HeroStats>
        </HeroInner>
      </HeroSection>

      <SectionDivider />

      <SectionWrapper
        id="care-categories"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <SectionIntro>
          <SectionEyebrow>Start here</SectionEyebrow>
          <SectionTitle>Care categories</SectionTitle>
          <SectionDescription>
            Jump to a category for focused tips, or scroll through the full guide below.
          </SectionDescription>
        </SectionIntro>
        <CategoryGrid>
          {CARE_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              type="button"
              variants={staggerItem}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => scrollToSection(category.id)}
            >
              <CategoryIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryDescription>{category.description}</CategoryDescription>
              <CategoryCardFooter>
                View tips <FaChevronDown aria-hidden />
              </CategoryCardFooter>
            </CategoryCard>
          ))}
        </CategoryGrid>
      </SectionWrapper>

      <DetailedSectionBand>
        <SectionWrapper
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <SectionIntro>
            <SectionEyebrow>Deep dive</SectionEyebrow>
            <SectionTitle>Detailed care instructions</SectionTitle>
            <SectionDescription>
              Follow these guidelines to keep products looking and working their best.
            </SectionDescription>
          </SectionIntro>

          {CARE_CATEGORIES.map((category) => (
            <CareSection
              key={category.id}
              id={category.id}
              variants={staggerItem}
            >
              <CareSectionHeader>
                <CareSectionIcon $bgColor={category.bgColor} $iconColor={category.iconColor}>
                  {category.icon}
                </CareSectionIcon>
                <CareSectionTitle>{category.title}</CareSectionTitle>
              </CareSectionHeader>
              <CareTipsList>
                {CARE_TIPS[category.careKey].map((tip) => (
                  <CareTip key={tip}>
                    <CareTipMark aria-hidden>
                      <FaCheck size={10} />
                    </CareTipMark>
                    <CareTipText>{tip}</CareTipText>
                  </CareTip>
                ))}
              </CareTipsList>
            </CareSection>
          ))}
        </SectionWrapper>
      </DetailedSectionBand>

      <FAQSection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionIntro>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionTitle>Common questions</SectionTitle>
          <SectionDescription>Quick answers about care instructions and product quality.</SectionDescription>
        </SectionIntro>
        <FAQList>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <FAQItem key={faq.question} variants={staggerItem}>
                <FAQToggle
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`product-care-faq-${index}`}
                  id={`product-care-faq-trigger-${index}`}
                >
                  <FAQQuestionText>{faq.question}</FAQQuestionText>
                  <FAQChevronWrap $open={isOpen} aria-hidden>
                    <FaChevronDown />
                  </FAQChevronWrap>
                </FAQToggle>
                {isOpen && (
                  <FAQAnswerPanel id={`product-care-faq-${index}`} role="region" aria-labelledby={`product-care-faq-trigger-${index}`}>
                    <FAQAnswer>{faq.answer}</FAQAnswer>
                  </FAQAnswerPanel>
                )}
              </FAQItem>
            );
          })}
        </FAQList>
      </FAQSection>

      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={fadeUp}
      >
        <CTAInner>
          <CTATitle>Need more help?</CTATitle>
          <CTASubtitle>
            Our team can answer questions about product care, orders, and returns whenever you need us.
          </CTASubtitle>
          <CTAButtons>
            <CTAButton
              as={Link}
              to={PATHS.HELP}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaBook aria-hidden />
              Visit help center
            </CTAButton>
            <CTAButtonOutline
              as={Link}
              to={PATHS.SUPPORT}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaHeadset aria-hidden />
              Contact support
            </CTAButtonOutline>
            <CTAButtonOutline
              as={Link}
              to={PATHS.REFUND_POLICY}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaFileContract aria-hidden />
              Return &amp; refund policy
            </CTAButtonOutline>
          </CTAButtons>
        </CTAInner>
      </CTASection>
    </ProductCareContainer>
  );
};

export default ProductCarePage;
