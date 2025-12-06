import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaSearch, FaShoppingBag } from 'react-icons/fa';
import { PATHS } from '../routes/routePaths';
import Container from '../shared/components/Container';
import useDynamicPageTitle from '../shared/hooks/useDynamicPageTitle';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-grey-50) 0%, var(--color-white-0) 100%);
  padding: 2rem;
`;

const NotFoundContent = styled(motion.div)`
  max-width: 600px;
  text-align: center;
  background: var(--color-white-0);
  padding: 3rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
`;

const NotFoundIcon = styled.div`
  font-size: 8rem;
  margin-bottom: 1.5rem;
  line-height: 1;
`;

const NotFoundTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: 1rem;
  font-family: var(--font-heading);
`;

const NotFoundMessage = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-md);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: var(--color-white-0);
  color: var(--color-grey-800);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary-500);
    color: var(--color-primary-500);
    background: var(--color-grey-50);
  }
`;

const QuickLinks = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-grey-200);
`;

const QuickLinksTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  margin-bottom: 1rem;
`;

const QuickLinksList = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const QuickLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--color-grey-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);

  &:hover {
    color: var(--color-primary-500);
    background: var(--color-grey-50);
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  useDynamicPageTitle({
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
    defaultTitle: '404 - Page Not Found | EazShop',
  });

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <NotFoundContainer>
      <Container>
        <NotFoundContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NotFoundIcon>🔍</NotFoundIcon>
          <NotFoundTitle>404</NotFoundTitle>
          <NotFoundMessage>
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
          </NotFoundMessage>

          <ButtonGroup>
            <PrimaryButton to={PATHS.HOME}>
              <FaHome /> Go to Homepage
            </PrimaryButton>
            <SecondaryButton onClick={handleGoBack}>
              <FaArrowLeft /> Go Back
            </SecondaryButton>
          </ButtonGroup>

          <QuickLinks>
            <QuickLinksTitle>Quick Links</QuickLinksTitle>
            <QuickLinksList>
              <QuickLink to={PATHS.PRODUCTS}>
                <FaShoppingBag /> Shop Products
              </QuickLink>
              <QuickLink to={PATHS.CATEGORIES}>
                <FaSearch /> Browse Categories
              </QuickLink>
            </QuickLinksList>
          </QuickLinks>
        </NotFoundContent>
      </Container>
    </NotFoundContainer>
  );
};

export default NotFoundPage;

