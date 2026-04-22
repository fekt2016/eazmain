// ─────────────────────────────────────────────────────────
// Saiisai Cloudinary Image Optimization — Phase 1
// Cloud: eazworld
// ─────────────────────────────────────────────────────────

const CLOUD_NAME = 'eazworld';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// ─── SLOT DEFINITIONS ────────────────────────────────────
export const IMAGE_SLOTS = {
    // Fill modes support g_auto
    PRODUCT_CARD: { w: 400, h: 400, c: 'fill', g: 'auto', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },
    PRODUCT_THUMB: { w: 150, h: 150, c: 'fill', g: 'auto', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },
    HOME_HERO: { w: 1200, h: 480, c: 'fill', g: 'center', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },
    CATEGORY_HERO: { w: 1920, h: 600, c: 'fill', g: 'center', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },
    AVATAR: { w: 200, h: 200, c: 'fill', g: 'face', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },
    TABLE_THUMB: { w: 100, h: 100, c: 'fill', g: 'auto', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'cover' },

    // Fit modes DO NOT support g_auto (results in 400 Bad Request)
    PRODUCT_DETAIL: { w: 800, h: 800, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'contain' },
    PRODUCT_DETAIL_MAIN: { w: 800, h: 800, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', bg: 'ffffff', objectFit: 'contain', label: 'Product detail main' },
    PRODUCT_DETAIL_THUMB: { w: 160, h: 160, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', bg: 'ffffff', objectFit: 'contain', label: 'Product thumbnail' },
    PRODUCT_DETAIL_ZOOM: { w: 1200, h: 1200, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', bg: 'ffffff', objectFit: 'contain', label: 'Product zoom' },
    CATEGORY_ICON: { w: 200, h: 200, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'contain' },
    FORM_PREVIEW: { w: 400, h: 400, c: 'fit', q: 'auto', f: 'auto', dpr: 'auto', objectFit: 'contain' },
};

/**
 * Transforms a full Cloudinary URL by injecting parameters.
 * Supports strings (URLs or public IDs) and objects (extracts URL).
 * 
 * @param {string|object} src - Source image
 * @param {object} slot - Transformation parameters
 * @param {object} options - Additional options (lowQuality, fallback)
 */
export const getOptimizedImageUrl = (src, slot, options = {}) => {
    const fallback = options.fallback || '/logo-geometric-transparent.png';
    const lowQuality = options.lowQuality || false;

    if (!src) return fallback;

    // 1. Handle object structure (extract URL from common fields)
    let url = typeof src === 'object'
        ? (src.url || src.src || src.image || src.imageUrl || src.public_id || src.publicId || src.path || src.thumb || src.imagePath || '')
        : String(src);

    if (!url || typeof url !== 'string') return fallback;

    // 2. If it is already a fully qualified Cloudinary URL with transformations, return as is
    if (url.includes('res.cloudinary.com') && url.includes('/image/upload/') && url.split('/upload/')[1].match(/^[a-z]_[a-z0-9]+[,/]/)) {
        return url;
    }

    // 3. Handle relative path / public ID
    if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
        // Remove leading slash if any
        url = url.startsWith('/') ? url.slice(1) : url;

        // If it starts with v123... (version), just prefix BASE_URL correctly
        if (url.match(/^v\d+\//)) {
            url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${url}`;
        } else {
            url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/${url}`;
        }
    }

    // 4. Transform Cloudinary URLs
    if (url.includes('res.cloudinary.com')) {
        const parts = [];

        if (lowQuality) {
            // High compression and blur for LQIP
            parts.push('w_100', 'q_10', 'e_blur:1000', 'f_auto');
        } else {
            if (slot.w) parts.push(`w_${slot.w}`);
            if (slot.h) parts.push(`h_${slot.h}`);
            if (slot.c) parts.push(`c_${slot.c}`);
            if (slot.g) parts.push(`g_${slot.g}`);
            if (slot.q) parts.push(`q_${slot.q}`);
            if (slot.f) parts.push(`f_${slot.f}`);
            if (slot.dpr) parts.push(`dpr_${slot.dpr}`);
            if (slot.r) parts.push(`r_${slot.r}`);
            if (slot.bg) parts.push(`b_rgb:${slot.bg.replace('#', '')}`);
        }

        const transformation = parts.join(',');

        if (transformation) {
            const types = ['/upload/', '/authenticated/'];
            for (const type of types) {
                if (url.includes(type)) {
                    const urlParts = url.split(type);
                    // Check if second part already has transformations
                    if (urlParts[1] && !urlParts[1].match(/^[a-z]_[a-z0-9]+[,/]/)) {
                        return `${urlParts[0]}${type}${transformation}/${urlParts[1]}`;
                    }
                }
            }
        }
    }

    return url;
};

export const VIDEO_SLOTS = {
    PRODUCT_DETAIL: { w: 800, h: 450, c: 'limit', q: 'auto', f: 'auto' }, // 16:9 aspect ratio usually
    /** Small square previews (home status rings, muted loop) */
    STATUS_RING: { w: 200, h: 200, c: 'fill', g: 'auto', q: 'auto', f: 'auto' },
};

/**
 * Transforms a full Cloudinary Video URL by injecting parameters.
 */
export const getOptimizedVideoUrl = (src, slot = VIDEO_SLOTS.PRODUCT_DETAIL) => {
    if (!src) return '';

    let url = typeof src === 'object' ? (src.url || src.src || src.video || '') : String(src);
    if (!url || typeof url !== 'string') return '';

    // Handle relative path / public ID
    if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
        url = url.startsWith('/') ? url.slice(1) : url;
        const version = url.match(/^v\d+\//) ? '' : 'v1/';
        url = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${version}${url}`;
    }

    // Change image/upload to video/upload if needed
    if (url.includes('/image/upload/')) {
        url = url.replace('/image/upload/', '/video/upload/');
    }

    if (url.includes('res.cloudinary.com')) {
        const parts = [];
        if (slot.w) parts.push(`w_${slot.w}`);
        if (slot.h) parts.push(`h_${slot.h}`);
        if (slot.c) parts.push(`c_${slot.c}`);
        if (slot.q) parts.push(`q_${slot.q}`);
        if (slot.f) parts.push(`f_${slot.f}`);

        const transformation = parts.join(',');

        if (transformation && url.includes('/upload/')) {
            const urlParts = url.split('/upload/');
            if (urlParts[1] && !urlParts[1].match(/^[a-z]_[a-z0-9]+[,/]/)) {
                return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
            }
        }
    }

    return url;
};

// ... existing code ...
export const imgUrl = getOptimizedImageUrl;
export const videoUrl = getOptimizedVideoUrl;
