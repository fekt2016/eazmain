import React from 'react';
import { motion } from 'framer-motion';
import {
  FaStore,
  FaBuilding,
  FaWarehouse,
  FaShippingFast,
  FaCreditCard,
  FaBriefcase,
} from 'react-icons/fa';
import {
  CategoriesSection,
  CategoriesContainer,
  CategoriesTitle,
  CategoriesDescription,
  CategoriesGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTitle,
  CategoryText,
  CategoryButton,
} from './partner.styles';

const categoriesData = [
  {
    icon: <FaStore />,
    title: 'Sellers & Online Stores',
    description: 'Individual sellers and online stores looking to expand their reach and sell products to millions of customers.',
    color: '#ffc400',
  },
  {
    icon: <FaBuilding />,
    title: 'Local Businesses',
    description: 'Local retailers and businesses ready to go digital and reach customers beyond their physical location.',
    color: '#0078cc',
  },
  {
    icon: <FaWarehouse />,
    title: 'Wholesale Distributors',
    description: 'Wholesale suppliers and distributors with bulk inventory looking for retail distribution channels.',
    color: '#00C896',
  },
  {
    icon: <FaShippingFast />,
    title: 'Logistics & Delivery Companies',
    description: 'Delivery and logistics companies interested in partnering to provide shipping and fulfillment services.',
    color: '#e29800',
  },
  {
    icon: <FaCreditCard />,
    title: 'Payment Providers',
    description: 'Payment service providers and financial institutions looking to integrate payment solutions.',
    color: '#10b981',
  },
  {
    icon: <FaBriefcase />,
    title: 'Agencies & Service Providers',
    description: 'Marketing agencies, consultants, and service providers offering specialized services to our partners.',
    color: '#7c3aed',
  },
];

const PartnerCategories = ({ navigate }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <CategoriesSection
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      <CategoriesContainer>
        <CategoriesTitle>Partner Categories</CategoriesTitle>
        <CategoriesDescription>
          Choose the partnership type that best fits your business
        </CategoriesDescription>
        <CategoriesGrid>
          {categoriesData.map((category, index) => (
            <CategoryCard
              key={index}
              variants={fadeUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryIcon $color={category.color}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <CategoryText>{category.description}</CategoryText>
              <CategoryButton
                onClick={() => navigate('/contact?type=partner')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply Now
              </CategoryButton>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </CategoriesContainer>
    </CategoriesSection>
  );
};

export default PartnerCategories;

