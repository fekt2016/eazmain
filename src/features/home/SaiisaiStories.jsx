import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/routePaths';

const StoriesSection = styled.section`
  padding: var(--spacing-4xl) 0;
  background: var(--color-white-0);
`;

const Container = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl);
`;

const Title = styled.h2`
  font-size: 3.2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

const Subtitle = styled.p`
  font-size: 1.8rem;
  color: var(--color-grey-600);
  max-width: 70rem;
  margin: 0 auto;
`;

const StoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);
`;

const StoryCard = styled(motion.div)`
  background: var(--color-grey-50);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-grey-100);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--color-primary-500);
  }
`;

const QuoteIcon = styled.div`
  color: var(--color-primary-200);
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
`;

const StoryContent = styled.p`
  font-size: 1.6rem;
  line-height: 1.6;
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-xl);
  font-style: italic;
  flex: 1;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const AuthorImage = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--color-grey-200);
  background-size: cover;
  background-position: center;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  font-size: 1.6rem;
  color: var(--color-grey-900);
`;

const AuthorRole = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ViewMoreLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--color-primary-700);
    gap: var(--spacing-md);
  }
`;

const SaiisaiStories = () => {
    const stories = [
        {
            id: 1,
            content: "Switching my business to Saiisai was the best decision I made in 2024. The seller tools are intuitive, and I've seen a 40% growth in my monthly sales within just three months.",
            author: "Kwame Antwi",
            role: "Electronics Merchant",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 2,
            content: "I love the transparency on Saiisai. As a shopper, I always know what I'm getting, and the delivery is incredibly fast. It's truly Ghana's premium shopping experience.",
            author: "Ama Serwaa",
            role: "Verified Tech Buyer",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 3,
            content: "The support I get from the Saiisai team is unmatched. They really care about the growth of local businesses, and their platform is top-notch.",
            author: "David Osei",
            role: "Home Decor Boutique Owner",
            image: "https://randomuser.me/api/portraits/men/85.jpg"
        }
    ];

    return (
        <StoriesSection>
            <Container>
                <SectionHeader>
                    <Title>Saiisai Stories</Title>
                    <Subtitle>
                        Join thousands of satisfied customers and successful sellers who are building the future with us.
                    </Subtitle>
                </SectionHeader>

                <StoriesGrid>
                    {stories.map((story) => (
                        <StoryCard
                            key={story.id}
                            whileHover={{ y: -8 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: story.id * 0.1 }}
                        >
                            <QuoteIcon>
                                <FaQuoteLeft />
                            </QuoteIcon>
                            <StoryContent>"{story.content}"</StoryContent>
                            <AuthorInfo>
                                <AuthorImage style={{ backgroundImage: `url(${story.image})` }} />
                                <AuthorDetails>
                                    <AuthorName>{story.author}</AuthorName>
                                    <AuthorRole>{story.role}</AuthorRole>
                                </AuthorDetails>
                            </AuthorInfo>
                        </StoryCard>
                    ))}
                </StoriesGrid>

                <ViewMoreLink to={PATHS.ABOUT}>
                    Learn more about our mission <FaArrowRight />
                </ViewMoreLink>
            </Container>
        </StoriesSection>
    );
};

export default SaiisaiStories;
