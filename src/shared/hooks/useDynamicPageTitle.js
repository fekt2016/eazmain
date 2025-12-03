import { useEffect } from 'react';

const useDynamicPageTitle = ({
  title,
  dynamicTitle,
  description,
  defaultTitle = 'EazShop',
  defaultDescription = 'Shop the best products on EazShop',
}) => {
  useEffect(() => {
    // Client-side only (avoid SSR issues)
    if (typeof document === 'undefined') return;

    // Compute final title
    const finalTitle = dynamicTitle || title || defaultTitle;
    document.title = finalTitle;

    // Compute final description
    const finalDescription = description || defaultDescription;

    // Helper to update/create meta tag
    const updateOrCreateMeta = (selector, content, attr = 'name') => {
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
    updateOrCreateMeta('twitter:title', finalTitle, 'name');
    updateOrCreateMeta('twitter:description', finalDescription, 'name');

    // Cleanup on unmount (optional, but good practice)
    return () => {
      // Reset to defaults if needed
      document.title = defaultTitle;
    };
  }, [dynamicTitle, title, description, defaultTitle, defaultDescription]);
};

export default useDynamicPageTitle;

