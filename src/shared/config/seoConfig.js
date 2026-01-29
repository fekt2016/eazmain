/**
 * SEO Configuration for Saiisai (Customer-Facing Storefront)
 * Centralized SEO metadata for all public pages
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_FRONTEND_URL) || window.location.origin || 'https://saiisai.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/saiisai-og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Shop the best products from trusted sellers on Saiisai - Ghana\'s leading online marketplace';

const seoConfig = {
  // ────────────────────────────────────────────────
  // Home Page
  // ────────────────────────────────────────────────
  home: {
    title: 'Saiisai - Ghana\'s Leading Online Marketplace',
    description: 'Discover thousands of products from verified sellers. Fast delivery, secure payments, and excellent customer service.',
    keywords: 'online shopping, ecommerce, Ghana, marketplace, buy online, shop Ghana',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Saiisai',
      url: BASE_URL,
      logo: `${BASE_URL}/images/logo.png`,
      description: 'Ghana\'s leading online marketplace connecting buyers and sellers',
      sameAs: [
        'https://www.facebook.com/saiisai',
        'https://www.twitter.com/saiisai',
        'https://www.instagram.com/saiisai',
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
    const productDescription = productData.description || `${productName} - Available on Saiisai`;

    return {
      title: `${productName} - Buy Online | Saiisai`,
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
          name: productData.seller?.shopName || productData.seller?.name || 'Saiisai Seller',
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
            name: productData.seller?.shopName || productData.seller?.name || 'Saiisai Seller',
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
    const categoryDescription = categoryData.description || `Browse ${categoryName} products on Saiisai`;

    return {
      title: `${categoryName} - Shop Online | Saiisai`,
      description: categoryDescription.substring(0, 160),
      keywords: `${categoryName}, products, buy online, Ghana, Saiisai`,
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
    const shopDescription = sellerInfo.description || `Shop from ${shopName} on Saiisai`;

    return {
      title: `${shopName} - Shop on Saiisai`,
      description: shopDescription.substring(0, 160),
      keywords: `${shopName}, seller, shop, Saiisai, Ghana`,
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
    title: 'My Wishlist - Saiisai',
    description: 'View and manage your saved products on Saiisai',
    keywords: 'wishlist, saved products, favorites, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/wishlist`,
    noIndex: true, // Personal page, should not be indexed
  },

  // ────────────────────────────────────────────────
  // Cart
  // ────────────────────────────────────────────────
  cart: {
    title: 'Shopping Cart - Saiisai',
    description: 'Review your cart items before checkout',
    keywords: 'shopping cart, cart, checkout, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/cart`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Checkout
  // ────────────────────────────────────────────────
  checkout: {
    title: 'Checkout - Saiisai',
    description: 'Complete your purchase securely on Saiisai',
    keywords: 'checkout, payment, order, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/checkout`,
    noIndex: true, // Personal page
  },

  // ────────────────────────────────────────────────
  // Order Success
  // ────────────────────────────────────────────────
  orderSuccess: {
    title: 'Order Confirmed - Saiisai',
    description: 'Your order has been successfully placed',
    keywords: 'order confirmation, order success, Saiisai',
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
        title: 'Order Details - Saiisai',
        description: 'View your order details and tracking information',
        keywords: 'order details, order tracking, my orders, Saiisai',
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
      title: `Order ${orderNumber} - Order Details | Saiisai`,
      description: `View details for order ${orderNumber} placed on ${orderDate}. Status: ${orderStatus}. Total: GH₵${totalPrice.toFixed(2)}`,
      keywords: `order ${orderNumber}, order details, order tracking, ${orderStatus}, Saiisai`,
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
    title: 'Help Center - Saiisai',
    description: 'Get help with your orders, account, and more on Saiisai',
    keywords: 'help, support, FAQ, customer service, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/help`,
  },

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────
  login: {
    title: 'Login - Saiisai',
    description: 'Sign in to your Saiisai account',
    keywords: 'login, sign in, account, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/login`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Signup
  // ────────────────────────────────────────────────
  signup: {
    title: 'Sign Up - Saiisai',
    description: 'Create a new Saiisai account to start shopping',
    keywords: 'sign up, register, create account, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/signup`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Blog (Future)
  // ────────────────────────────────────────────────
  blog: {
    title: 'Blog - Saiisai',
    description: 'Read the latest news, tips, and updates from Saiisai',
    keywords: 'blog, news, tips, Saiisai',
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
      title: searchQuery ? `Search Results for "${searchQuery}" - Saiisai` : 'Search Products - Saiisai',
      description: searchQuery 
        ? `Find products matching "${searchQuery}" on Saiisai`
        : 'Search for products on Saiisai',
      keywords: `search, ${searchQuery}, products, Saiisai`,
      image: DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
    };
  },

  // ────────────────────────────────────────────────
  // About Us
  // ────────────────────────────────────────────────
  about: {
    title: 'About Us - Saiisai',
    description: 'Learn about Saiisai - Ghana\'s leading online marketplace connecting buyers and sellers',
    keywords: 'about us, Saiisai, Ghana marketplace, online shopping',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/about`,
  },

  // ────────────────────────────────────────────────
  // Contact Us
  // ────────────────────────────────────────────────
  contact: {
    title: 'Contact Us - Saiisai',
    description: 'Get in touch with Saiisai customer support. We\'re here to help with your questions and concerns',
    keywords: 'contact, support, customer service, help, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/contact`,
  },

  // ────────────────────────────────────────────────
  // Partners
  // ────────────────────────────────────────────────
  partners: {
    title: 'Partners - Saiisai',
    description: 'Partner with Saiisai to grow your business. Join our network of trusted sellers',
    keywords: 'partners, business partners, sellers, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/partners`,
  },

  // ────────────────────────────────────────────────
  // Forgot Password
  // ────────────────────────────────────────────────
  forgotPassword: {
    title: 'Forgot Password - Saiisai',
    description: 'Reset your Saiisai account password',
    keywords: 'forgot password, reset password, account recovery, Saiisai',
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
      title: `${productName} Reviews - Saiisai`,
      description: `Read customer reviews and ratings for ${productName} on Saiisai`,
      keywords: `${productName}, reviews, ratings, customer reviews, Saiisai`,
      image: productData.imageCover || DEFAULT_IMAGE,
      type: 'website',
      canonical: `${BASE_URL}/products/${productData._id || productData.id}/reviews`,
    };
  },

  // ────────────────────────────────────────────────
  // Support
  // ────────────────────────────────────────────────
  support: {
    title: 'Support - Saiisai',
    description: 'Get help and support for your Saiisai account, orders, and more',
    keywords: 'support, help, customer service, FAQ, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/support`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Profile Pages (Personal - noIndex)
  // ────────────────────────────────────────────────
  profile: {
    title: 'My Profile - Saiisai',
    description: 'Manage your Saiisai account profile and settings',
    keywords: 'profile, account, settings, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile`,
    noIndex: true,
  },

  addresses: {
    title: 'My Addresses - Saiisai',
    description: 'Manage your shipping addresses on Saiisai',
    keywords: 'addresses, shipping address, delivery address, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/addresses`,
    noIndex: true,
  },

  paymentMethods: {
    title: 'Payment Methods - Saiisai',
    description: 'Manage your payment methods on Saiisai',
    keywords: 'payment methods, payment, cards, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/payment-methods`,
    noIndex: true,
  },

  notifications: {
    title: 'Notifications - Saiisai',
    description: 'View your notifications on Saiisai',
    keywords: 'notifications, alerts, messages, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/notifications`,
    noIndex: true,
  },

  orders: {
    title: 'My Orders - Saiisai',
    description: 'View and track your orders on Saiisai',
    keywords: 'orders, my orders, order history, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/orders`,
    noIndex: true,
  },

  browserHistory: {
    title: 'Browse History - Saiisai',
    description: 'View your browsing history on Saiisai',
    keywords: 'browse history, recently viewed, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/browser-history`,
    noIndex: true,
  },

  followed: {
    title: 'Followed Sellers - Saiisai',
    description: 'View sellers you follow on Saiisai',
    keywords: 'followed, sellers, following, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/followed`,
    noIndex: true,
  },

  coupons: {
    title: 'My Coupons - Saiisai',
    description: 'View and manage your coupons and discount codes on Saiisai',
    keywords: 'coupons, discount codes, promo codes, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/profile/coupons`,
    noIndex: true,
  },

  // ────────────────────────────────────────────────
  // Error Pages
  // ────────────────────────────────────────────────
  notFound: {
    title: 'Page Not Found - Saiisai',
    description: 'The page you are looking for does not exist',
    keywords: '404, not found, error, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/404`,
    noIndex: true,
  },

  error: {
    title: 'Error - Saiisai',
    description: 'An error occurred. Please try again later.',
    keywords: 'error, Saiisai',
    image: DEFAULT_IMAGE,
    type: 'website',
    canonical: `${BASE_URL}/error`,
    noIndex: true,
  },
};

export default seoConfig;

