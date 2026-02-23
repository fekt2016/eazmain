import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaNewspaper } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';

const PageContainer = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const IconWrap = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--color-grey-600);
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary-500);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: var(--color-primary-600);
    color: #fff;
  }
`;

/**
 * Blog page for Saiisai – placeholder until blog content is ready.
 */
const BlogPage = () => {
  useDynamicPageTitle({
    title: 'Blog - Saiisai',
    description: 'Tips, news, and updates from Saiisai – Ghana\'s leading online marketplace.',
    keywords: 'blog, news, tips, Saiisai',
    defaultTitle: 'Blog - Saiisai',
    defaultDescription: 'Tips, news, and updates from Saiisai.',
  });

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <IconWrap>
          <FaNewspaper />
        </IconWrap>
        <Title>Blog</Title>
        <Subtitle>
          We're preparing stories, tips, and updates for you. Check back soon or explore the rest of Saiisai.
        </Subtitle>
        <HomeLink to={PATHS.HOME}>Back to Home</HomeLink>
      </motion.div>
    </PageContainer>
  );
};

export default BlogPage;
