import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../../../shared/utils/cloudinaryConfig';
import * as S from './ProductImageGallery.styles';

const ProductImageGallery = ({ images = [], productName = 'Product' }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const activeImage = images[activeIndex] || images[0];

    // Reset loading state when the active image changes (either via thumbnail or prop change)
    useEffect(() => {
        setIsLoaded(false);
    }, [activeImage]);

    const handleThumbnailClick = (index) => {
        if (index === activeIndex) return;
        setIsTransitioning(true);
        setIsLoaded(false);

        // Smooth fade out before switching
        setTimeout(() => {
            setActiveIndex(index);
            setIsTransitioning(false);
        }, 150);
    };

    const handlePrev = () => {
        const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
        handleThumbnailClick(newIndex);
    };

    const handleNext = () => {
        const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
        handleThumbnailClick(newIndex);
    };

    // Close lightbox on Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Touch swipe support for mobile
    const touchStart = useRef(null);
    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (!touchStart.current) return;
        const delta = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) {
            if (delta > 0) handleNext();
            else handlePrev();
        }
        touchStart.current = null;
    };

    if (!images || images.length === 0) {
        return (
            <S.MainImageContainer>
                <S.FallbackContainer>🖼️</S.FallbackContainer>
            </S.MainImageContainer>
        );
    }

    return (
        <S.GalleryWrapper>
            {/* Main Preview Container */}
            <S.MainImageContainer
                onClick={() => setLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <S.ImageSkeleton $isVisible={!isLoaded} />
                <S.MainImage
                    src={getOptimizedImageUrl(activeImage, IMAGE_SLOTS.PRODUCT_DETAIL_MAIN)}
                    alt={productName}
                    $isLoaded={isLoaded}
                    $isVisible={isLoaded && !isTransitioning}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                    loading="eager"
                    fetchPriority="high"
                />
            </S.MainImageContainer>

            {/* Dot Indicators — Mobile Only */}
            {images.length > 1 && (
                <S.DotStrip>
                    {images.map((_, i) => (
                        <S.Dot
                            key={i}
                            $isActive={i === activeIndex}
                            onClick={() => handleThumbnailClick(i)}
                        />
                    ))}
                </S.DotStrip>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <S.ThumbnailStrip>
                    {images.map((img, i) => (
                        <S.ThumbnailItem
                            key={i}
                            $isActive={i === activeIndex}
                            onClick={() => handleThumbnailClick(i)}
                            aria-label={`View product image ${i + 1}`}
                        >
                            <S.ThumbnailImage
                                src={getOptimizedImageUrl(img, IMAGE_SLOTS.PRODUCT_DETAIL_THUMB)}
                                alt={`${productName} thumbnail ${i + 1}`}
                                loading="lazy"
                            />
                        </S.ThumbnailItem>
                    ))}
                </S.ThumbnailStrip>
            )}

            {/* Full-Screen Lightbox Modal */}
            {lightboxOpen && (
                <S.LightboxOverlay onClick={() => setLightboxOpen(false)}>
                    <S.LightboxClose onClick={() => setLightboxOpen(false)}>
                        ✕
                    </S.LightboxClose>

                    {images.length > 1 && (
                        <S.LightboxArrow
                            $direction="prev"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            aria-label="Previous image"
                        >
                            ‹
                        </S.LightboxArrow>
                    )}

                    <S.LightboxImage
                        src={getOptimizedImageUrl(activeImage, IMAGE_SLOTS.PRODUCT_DETAIL_ZOOM)}
                        alt={`${productName} zoomed view`}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {images.length > 1 && (
                        <S.LightboxArrow
                            $direction="next"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            aria-label="Next image"
                        >
                            ›
                        </S.LightboxArrow>
                    )}
                </S.LightboxOverlay>
            )}
        </S.GalleryWrapper>
    );
};

export default ProductImageGallery;
