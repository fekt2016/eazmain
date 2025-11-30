/**
 * SEO Configuration for EazMain (Customer-Facing Storefront)
 * Centralized SEO metadata for all public pages
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_FRONTEND_URL) || window.location.origin || 'https://eazshop.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/eazshop-og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Shop the best products from trusted sellers on EazShop - Ghana\'s leading online marketplace';

const seoConfig = {
  // ────────────────────────────────────────────────
  // Home Page
  // ────────────────────────────────────────────────
  home: {
    title: 'EazShop - Ghana\'s Leading Online Marketplace',
    description: 'Discover thousands of products from verified sellers. Fast delivery, secure payments, and excellent customer service.',
    keywords: 'online shopping, ecommerce, Ghana, marketplace, buy online, shop Ghana',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EazShop',
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
    const productDescription = productData.description || `${productName} - Available on EazShop`;

    return {
      title: `${productName} - Buy Online | EazShop`,
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
          name: productData.seller?.shopName || productData.seller?.name || 'EazShop Seller',
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
            name: productData.seller?.shopName || productData.seller?.name || 'EazShop Seller',
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
    const categoryDescription = categoryData.description || `Browse ${categoryName} products on EazShop`;

    return {
      title: `${categoryName} - Shop Online | EazShop`,
      description: categoryDescription.substring(0, 160),
      keywords: `${categoryName}, products, buy online, Ghana, EazShop`,
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
    const shopDescription = sellerInfo.description || `Shop from ${shopName} on EazShop`;

    return {
      title: `${shopName} - Shop on EazShop`,
      description: shopDescription.substring(0, 160),
      keywords: `${shopName}, seller, shop, EazShop, Ghana`,
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
    title: 'My Wishlist - EazShop',
    description: 'View and manage your saved products on EazShop',
    keywords: 'wishlist, saved products, favorites, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/wishlist`,
    noIndex: true, // Personal page, should not be indexed
  },

  // ────────────────────────────────────────────────
  // Cart
  // ────────────────────────────────────────────────
  cart: {
    title: 'Shopping Cart - EazShop',
    description: 'Review your cart items before checkout',
    keywords: 'shopping cart, cart, checkout, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/cart`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Checkout
  // ────────────────────────────────────────────────
  checkout: {
    title: 'Checkout - EazShop',
    description: 'Complete your purchase securely on EazShop',
    keywords: 'checkout, payment, order, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/checkout`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Order Success
  // ────────────────────────────────────────────────
  orderSuccess: {
    title: 'Order Confirmed - EazShop',
    description: 'Your order has been successfully placed',
    keywords: 'order confirmation, order success, EazShop',
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
        title: 'Order Details - EazShop',
        description: 'View your order details and tracking information',
        keywords: 'order details, order tracking, my orders, EazShop',
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
      title: `Order ${orderNumber} - Order Details | EazShop`,
      description: `View details for order ${orderNumber} placed on ${orderDate}. Status: ${orderStatus}. Total: GH₵${totalPrice.toFixed(2)}`,
      keywords: `order ${orderNumber}, order details, order tracking, ${orderStatus}, EazShop`,
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
    title: 'Help Center - EazShop',
    description: 'Get help with your orders, account, and more on EazShop',
    keywords: 'help, support, FAQ, customer service, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/help`,
  },

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────
  login: {
    title: 'Login - EazShop',
    description: 'Sign in to your EazShop account',
    keywords: 'login, sign in, account, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/login`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Signup
  // ────────────────────────────────────────────────
  signup: {
    title: 'Sign Up - EazShop',
    description: 'Create a new EazShop account to start shopping',
    keywords: 'sign up, register, create account, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/signup`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Blog (Future)
  // ────────────────────────────────────────────────
  blog: {
    title: 'Blog - EazShop',
    description: 'Read the latest news, tips, and updates from EazShop',
    keywords: 'blog, news, tips, EazShop',
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
      title: searchQuery ? `Search Results for "${searchQuery}" - EazShop` : 'Search Products - EazShop',
      description: searchQuery 
        ? `Find products matching "${searchQuery}" on EazShop`
        : 'Search for products on EazShop',
      keywords: `search, ${searchQuery}, products, EazShop`,
      image: DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
    };
  },

  // ────────────────────────────────────────────────
  // About Us
  // ────────────────────────────────────────────────
  about: {
    title: 'About Us - EazShop',
    description: 'Learn about EazShop - Ghana\'s leading online marketplace connecting buyers and sellers',
    keywords: 'about us, EazShop, Ghana marketplace, online shopping',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/about`,
  },

  // ────────────────────────────────────────────────
  // Contact Us
  // ────────────────────────────────────────────────
  contact: {
    title: 'Contact Us - EazShop',
    description: 'Get in touch with EazShop customer support. We\'re here to help with your questions and concerns',
    keywords: 'contact, support, customer service, help, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/contact`,
  },

  // ────────────────────────────────────────────────
  // Partners
  // ────────────────────────────────────────────────
  partners: {
    title: 'Partners - EazShop',
    description: 'Partner with EazShop to grow your business. Join our network of trusted sellers',
    keywords: 'partners, business partners, sellers, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/partners`,
  },

  // ────────────────────────────────────────────────
  // Forgot Password
  // ────────────────────────────────────────────────
  forgotPassword: {
    title: 'Forgot Password - EazShop',
    description: 'Reset your EazShop account password',
    keywords: 'forgot password, reset password, account recovery, EazShop',
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
      title: `${productName} Reviews - EazShop`,
      description: `Read customer reviews and ratings for ${productName} on EazShop`,
      keywords: `${productName}, reviews, ratings, customer reviews, EazShop`,
      image: productData.imageCover || DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/products/${productData._id || productData.id}/reviews`,
    };
  },

  // ────────────────────────────────────────────────
  // Support
  // ────────────────────────────────────────────────
  support: {
    title: 'Support - EazShop',
    description: 'Get help and support for your EazShop account, orders, and more',
    keywords: 'support, help, customer service, FAQ, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/support`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Profile Pages (Personal - noIndex)
  // ────────────────────────────────────────────────
  profile: {
    title: 'My Profile - EazShop',
    description: 'Manage your EazShop account profile and settings',
    keywords: 'profile, account, settings, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile`,
    noIndex: true,
  },

  addresses: {
    title: 'My Addresses - EazShop',
    description: 'Manage your shipping addresses on EazShop',
    keywords: 'addresses, shipping address, delivery address, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/addresses`,
    noIndex: true,
  },

  paymentMethods: {
    title: 'Payment Methods - EazShop',
    description: 'Manage your payment methods on EazShop',
    keywords: 'payment methods, payment, cards, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/payment-methods`,
    noIndex: true,
  },

  notifications: {
    title: 'Notifications - EazShop',
    description: 'View your notifications on EazShop',
    keywords: 'notifications, alerts, messages, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/notifications`,
    noIndex: true,
  },

  orders: {
    title: 'My Orders - EazShop',
    description: 'View and track your orders on EazShop',
    keywords: 'orders, my orders, order history, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/orders`,
    noIndex: true,
  },

  browserHistory: {
    title: 'Browse History - EazShop',
    description: 'View your browsing history on EazShop',
    keywords: 'browse history, recently viewed, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/browser-history`,
    noIndex: true,
  },

  followed: {
    title: 'Followed Sellers - EazShop',
    description: 'View sellers you follow on EazShop',
    keywords: 'followed, sellers, following, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/followed`,
    noIndex: true,
  },

  coupons: {
    title: 'My Coupons - EazShop',
    description: 'View and manage your coupons and discount codes on EazShop',
    keywords: 'coupons, discount codes, promo codes, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/coupons`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Error Pages
  // ────────────────────────────────────────────────
  notFound: {
    title: 'Page Not Found - EazShop',
    description: 'The page you are looking for does not exist',
    keywords: '404, not found, error, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/404`,
    noIndex: true,
  },

  error: {
    title: 'Error - EazShop',
    description: 'An error occurred. Please try again later.',
    keywords: 'error, EazShop',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/error`,
    noIndex: true,
  },
};

export default seoConfig;

