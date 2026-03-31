import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../utils/cloudinaryConfig';
import * as S from './OptimizedImage.styles';

/**
 * Specialized component for optimized Cloudinary images.
 * Handles loading states, fallbacks, and maintains aspect ratio.
 */
const OptimizedImage = ({
    src,
    slot,
    alt = "Saiisai",
    aspectRatio,
    objectFit,
    radius,
    bg,
    hoverZoom = false,
    priority = false, // If true, eager loading + high fetchpriority
    showLQIP = true,  // If true, show low-quality blurry placeholder
    className = "",
    // No default placeholder, allow alt text to show
    fallback = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = React.useRef(null);

    // Identify base URL from src (supports Cloudinary objects with public_id, secure_url, etc.)
    const baseUrlValue = typeof src === 'object' && src !== null
        ? (src.url || src.src || src.secure_url || src.image || src.imageUrl || src.public_id || src.publicId || src.path || src.thumb || src.imagePath || '')
        : (src || '');

    const optimizedSrc = baseUrlValue ? getOptimizedImageUrl(baseUrlValue, slot) : '';
    const lqipSrc = (baseUrlValue && showLQIP && !priority)
        ? getOptimizedImageUrl(baseUrlValue, slot, { lowQuality: true })
        : '';

    // If we have an explicit fallback (like product cover), use it. 
    const finalSrc = hasError ? (fallback || '') : optimizedSrc;

    // Reset states when source changes
    React.useEffect(() => {
        if (!optimizedSrc) {
            setIsLoaded(true);
            setHasError(true);
            return;
        }

        setIsLoaded(false);
        setHasError(false);

        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
            setIsLoaded(true);
        }
    }, [optimizedSrc]);

    return (
        <S.ImageWrapper
            $aspectRatio={aspectRatio}
            $radius={radius}
            $bg={bg}
            $lqip={lqipSrc} // Pass LQIP to wrapper if needed for background
            className={`${hoverZoom ? 'image-hover' : ''} ${className}`}
            {...props}
        >
            {/* Show LQIP as a background-image or separate overlay for better perceived performance */}
            {lqipSrc && !isLoaded && !hasError && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${lqipSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                        zIndex: 1
                    }}
                />
            )}

            <S.StyledImage
                key={optimizedSrc}
                ref={imgRef}
                src={finalSrc}
                alt={alt}
                $loaded={isLoaded}
                $hasError={hasError}
                $objectFit={objectFit || slot?.objectFit || (slot?.c === 'fit' ? 'contain' : 'cover')}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    console.error("OptimizedImage failed to load:", optimizedSrc);
                    setHasError(true);
                }}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                style={{ zIndex: 2, position: 'relative' }}
                {...props}
            />
        </S.ImageWrapper>
    );
};

export default OptimizedImage;
