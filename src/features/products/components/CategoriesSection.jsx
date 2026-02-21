import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/routePaths';
import { FaArrowRight } from 'react-icons/fa';

const SectionWrapper = styled.section`
  padding: 4rem 1rem; /* py-16 */
  background: white;
  font-family: 'Inter', sans-serif;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem; /* H2 */
  font-weight: 700;
  color: #0f172a; /* gray-900 */
  margin: 0;
`;

const SectionLink = styled(Link)`
  color: #1e293b; /* Secondary */
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffc400; /* Primary */
    gap: 12px;
  }
`;

/* 6-column responsive grid */
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem; /* gap-6 */
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryBg = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  /* Dark overall overlay for text contrast */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.1) 100%);
  }
`;

const CategoryContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem;
  color: white;
  z-index: 2;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }
  
  span {
    font-size: 0.875rem; /* Caption */
    color: #ffc400; /* Primary golden yellow */
    font-weight: 600;
  }
`;

const CategoryCard = styled(Link)`
  position: relative;
  aspect-ratio: 1 / 1.1;
  border-radius: 12px; /* rounded-xl */
  overflow: hidden;
  display: block;
  text-decoration: none;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
  /* Adapt old size logic to our grid gracefully */
  grid-column: ${props => props.$size === 'large' ? 'span 2' : 'span 1'};
  
  @media (max-width: 1200px) {
    grid-column: span 1;
  }

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    ${CategoryBg} {
      transform: scale(1.05);
    }
  }
`;

const CategoriesSection = ({ categories, isLoading, isError }) => {
    if (isError) {
        return (
            <SectionWrapper>
                <Container>
                    <p>Unable to load categories.</p>
                </Container>
            </SectionWrapper>
        );
    }

    if (!isLoading && (!categories || categories.length === 0)) {
        return null; /* Hide if empty, let main page handle empty states if desired, returning null is cleaner */
    }

    return (
        <SectionWrapper>
            <Container>
                <SectionHeader>
                    <SectionTitle>Shop by Category</SectionTitle>
                    <SectionLink to={PATHS.CATEGORIES}>
                        View All Categories <FaArrowRight />
                    </SectionLink>
                </SectionHeader>

                {isLoading ? (
                    <CategoryGrid>
                        {/* Simple visual placeholders matching rounded-xl */}
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ aspectRatio: '1/1.1', background: '#f1f5f9', borderRadius: '12px' }} />
                        ))}
                    </CategoryGrid>
                ) : (
                    <CategoryGrid>
                        {categories.map((cat, index) => (
                            <CategoryCard
                                key={cat.id || index}
                                $size={cat.size}
                                to={`${PATHS.CATEGORIES}/${cat.id}`}
                            >
                                <CategoryBg $image={cat.image} />
                                <CategoryContent>
                                    <h3>{cat.name}</h3>
                                    <span>{cat.count}</span>
                                </CategoryContent>
                            </CategoryCard>
                        ))}
                    </CategoryGrid>
                )}
            </Container>
        </SectionWrapper>
    );
};

export default CategoriesSection;
