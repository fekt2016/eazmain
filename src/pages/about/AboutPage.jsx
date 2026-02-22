import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeart,
  FaBolt,
  FaUsers,
  FaShieldAlt,
  FaShoppingBag,
  FaStore,
  FaHandshake,
  FaRocket,
} from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  AboutContainer,
  HeroSection,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  OverviewGrid,
  OverviewContent,
  OverviewImage,
  MissionVisionGrid,
  MissionCard,
  ValuesGrid,
  ValueCard,
  ValueIcon,
  ValueTitle,
  ValueDescription,
  TimelineContainer,
  TimelineGrid,
  TimelineItem,
  TimelineYear,
  TimelineTitle,
  TimelineDescription,
  TeamGrid,
  TeamCard,
  TeamImage,
  TeamName,
  TeamRole,
  TeamBio,
  MetricsGrid,
  MetricCard,
  MetricNumber,
  MetricLabel,
  CTASection,
  CTATitle,
  CTASubtitle,
  CTAButtons,
  CTAButton,
} from './about.styles';

/**
 * Premium About Us Page for Saiisai
 * Modern, polished design inspired by Shopify, Stripe, Notion, and Airbnb
 */
const AboutPage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'About Us • Saiisai',
    description: 'Learn more about Saiisai, our mission, vision, and story. Building the future of e-commerce and technology in Ghana and Africa.',
    keywords: 'Saiisai, about us, company story, mission, vision, e-commerce, marketplace, Ghana, Africa',
    defaultTitle: 'About Us • Saiisai',
    defaultDescription: 'Learn more about Saiisai, our mission, vision, and story.',
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

  // Core Values Data
  const coreValues = [
    {
      icon: <FaHeart />,
      title: 'Customer First',
      description: 'We prioritize our customers\' needs and satisfaction above all else, ensuring every interaction is meaningful and valuable.',
      bgColor: 'var(--color-red-100)',
      iconColor: 'var(--color-red-700)',
    },
    {
      icon: <FaBolt />,
      title: 'Transparency',
      description: 'We believe in open communication, honest pricing, and clear processes that build trust with our community.',
      bgColor: 'var(--color-yellow-100)',
      iconColor: 'var(--color-yellow-700)',
    },
    {
      icon: <FaUsers />,
      title: 'Innovation',
      description: 'We continuously evolve our technology and services to stay ahead of market trends and deliver cutting-edge solutions.',
      bgColor: 'var(--color-blue-100)',
      iconColor: 'var(--color-blue-700)',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Reliability',
      description: 'We build robust systems and processes that our customers and partners can depend on, day in and day out.',
      bgColor: 'var(--color-green-100)',
      iconColor: 'var(--color-green-700)',
    },
  ];

  // Timeline Data
  const timelineEvents = [
    {
      year: '2023',
      title: 'Saiisai Founded',
      description: 'Saiisai was established with a vision to revolutionize digital commerce and technology services in Africa.',
    },
    {
      year: '2024',
      title: 'Saiisai Marketplace Launched',
      description: 'We launched Saiisai, a comprehensive online marketplace connecting buyers and sellers across Ghana and beyond.',
    },
    {
      year: '2024',
      title: 'Seller & Admin Portals Built',
      description: 'We developed powerful seller and admin dashboards to streamline operations and empower our partners.',
    },
    {
      year: '2024',
      title: 'BenzFlex Mobility Service Launched',
      description: 'Expanded our ecosystem with BenzFlex, a modern car rental and mobility solution for businesses and individuals.',
    },
    {
      year: '2025',
      title: 'Logistics & Hosting Expansion',
      description: 'We expanded our services to include logistics solutions and web hosting, becoming a complete digital ecosystem.',
    },
  ];

  // Team Members (placeholder - can be replaced with actual team data)
  const teamMembers = [
    {
      name: 'Leadership Team',
      role: 'Founders & Executives',
      bio: 'Our leadership team brings decades of combined experience in technology, e-commerce, and business development.',
    },
    {
      name: 'Development Team',
      role: 'Engineering & Product',
      bio: 'Our talented developers and product managers work tirelessly to build and improve our platform.',
    },
    {
      name: 'Operations Team',
      role: 'Support & Logistics',
      bio: 'Our operations team ensures smooth day-to-day operations and exceptional customer support.',
    },
  ];

  // Metrics Data
  const metrics = [
    { number: '10,000+', label: 'Orders Processed' },
    { number: '500+', label: 'Active Sellers' },
    { number: '100+', label: 'Businesses Onboarded' },
    { number: '5', label: 'Active Digital Products' },
  ];

  return (
    <AboutContainer>
      {/* SECTION 1 — HERO */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroTitle variants={fadeUp}>Our Story</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            Building the future of e-commerce, logistics, and technology for Africa and the world.
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {/* SECTION 2 — COMPANY OVERVIEW */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <SectionTitle>Who We Are</SectionTitle>
        <OverviewGrid>
          <OverviewContent>
            <h3>Saiisai: Your Complete Digital Ecosystem</h3>
            <p>
              Saiisai is a Ghanaian-born technology powerhouse, founded with the mission to solve common bottlenecks in Africa's digital landscape.
              We are not just a marketplace; we are a comprehensive ecosystem designed to bridge the gap between traditional commerce and the modern global economy.
            </p>
            <p>
              Our operations are rooted in Accra, but our vision is continental. We believe that by providing robust, transparent, and scalable tools, we can empower the next generation of African entrepreneurs and consumers.
            </p>
            <ul>
              <li>
                <strong>Saiisai Marketplace</strong> — Ghana's most trusted online destination for authentic products, featuring verified sellers and a seamless shopping experience.
              </li>
              <li>
                <strong>Powered by Technology</strong> — Our proprietary Seller and Admin portals (EazSeller & EazAdmin) provide unparalleled data insights and operational efficiency for local businesses.
              </li>
              <li>
                <strong>Integrated Mobility</strong> — Through <strong>BenzFlex</strong>, we provide modern logistics and car rental solutions, ensuring that mobility is never a barrier to business growth.
              </li>
              <li>
                <strong>Digital Infrastructure</strong> — We provide the foundation for online presence through professional web hosting and domain registration services tailored for the African market.
              </li>
            </ul>
          </OverviewContent>
          <OverviewImage
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--primary-50) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              color: 'var(--color-primary-500)',
            }}>
              <FaRocket />
            </div>
          </OverviewImage>
        </OverviewGrid>
      </SectionWrapper>

      {/* SECTION 3 — MISSION & VISION */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <MissionVisionGrid>
          <MissionCard variants={staggerItem}>
            <h3>Our Mission</h3>
            <p>
              To catalyze the growth of African businesses by providing the most reliable, transparent, and accessible digital infrastructure.
              We aim to eliminate friction in commerce, logistics, and technology services, ensuring that every Ghanaian entrepreneur has the tools they need to thrive.
            </p>
          </MissionCard>
          <MissionCard variants={staggerItem}>
            <h3>Our Vision</h3>
            <p>
              To be the primary engine of Africa's digital transformation. We envision a future where Saiisai is the first choice for every transaction,
              connecting millions across the continent through a unified, automated, and secure digital ecosystem that sets the global standard for emerging markets.
            </p>
          </MissionCard>
        </MissionVisionGrid>
      </SectionWrapper>

      {/* SECTION 4 — CORE VALUES */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Our Core Values</SectionTitle>
        <SectionDescription>
          The principles that guide everything we do and shape our culture.
        </SectionDescription>
        <ValuesGrid>
          {coreValues.map((value, index) => (
            <ValueCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <ValueIcon $bgColor={value.bgColor} $iconColor={value.iconColor}>
                {value.icon}
              </ValueIcon>
              <ValueTitle>{value.title}</ValueTitle>
              <ValueDescription>{value.description}</ValueDescription>
            </ValueCard>
          ))}
        </ValuesGrid>
      </SectionWrapper>

      {/* SECTION 5 — TIMELINE */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Our Journey</SectionTitle>
        <SectionDescription>
          A timeline of key milestones in our growth and expansion.
        </SectionDescription>
        <TimelineContainer>
          <TimelineGrid>
            {timelineEvents.map((event, index) => (
              <TimelineItem
                key={index}
                $isEven={index % 2 === 1}
                variants={staggerItem}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <TimelineYear>{event.year}</TimelineYear>
                <TimelineTitle>{event.title}</TimelineTitle>
                <TimelineDescription>{event.description}</TimelineDescription>
              </TimelineItem>
            ))}
          </TimelineGrid>
        </TimelineContainer>
      </SectionWrapper>

      {/* SECTION 6 — TEAM */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Meet Our Team</SectionTitle>
        <SectionDescription>
          The passionate individuals behind Saiisai's success.
        </SectionDescription>
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamCard
              key={index}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <TeamImage>
                {/* Placeholder for team member image */}
              </TeamImage>
              <TeamName>{member.name}</TeamName>
              <TeamRole>{member.role}</TeamRole>
              <TeamBio>{member.bio}</TeamBio>
            </TeamCard>
          ))}
        </TeamGrid>
      </SectionWrapper>

      {/* SECTION 7 — METRICS */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionTitle>Our Impact</SectionTitle>
        <SectionDescription>
          Numbers that reflect our growth and the trust our community places in us.
        </SectionDescription>
        <MetricsGrid>
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              variants={staggerItem}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <MetricNumber>{metric.number}</MetricNumber>
              <MetricLabel>{metric.label}</MetricLabel>
            </MetricCard>
          ))}
        </MetricsGrid>
      </SectionWrapper>

      {/* SECTION 8 — CTA */}
      <CTASection
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <CTATitle>Join the Saiisai Ecosystem</CTATitle>
        <CTASubtitle>
          Whether you're a buyer, seller, or business, we're here to support your growth.
        </CTASubtitle>
        <CTAButtons>
          <CTAButton
            as={Link}
            to={PATHS.HOME}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingBag />
            Start Shopping
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.SELLERS}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStore />
            Become a Seller
          </CTAButton>
          <CTAButton
            as={Link}
            to={PATHS.SUPPORT}
            $variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHandshake />
            Contact Us
          </CTAButton>
        </CTAButtons>
      </CTASection>
    </AboutContainer>
  );
};

export default AboutPage;
