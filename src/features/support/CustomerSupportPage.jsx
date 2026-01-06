import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaHeadset,
  FaShoppingBag,
  FaCreditCard,
  FaTruck,
  FaUndo,
  FaUserCircle,
  FaBook,
  FaFileContract,
  FaGraduationCap,
  FaComments,
  FaTicketAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaShieldAlt,
  FaShippingFast,
  FaExchangeAlt,
  FaLock,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '../../routes/routePaths';
import {
  SupportContainer,
  SupportSidebar,
  SidebarTitle,
  SidebarSection,
  SidebarSectionTitle,
  SidebarNavList,
  SidebarNavItem,
  SidebarNavLink,
  SupportMainContent,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtext,
  GridContainer,
  SupportCard,
  CardIcon,
  CardTitle,
  CardDescription,
  CardButton,
  QuickLinksSection,
  SectionTitle,
  LinksGrid,
  QuickLink,
} from './support.styles';
import ContactFormModal from './ContactFormModal';

/**
 * Customer Support Center Page
 * Modern support page for customers with categories, contact form, and quick links
 */
const CustomerSupportPage = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Determine active section based on hash or default
  const activeSection = location.hash.replace('#', '') || 'overview';

  // Customer support categories
  const supportCategories = [
    {
      id: 'orders',
      title: 'Order & Delivery Issues',
      description:
        'Track your orders, report delivery problems, request order modifications, or get help with shipping questions.',
      icon: <FaShoppingBag />,
      department: 'Orders & Delivery',
      iconColor: '#ffc400',
      bgColor: '#FFF9E6',
    },
    {
      id: 'payments',
      title: 'Payment & Billing',
      description:
        'Get assistance with payment methods, refunds, billing questions, payment failures, and transaction issues.',
      icon: <FaCreditCard />,
      department: 'Payments & Billing',
      iconColor: '#0078cc',
      bgColor: '#E6F0FF',
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      description:
        'Help with shipping options, return requests, exchange processes, and delivery address changes.',
      icon: <FaTruck />,
      department: 'Shipping & Returns',
      iconColor: '#00C896',
      bgColor: '#E6F7F3',
    },
    {
      id: 'account',
      title: 'Account & Profile',
      description:
        'Support for account management, profile updates, password resets, security settings, and account verification.',
      icon: <FaUserCircle />,
      department: 'Account & Profile',
      iconColor: '#9C27B0',
      bgColor: '#F3E5F5',
    },
  ];

  // Quick help links
  const quickLinks = [
    {
      title: 'Help Center',
      path: '/help',
      icon: <FaBook />,
    },
    {
      title: 'Terms & Policies',
      path: '/terms',
      icon: <FaFileContract />,
    },
    {
      title: 'Shopping Guides',
      path: '/tutorials',
      icon: <FaGraduationCap />,
    },
  ];

  // Sidebar navigation items
  const sidebarNavItems = {
    support: [
      {
        id: 'overview',
        title: 'Support Overview',
        icon: <FaHeadset />,
        href: '#overview',
      },
      {
        id: 'tickets',
        title: 'My Tickets',
        icon: <FaTicketAlt />,
        href: PATHS.SUPPORT_TICKETS,
        isLink: true,
      },
      {
        id: 'contact',
        title: 'Contact Support',
        icon: <FaEnvelope />,
        href: '#contact',
        onClick: () => handleOpenModal(),
      },
    ],
    helpTopics: [
      {
        id: 'orders',
        title: 'Orders & Delivery',
        icon: <FaShoppingBag />,
        href: '#orders',
        onClick: () => handleOpenModal('Orders & Delivery'),
      },
      {
        id: 'payments',
        title: 'Payments & Billing',
        icon: <FaCreditCard />,
        href: '#payments',
        onClick: () => handleOpenModal('Payments & Billing'),
      },
      {
        id: 'shipping',
        title: 'Shipping & Returns',
        icon: <FaTruck />,
        href: '#shipping',
        onClick: () => handleOpenModal('Shipping & Returns'),
      },
      {
        id: 'account',
        title: 'Account & Profile',
        icon: <FaUserCircle />,
        href: '#account',
        onClick: () => handleOpenModal('Account & Profile'),
      },
    ],
    resources: [
      {
        id: 'help-center',
        title: 'Help Center',
        icon: <FaBook />,
        href: '/help',
      },
      {
        id: 'faq',
        title: 'FAQ',
        icon: <FaQuestionCircle />,
        href: '/faq',
      },
      {
        id: 'policies',
        title: 'Policies',
        icon: <FaFileContract />,
        href: '/terms',
      },
      {
        id: 'product-care',
        title: 'Product Care',
        icon: <FaInfoCircle />,
        href: PATHS.PRODUCT_CARE,
      },
      {
        id: 'refund-policy',
        title: 'Return & Refund',
        icon: <FaUndo />,
        href: PATHS.REFUND_POLICY,
      },
      {
        id: 'security',
        title: 'Security & Privacy',
        icon: <FaShieldAlt />,
        href: '/privacy',
      },
    ],
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenModal = (department = null) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };


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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <SupportContainer>
      {/* Sidebar */}
      <SupportSidebar
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SidebarTitle>Support Center</SidebarTitle>
        
        {/* Support Section */}
        <SidebarSection>
          <SidebarSectionTitle>Support</SidebarSectionTitle>
          <SidebarNavList>
            {sidebarNavItems.support.map((item) => (
              <SidebarNavItem key={item.id}>
                {item.isLink ? (
                  <SidebarNavLink
                    as={Link}
                    to={item.href}
                    className={location.pathname === item.href ? 'active' : ''}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarNavLink>
                ) : (
                  <SidebarNavLink
                    href={item.href}
                    className={activeSection === item.id ? 'active' : ''}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      } else if (item.href.startsWith('#')) {
                        e.preventDefault();
                        scrollToSection(item.href.replace('#', ''));
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarNavLink>
                )}
              </SidebarNavItem>
            ))}
          </SidebarNavList>
        </SidebarSection>

        {/* Help Topics Section */}
        <SidebarSection>
          <SidebarSectionTitle>Help Topics</SidebarSectionTitle>
          <SidebarNavList>
            {sidebarNavItems.helpTopics.map((item) => (
              <SidebarNavItem key={item.id}>
                <SidebarNavLink
                  href={item.href}
                  className={activeSection === item.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      scrollToSection(item.href.replace('#', ''));
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarNavLink>
              </SidebarNavItem>
            ))}
          </SidebarNavList>
        </SidebarSection>

        {/* Resources Section */}
        <SidebarSection>
          <SidebarSectionTitle>Resources</SidebarSectionTitle>
          <SidebarNavList>
            {sidebarNavItems.resources.map((item) => (
              <SidebarNavItem key={item.id}>
                <SidebarNavLink
                  as={Link}
                  to={item.href}
                  className={location.pathname === item.href ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarNavLink>
              </SidebarNavItem>
            ))}
          </SidebarNavList>
        </SidebarSection>
      </SupportSidebar>

      {/* Main Content */}
      <SupportMainContent>
        {/* Hero Section */}
        <HeroSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        $primaryColor="#ffc400"
        $secondaryColor="#e29800"
      >
        <HeroContent>
          <HeroIcon>
            <FaHeadset />
          </HeroIcon>
          <HeroTitle>We're Here to Help You</HeroTitle>
          <HeroSubtext>
            Get support with your orders, payments, shipping, and account questions.
            Our customer service team is ready to assist you 24/7.
          </HeroSubtext>
        </HeroContent>
      </HeroSection>

      {/* Support Categories Grid */}
      <motion.div
        id="overview"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SectionTitle>How Can We Help You?</SectionTitle>
        <GridContainer>
          {supportCategories.map((category) => (
            <SupportCard
              key={category.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              $accentColor={category.iconColor}
            >
              <CardIcon
                $bgColor={category.bgColor}
                $iconColor={category.iconColor}
              >
                {category.icon}
              </CardIcon>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
              <CardButton
                onClick={() => handleOpenModal(category.department)}
                $bgColor={category.iconColor}
                $hoverColor={category.iconColor}
                style={{ opacity: 0.9 }}
              >
                Open Ticket
              </CardButton>
            </SupportCard>
          ))}
        </GridContainer>
      </motion.div>

      {/* Quick Help Links */}
      <QuickLinksSection id="resources">
        <SectionTitle>Quick Help Resources</SectionTitle>
        <LinksGrid>
          {quickLinks.map((link, index) => (
            <QuickLink
              key={index}
              as={Link}
              to={link.path}
              $accentColor="#ffc400"
            >
              {link.icon}
              <span>{link.title}</span>
            </QuickLink>
          ))}
        </LinksGrid>
      </QuickLinksSection>

      {/* View Tickets Section */}
      <motion.section
        id="tickets"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <SectionTitle>My Support Tickets</SectionTitle>
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
          <p style={{ color: 'var(--color-grey-600)', marginBottom: 'var(--spacing-md)' }}>
            View and manage all your support tickets
          </p>
          <CardButton
            as={Link}
            to={PATHS.SUPPORT_TICKETS}
            $bgColor="#ffc400"
            $hoverColor="#e29800"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaTicketAlt />
            View My Tickets
          </CardButton>
        </div>
      </motion.section>


        {/* Contact Form Modal */}
        <ContactFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          preselectedDepartment={selectedDepartment}
          role="buyer"
          departments={[
            'Orders & Delivery',
            'Payments & Billing',
            'Shipping & Returns',
            'Account & Profile',
          ]}
          primaryColor="#ffc400"
        />
      </SupportMainContent>
    </SupportContainer>
  );
};

export default CustomerSupportPage;

