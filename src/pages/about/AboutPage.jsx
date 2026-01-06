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
 * Premium About Us Page for Saysay
 * Modern, polished design inspired by Shopify, Stripe, Notion, and Airbnb
 */
const AboutPage = () => {
  // SEO
  useDynamicPageTitle({
    title: 'About Us • EazWorld',
    description: 'Learn more about EazWorld, our mission, vision, and story. Building the future of e-commerce, logistics, and technology for Africa and the world.',
    keywords: 'Saysay, about us, company story, mission, vision, e-commerce, marketplace, Africa',
    defaultTitle: 'About Us • EazWorld',
    defaultDescription: 'Learn more about EazWorld, our mission, vision, and story.',
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
      title: 'EazWorld Founded',
      description: 'EazWorld was established with a vision to revolutionize digital commerce and technology services in Africa.',
    },
    {
      year: '2024',
      title: 'Saysay Marketplace Launched',
      description: 'We launched Saysay, a comprehensive online marketplace connecting buyers and sellers across Ghana and beyond.',
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
            <h3>EazWorld: Your Complete Digital Ecosystem</h3>
            <p>
              EazWorld is a multi-product technology company dedicated to empowering businesses
              and individuals across Africa through innovative digital solutions. We've built a
              comprehensive ecosystem that addresses the diverse needs of modern commerce and services.
            </p>
            <ul>
              <li>
                <strong>Saysay</strong> — A leading online marketplace connecting buyers and sellers
                with secure transactions, fast delivery, and exceptional customer service.
              </li>
              <li>
                <strong>Seller Portal</strong> — A powerful seller dashboard that helps merchants manage
                products, orders, finances, and grow their online business.
              </li>
              <li>
                <strong>EazAdmin</strong> — An advanced admin portal for managing operations, users,
                payments, and the entire platform ecosystem.
              </li>
              <li>
                <strong>BenzFlex</strong> — A modern car rental and mobility service platform for
                businesses and individuals.
              </li>
              <li>
                <strong>Additional Services</strong> — We also provide domain registration, web hosting,
                and logistics solutions to support your digital journey.
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
              background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-brand-50) 100%)',
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
              To empower businesses and customers with fast, reliable, and transparent technology
              systems that enhance commerce and daily services. We strive to make digital solutions
              accessible, affordable, and impactful for everyone.
            </p>
          </MissionCard>
          <MissionCard variants={staggerItem}>
            <h3>Our Vision</h3>
            <p>
              To become the leading digital ecosystem in Africa, connecting buyers, sellers, and
              businesses through innovation and automation. We envision a future where technology
              seamlessly integrates into every aspect of commerce and daily life.
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
          The passionate individuals behind EazWorld's success.
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
        <CTATitle>Join the EazWorld Ecosystem</CTATitle>
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
