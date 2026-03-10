import React from 'react';
import styled from 'styled-components';
import { videoUrl, VIDEO_SLOTS } from '../../../shared/utils/cloudinaryConfig';
import { FaPlay, FaVideoSlash } from 'react-icons/fa';

const VideoContainer = styled.div`
  margin-top: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-grey-100);
`;

const VideoTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-800);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  svg {
    color: var(--color-primary-600);
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PlaceholderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f6f8fb 0%, #e2e8f0 100%);
  color: var(--color-grey-500);
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;

  svg {
    font-size: 4rem;
    color: var(--color-grey-300);
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
  }
`;

const PlaceholderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-grey-700);
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    color: var(--color-grey-500);
    margin: 0;
  }
`;

const ProductVideo = ({ src, productName }) => {
  const optimizedSrc = src ? videoUrl(src, VIDEO_SLOTS.PRODUCT_DETAIL) : null;

  return (
    <VideoContainer>
      <VideoTitle>
        <FaPlay />
        Product Video
      </VideoTitle>
      <VideoWrapper>
        {src ? (
          <StyledVideo
            controls
            preload="metadata"
            poster={videoUrl(src, { ...VIDEO_SLOTS.PRODUCT_DETAIL, f: 'jpg', so: '1' })} // Frame at 1s as poster
          >
            <source src={optimizedSrc} />
            Your browser does not support the video tag.
          </StyledVideo>
        ) : (
          <PlaceholderContent>
            <FaVideoSlash />
            <PlaceholderText>
              <h4>No Product Video Available</h4>
              <p>The seller hasn't uploaded a video for this item yet.</p>
            </PlaceholderText>
          </PlaceholderContent>
        )}
      </VideoWrapper>
    </VideoContainer>
  );
};

export default ProductVideo;
