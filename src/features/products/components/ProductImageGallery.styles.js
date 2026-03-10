import styled, { keyframes } from 'styled-components';

export const GalleryWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

export const MainImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #FAFAFA;
  border: 1px solid #F0F0F0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    border-radius: 0;
    border: none;
    cursor: default;
  }
`;

export const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 300ms ease;
  opacity: ${props => props.$isVisible ? 1 : 0};
  background: #FAFAFA;
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const ImageSkeleton = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #f5f5f5 25%,
    #ebebeb 50%,
    #f5f5f5 75%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.2s ease infinite;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  border-radius: 12px;
`;

export const ThumbnailStrip = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  padding: 4px 0;

  @media (max-width: 768px) {
    padding: 4px 16px;
  }
`;

export const ThumbnailItem = styled.button`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${props => props.$isActive ? '#D4882A' : '#E5E7EB'};
  padding: 0;
  background: #FAFAFA;
  cursor: pointer;
  scroll-snap-align: start;
  transition: all 150ms ease;
  opacity: ${props => props.$isActive ? 1 : 0.7};
  transform: ${props => props.$isActive ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    border-color: #D4882A;
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

export const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #FAFAFA;
`;

export const DotStrip = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isActive ? '#D4882A' : '#E5E7EB'};
  transition: all 200ms ease;
  transform: ${props => props.$isActive ? 'scale(1.3)' : 'scale(1)'};
  cursor: pointer;
`;

export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(5px);
`;

export const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
`;

export const LightboxClose = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const LightboxArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${props => props.$direction === 'prev' ? '24px' : 'auto'};
  right: ${props => props.$direction === 'next' ? '24px' : 'auto'};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    left: ${props => props.$direction === 'prev' ? '8px' : 'auto'};
    right: ${props => props.$direction === 'next' ? '8px' : 'auto'};
  }
`;

export const FallbackContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: #FAFAFA;
  color: #E5E7EB;
`;
