/**
 * Mock advertisement data for development and testing.
 * Shape matches useAds/AdPopup/AdBanner/AdCarousel: id|_id, title, subtitle, description, imageUrl, link, type.
 */

export const MOCK_BANNER_ADS = [
  {
    id: "banner-1",
    _id: "banner-1",
    type: "banner",
    title: "Summer Sale — Up to 40% Off",
    subtitle: "Limited time only",
    description: "Shop our best deals on selected items. Free shipping on orders over $50.",
    imageUrl: "https://picsum.photos/1200/400?random=1",
    link: "https://example.com/sale",
  },
  {
    id: "banner-2",
    _id: "banner-2",
    type: "banner",
    title: "New Arrivals",
    subtitle: "Fresh styles this season",
    description: "Discover the latest collection. New drops every week.",
    imageUrl: "https://picsum.photos/1200/400?random=2",
    link: "https://example.com/new-arrivals",
  },
];

export const MOCK_POPUP_ADS = [
  {
    id: "popup-1",
    _id: "popup-1",
    type: "popup",
    title: "Welcome to Saiisai",
    subtitle: "Get 10% off your first order",
    description: "Sign up for our newsletter and get an exclusive discount code.",
    imageUrl: "https://picsum.photos/420/220?random=popup1",
    link: "https://example.com/signup",
  },
  {
    id: "popup-2",
    _id: "popup-2",
    type: "popup",
    title: "Free Shipping on Orders Over $50",
    subtitle: "No code needed",
    description: "We've got you covered. Free standard shipping on all orders over $50.",
    imageUrl: "https://picsum.photos/420/220?random=popup2",
    link: "https://example.com/shipping",
  },
];

export const MOCK_CAROUSEL_ADS = [
  {
    id: "carousel-1",
    _id: "carousel-1",
    type: "carousel",
    title: "Best Sellers",
    subtitle: "Customer favorites",
    description: "Shop our most loved products.",
    imageUrl: "https://picsum.photos/800/400?random=carousel1",
    link: "https://example.com/best-sellers",
  },
  {
    id: "carousel-2",
    _id: "carousel-2",
    type: "carousel",
    title: "Gift Ideas",
    subtitle: "Perfect for every occasion",
    description: "Find the perfect gift for your loved ones.",
    imageUrl: "https://picsum.photos/800/400?random=carousel2",
    link: "https://example.com/gifts",
  },
  {
    id: "carousel-3",
    _id: "carousel-3",
    type: "carousel",
    title: "Flash Deal",
    subtitle: "Ends tonight",
    description: "Last chance to save on selected items.",
    imageUrl: "https://picsum.photos/800/400?random=carousel3",
    link: "https://example.com/flash",
  },
];

/** Flat list of all mock ads (for API mock / MSW). */
export const MOCK_ADS = [
  ...MOCK_BANNER_ADS,
  ...MOCK_POPUP_ADS,
  ...MOCK_CAROUSEL_ADS,
];

export default MOCK_ADS;
