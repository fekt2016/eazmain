import styled from 'styled-components';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import Container from '../../shared/components/Container';
import { usePublicTestimonials } from '../../shared/hooks/useTestimonial';

const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading } = usePublicTestimonials({
    page: 1,
    limit: 6,
  });

  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <Section>
      <Container>
        <Header>
          <Title>Seller Testimonials</Title>
          <Subtitle>
            What sellers are saying about growing their business on Saiisai.
          </Subtitle>
        </Header>

        <Grid>
          {(isLoading ? Array.from({ length: 3 }) : testimonials).map(
            (item, index) => {
              if (isLoading) {
                return <SkeletonCard key={`skeleton-${index}`} />;
              }

              return (
                <Card key={item._id || index}>
                  <QuoteIcon>
                    <FaQuoteLeft />
                  </QuoteIcon>
                  <Content>"{item.content}"</Content>
                  <Footer>
                    <SellerName>{item?.seller?.businessName || 'Seller'}</SellerName>
                    <Rating>
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <FaStar
                          key={starIndex}
                          color={starIndex < item.rating ? '#f59e0b' : '#e5e7eb'}
                          size={14}
                        />
                      ))}
                    </Rating>
                  </Footer>
                </Card>
              );
            }
          )}
        </Grid>
      </Container>
    </Section>
  );
};

const Section = styled.section`
  padding: 4rem 0;
  background: #fafafa;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #111827;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0;
  color: #6b7280;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled.article`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const QuoteIcon = styled.div`
  color: #f59e0b;
  opacity: 0.5;
`;

const Content = styled.p`
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-style: italic;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const SellerName = styled.p`
  margin: 0;
  font-weight: 600;
  color: #111827;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
`;

const SkeletonCard = styled.div`
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export default TestimonialsSection;
