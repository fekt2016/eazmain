/**
 * SEO Configuration for Saysay (Customer-Facing Storefront)
 * Centralized SEO metadata for all public pages
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_FRONTEND_URL) || window.location.origin || 'https://saysay.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/saysay-og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Shop the best products from trusted sellers on Saysay - Ghana\'s leading online marketplace';

const seoConfig = {
  // ────────────────────────────────────────────────
  // Home Page
  // ────────────────────────────────────────────────
  home: {
    title: 'Saysay - Ghana\'s Leading Online Marketplace',
    description: 'Discover thousands of products from verified sellers. Fast delivery, secure payments, and excellent customer service.',
    keywords: 'online shopping, ecommerce, Ghana, marketplace, buy online, shop Ghana',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Saysay',
      url: BASE_URL,
      logo: `${BASE_URL}/images/logo.png`,
      description: 'Ghana\'s leading online marketplace connecting buyers and sellers',
      sameAs: [
        'https://www.facebook.com/eazshop',
        'https://www.twitter.com/eazshop',
        'https://www.instagram.com/eazshop',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+233-XXX-XXXX',
        contactType: 'Customer Service',
        areaServed: 'GH',
        availableLanguage: ['en'],
      },
    },
  },

  // ────────────────────────────────────────────────
  // Product Detail Page (Dynamic)
  // ────────────────────────────────────────────────
  product: (productData) => {
    if (!productData) return seoConfig.home;

    const productUrl = `${BASE_URL}/products/${productData._id || productData.id}`;
    const productImage = productData.imageCover || productData.image || DEFAULT_IMAGE;
    const productPrice = productData.price || productData.defaultPrice || 0;
    const productName = productData.name || 'Product';
    const productDescription = productData.description || `${productName} - Available on Saysay`;

    return {
      title: `${productName} - Buy Online | Saysay`,
      description: productDescription.substring(0, 160),
      keywords: `${productName}, buy online, Ghana, ${productData.category?.name || ''}`,
      image: productImage,
      type: 'product',
      canonical: productUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
        description: productDescription,
        image: productImage,
        brand: {
          '@type': 'Brand',
          name: productData.seller?.shopName || productData.seller?.name || 'Saysay Seller',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'GHS',
          price: productPrice,
          availability: productData.stock > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: productData.seller?.shopName || productData.seller?.name || 'Saysay Seller',
          },
        },
        aggregateRating: productData.ratingsAverage ? {
          '@type': 'AggregateRating',
          ratingValue: productData.ratingsAverage,
          reviewCount: productData.ratingsQuantity || 0,
        } : undefined,
      },
    };
  },

  // ────────────────────────────────────────────────
  // Category Page (Dynamic)
  // ────────────────────────────────────────────────
  category: (categoryData) => {
    if (!categoryData) return seoConfig.home;

    const categoryUrl = `${BASE_URL}/categories/${categoryData._id || categoryData.id}`;
    const categoryName = categoryData.name || 'Category';
    const categoryDescription = categoryData.description || `Browse ${categoryName} products on Saysay`;

    return {
      title: `${categoryName} - Shop Online | Saysay`,
      description: categoryDescription.substring(0, 160),
      keywords: `${categoryName}, products, buy online, Ghana, Saysay`,
      image: categoryData.image || DEFAULT_IMAGE,
      type: 'website',
      canonical: categoryUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: categoryName,
        description: categoryDescription,
        url: categoryUrl,
        mainEntity: {
          '@type': 'ItemList',
          name: `${categoryName} Products`,
        },
      },
    };
  },

  // ────────────────────────────────────────────────
  // Seller Shop View (Dynamic)
  // ────────────────────────────────────────────────
  sellerShop: (sellerInfo) => {
    if (!sellerInfo) return seoConfig.home;

    const sellerUrl = `${BASE_URL}/sellers/${sellerInfo._id || sellerInfo.id}`;
    const shopName = sellerInfo.shopName || sellerInfo.name || 'Seller Shop';
    const shopDescription = sellerInfo.description || `Shop from ${shopName} on Saysay`;

    return {
      title: `${shopName} - Shop on Saysay`,
      description: shopDescription.substring(0, 160),
      keywords: `${shopName}, seller, shop, Saysay, Ghana`,
      image: sellerInfo.image || DEFAULT_IMAGE,
      type: 'website',
      canonical: sellerUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: shopName,
        description: shopDescription,
        url: sellerUrl,
        image: sellerInfo.image || DEFAULT_IMAGE,
      },
    };
  },

  // ────────────────────────────────────────────────
  // Wishlist
  // ────────────────────────────────────────────────
  wishlist: {
    title: 'My Wishlist - Saysay',
    description: 'View and manage your saved products on Saysay',
    keywords: 'wishlist, saved products, favorites, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/wishlist`,
    noIndex: true, // Personal page, should not be indexed
  },

  // ────────────────────────────────────────────────
  // Cart
  // ────────────────────────────────────────────────
  cart: {
    title: 'Shopping Cart - Saysay',
    description: 'Review your cart items before checkout',
    keywords: 'shopping cart, cart, checkout, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/cart`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Checkout
  // ────────────────────────────────────────────────
  checkout: {
    title: 'Checkout - Saysay',
    description: 'Complete your purchase securely on Saysay',
    keywords: 'checkout, payment, order, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/checkout`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Order Success
  // ────────────────────────────────────────────────
  orderSuccess: {
    title: 'Order Confirmed - Saysay',
    description: 'Your order has been successfully placed',
    keywords: 'order confirmation, order success, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/order-confirmation`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Order Detail (Dynamic)
  // ────────────────────────────────────────────────
  orderDetail: (orderData) => {
    if (!orderData) {
      return {
        title: 'Order Details - Saysay',
        description: 'View your order details and tracking information',
        keywords: 'order details, order tracking, my orders, Saysay',
        image: DEFAULT_IMAGE,
        type: 'website',
        canonical: `${BASE_URL}/orders`,
        noIndex: true, // Personal page
      };
    }

    const orderNumber = orderData.orderNumber || orderData.id || 'Order';
    const orderUrl = `${BASE_URL}/orders/${orderData._id || orderData.id}`;
    const orderDate = orderData.createdAt 
      ? new Date(orderData.createdAt).toLocaleDateString() 
      : '';
    const orderStatus = orderData.orderStatus || orderData.status || 'pending';
    const totalPrice = orderData.totalPrice || 0;

    return {
      title: `Order ${orderNumber} - Order Details | Saysay`,
      description: `View details for order ${orderNumber} placed on ${orderDate}. Status: ${orderStatus}. Total: GH₵${totalPrice.toFixed(2)}`,
      keywords: `order ${orderNumber}, order details, order tracking, ${orderStatus}, Saysay`,
      image: DEFAULT_IMAGE,
      type: 'website',
      canonical: orderUrl,
      noIndex: true, // Personal page - should not be indexed
    };
  },

  // ────────────────────────────────────────────────
  // Help Center
  // ────────────────────────────────────────────────
  helpCenter: {
    title: 'Help Center - Saysay',
    description: 'Get help with your orders, account, and more on Saysay',
    keywords: 'help, support, FAQ, customer service, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/help`,
  },

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────
  login: {
    title: 'Login - Saysay',
    description: 'Sign in to your Saysay account',
    keywords: 'login, sign in, account, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/login`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Signup
  // ────────────────────────────────────────────────
  signup: {
    title: 'Sign Up - Saysay',
    description: 'Create a new Saysay account to start shopping',
    keywords: 'sign up, register, create account, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/signup`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Blog (Future)
  // ────────────────────────────────────────────────
  blog: {
    title: 'Blog - Saysay',
    description: 'Read the latest news, tips, and updates from Saysay',
    keywords: 'blog, news, tips, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/blog`,
  },

  // ────────────────────────────────────────────────
  // Search Results
  // ────────────────────────────────────────────────
  search: (query) => {
    const searchQuery = query || '';
    return {
      title: searchQuery ? `Search Results for "${searchQuery}" - Saysay` : 'Search Products - Saysay',
      description: searchQuery 
        ? `Find products matching "${searchQuery}" on Saysay`
        : 'Search for products on Saysay',
      keywords: `search, ${searchQuery}, products, Saysay`,
      image: DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
    };
  },

  // ────────────────────────────────────────────────
  // About Us
  // ────────────────────────────────────────────────
  about: {
    title: 'About Us - Saysay',
    description: 'Learn about Saysay - Ghana\'s leading online marketplace connecting buyers and sellers',
    keywords: 'about us, Saysay, Ghana marketplace, online shopping',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/about`,
  },

  // ────────────────────────────────────────────────
  // Contact Us
  // ────────────────────────────────────────────────
  contact: {
    title: 'Contact Us - Saysay',
    description: 'Get in touch with Saysay customer support. We\'re here to help with your questions and concerns',
    keywords: 'contact, support, customer service, help, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/contact`,
  },

  // ────────────────────────────────────────────────
  // Partners
  // ────────────────────────────────────────────────
  partners: {
    title: 'Partners - Saysay',
    description: 'Partner with Saysay to grow your business. Join our network of trusted sellers',
    keywords: 'partners, business partners, sellers, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/partners`,
  },

  // ────────────────────────────────────────────────
  // Forgot Password
  // ────────────────────────────────────────────────
  forgotPassword: {
    title: 'Forgot Password - Saysay',
    description: 'Reset your Saysay account password',
    keywords: 'forgot password, reset password, account recovery, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/forgot-password`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Product Reviews
  // ────────────────────────────────────────────────
  productReviews: (productData) => {
    if (!productData) return seoConfig.home;
    const productName = productData.name || 'Product';
    return {
      title: `${productName} Reviews - Saysay`,
      description: `Read customer reviews and ratings for ${productName} on Saysay`,
      keywords: `${productName}, reviews, ratings, customer reviews, Saysay`,
      image: productData.imageCover || DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/products/${productData._id || productData.id}/reviews`,
    };
  },

  // ────────────────────────────────────────────────
  // Support
  // ────────────────────────────────────────────────
  support: {
    title: 'Support - Saysay',
    description: 'Get help and support for your Saysay account, orders, and more',
    keywords: 'support, help, customer service, FAQ, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/support`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Profile Pages (Personal - noIndex)
  // ────────────────────────────────────────────────
  profile: {
    title: 'My Profile - Saysay',
    description: 'Manage your Saysay account profile and settings',
    keywords: 'profile, account, settings, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile`,
    noIndex: true,
  },

  addresses: {
    title: 'My Addresses - Saysay',
    description: 'Manage your shipping addresses on Saysay',
    keywords: 'addresses, shipping address, delivery address, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/addresses`,
    noIndex: true,
  },

  paymentMethods: {
    title: 'Payment Methods - Saysay',
    description: 'Manage your payment methods on Saysay',
    keywords: 'payment methods, payment, cards, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/payment-methods`,
    noIndex: true,
  },

  notifications: {
    title: 'Notifications - Saysay',
    description: 'View your notifications on Saysay',
    keywords: 'notifications, alerts, messages, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/notifications`,
    noIndex: true,
  },

  orders: {
    title: 'My Orders - Saysay',
    description: 'View and track your orders on Saysay',
    keywords: 'orders, my orders, order history, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/orders`,
    noIndex: true,
  },

  browserHistory: {
    title: 'Browse History - Saysay',
    description: 'View your browsing history on Saysay',
    keywords: 'browse history, recently viewed, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/browser-history`,
    noIndex: true,
  },

  followed: {
    title: 'Followed Sellers - Saysay',
    description: 'View sellers you follow on Saysay',
    keywords: 'followed, sellers, following, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/followed`,
    noIndex: true,
  },

  coupons: {
    title: 'My Coupons - Saysay',
    description: 'View and manage your coupons and discount codes on Saysay',
    keywords: 'coupons, discount codes, promo codes, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/coupons`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Error Pages
  // ────────────────────────────────────────────────
  notFound: {
    title: 'Page Not Found - Saysay',
    description: 'The page you are looking for does not exist',
    keywords: '404, not found, error, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/404`,
    noIndex: true,
  },

  error: {
    title: 'Error - Saysay',
    description: 'An error occurred. Please try again later.',
    keywords: 'error, Saysay',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/error`,
    noIndex: true,
  },
};

export default seoConfig;

