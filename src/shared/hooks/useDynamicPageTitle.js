import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useDynamicPageTitle = ({
  title,
  dynamicTitle,
  description,
  canonical,
  noIndex,
  noFollow,
  defaultTitle = 'Saiisai - Online Shopping in Ghana | E-commerce Ghana',
  defaultDescription = "saiisai.com is Ghana's online shopping platform. Buy and sell products easily. The best e-commerce website in Ghana.",
}) => {
  const { pathname, search } = useLocation();
  // FIX: Memoize computed values to prevent unnecessary DOM updates
  const finalTitle = useMemo(() => {
    return dynamicTitle || title || defaultTitle;
  }, [dynamicTitle, title, defaultTitle]);

  const finalDescription = useMemo(() => {
    return description || defaultDescription;
  }, [description, defaultDescription]);

  const shouldNoIndex = useMemo(() => {
    if (typeof noIndex === 'boolean') return noIndex;
    // Safe default for auth/account/private routes.
    return /^(\/login|\/signup|\/register|\/forgot-password|\/reset-password|\/cart|\/checkout|\/order-confirmation|\/orders|\/profile|\/wishlist|\/notifications|\/support)(\/|$)/.test(
      pathname
    );
  }, [noIndex, pathname]);

  const shouldNoFollow = useMemo(() => {
    if (typeof noFollow === 'boolean') return noFollow;
    return shouldNoIndex;
  }, [noFollow, shouldNoIndex]);

  useEffect(() => {
    // Client-side only (avoid SSR issues)
    if (typeof document === 'undefined') return;

    // Use memoized values
    document.title = finalTitle;

    const currentUrl =
      canonical || `${window.location.origin}${pathname}${search || ''}`;

    // Helper to update/create meta tag
    const updateOrCreateMeta = (selector, content, attr = 'name') => {
      if (!content) return;
      let meta = document.querySelector(`meta[${attr}="${selector}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attr, selector);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Update meta tags
    updateOrCreateMeta('description', finalDescription);
    updateOrCreateMeta('og:title', finalTitle, 'property');
    updateOrCreateMeta('og:description', finalDescription, 'property');
    updateOrCreateMeta('og:url', currentUrl, 'property');
    updateOrCreateMeta('twitter:title', finalTitle, 'name');
    updateOrCreateMeta('twitter:description', finalDescription, 'name');

    // Keep canonical updated for crawlers and social parsers.
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', currentUrl);
      document.head.appendChild(canonicalLink);
    }

    const robotsValue = [
      shouldNoIndex ? 'noindex' : null,
      shouldNoFollow ? 'nofollow' : null,
    ]
      .filter(Boolean)
      .join(', ');
    if (robotsValue) {
      updateOrCreateMeta('robots', robotsValue, 'name');
    }

    // Cleanup on unmount (optional, but good practice)
    return () => {
      // Reset to defaults if needed
      document.title = defaultTitle;
    };
  }, [
    finalTitle,
    finalDescription,
    defaultTitle,
    pathname,
    search,
    canonical,
    shouldNoIndex,
    shouldNoFollow,
  ]);
};

export default useDynamicPageTitle;

