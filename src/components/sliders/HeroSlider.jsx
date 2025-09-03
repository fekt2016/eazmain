// src/components/CustomSlider.js
import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";

const HeroSlider = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrev = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, [currentIndex, items.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, items.length]);

  // Auto slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext]);

  return (
    <SliderContainer>
      <SliderWrapper>
        {items.map((item, index) => (
          <Slide
            key={item.id}
            $active={index === currentIndex}
            $bgColor={item.bgColor}
          >
            <SlideContent>
              <SlideTitle>{item.title}</SlideTitle>
              <SlideSubtitle>{item.subtitle}</SlideSubtitle>
              <SlideButton>{item.buttonText}</SlideButton>
            </SlideContent>
            <SlideImage>
              <img src={item.image} alt={item.title} />
            </SlideImage>
          </Slide>
        ))}
      </SliderWrapper>

      <PrevButton onClick={goToPrev}>
        <ChevronLeft />
      </PrevButton>

      <NextButton onClick={goToNext}>
        <ChevronRight />
      </NextButton>

      <DotsContainer>
        {items.map((_, index) => (
          <Dot
            key={index}
            $active={index === currentIndex}
            onClick={() => goToSlide(index)}
          />
        ))}
      </DotsContainer>
    </SliderContainer>
  );
};

// Styled Components
const SliderContainer = styled.div`
  /* background-color: red; */
  position: relative;
  height: 500px;
  overflow: hidden;
  /* margin-bottom: 60px; */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  @media (max-width: 992px) {
    height: 400px;
  }

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: ${(props) => props.$bgColor || "#ff9a9e"};
  background-image: linear-gradient(
    135deg,
    ${(props) => props.$bgColor || "#ff9a9e"} 0%,
    #fad0c4 100%
  );
  padding: 0 5%;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: opacity 1s ease-in-out;
  z-index: ${(props) => (props.$active ? 1 : 0)};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SlideContent = styled.div`
  flex: 0 0 50%;
  padding-right: 30px;
  z-index: 2;

  @media (max-width: 768px) {
    padding-right: 0;
    padding-bottom: 30px;
  }
`;

const SlideTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  color: white;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 992px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const SlideSubtitle = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 500px;
  animation: fadeInUp 1s ease-out;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SlideButton = styled.button`
  display: inline-block;
  padding: 14px 32px;
  background: white;
  color: #4e73df;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 16px;
  animation: fadeInUp 1.2s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    background: #f8f9fc;
  }
`;

const SlideImage = styled.div`
  flex: 0 0 45%;
  display: flex;
  justify-content: center;
  z-index: 1;
  animation: zoomIn 1.5s ease-out;

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    object-fit: cover;

    @media (max-width: 992px) {
      max-height: 300px;
    }

    @media (max-width: 768px) {
      max-height: 200px;
    }
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: white;
  font-size: 24px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const PrevButton = styled(NavButton)`
  left: 30px;
`;

const NextButton = styled(NavButton)`
  right: 30px;
`;

const ChevronLeft = styled.span`
  &::before {
    content: "❮";
  }
`;

const ChevronRight = styled.span`
  &::before {
    content: "❯";
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.$active ? "white" : "rgba(255, 255, 255, 0.5)"};
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: white;
  }
`;

export default HeroSlider;
