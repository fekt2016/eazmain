/**
 * Route Paths Configuration for EazMain (Customer-Facing Storefront)
 * Centralized route definitions for the entire application
 */

// ---------- PUBLIC ROUTES ----------
export const PATHS = {
  // Home
  HOME: "/",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  REGISTER: "/signup", // Alias for backward compatibility
  VERIFY_ACCOUNT: "/verify-account", // ✅ New: Account verification page
  FORGOT_PASSWORD: "/forgot-password",
  FORGOT: "/forgot-password", // Alias for backward compatibility
  RESET_PASSWORD: "/reset-password/:token",

  // Products
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  PRODUCT: "/product/:id", // Singular form - matches /product/:id URLs
  PRODUCT_PLURAL: "/products/:id", // Plural form alias
  EDITPRODUCT: "/products/:id/edit", // Alias for backward compatibility
  // Promotional landing (used by ads, /offers/:promoId)
  PROMO_PRODUCT: "/offers/:promoId",
  PRODUCTREVIEWS: "/products/:id/reviews", // Plural form
  PRODUCTREVIEWS_SINGULAR: "/product/:id/reviews", // Singular form - matches /product/:id/reviews URLs
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: "/categories/:id",
  CATEGORY: "/categories/:id", // Alias for backward compatibility
  CATEGORY_SINGULAR: "/category/:id", // Singular form matching usage
  SEARCH: "/search",

  // Sellers
  SELLERS: "/sellers",
  SELLER_SHOP: "/sellers/:id",
  SELLER: "/sellers/:id", // Alias for backward compatibility
  SELLER_SINGULAR: "/seller/:id", // Singular form alias
  SELLER_PRODUCTS: "/sellers/:id/products",

  // Shopping
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",
  ORDERS: "/orders",
  ORDER: "/orders", // Alias for backward compatibility
  ORDER_DETAIL: "/orders/:id",
  ORDER_DETAILS: "/orders/:id", // Alias for backward compatibility
  // Buyer refund detail: tracks the latest refund for a given order
  REFUND_DETAIL: "/orders/:orderId/refund",
  TRACKING: "/tracking/:trackingNumber",

  // Account
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ADDRESSES: "/profile/addresses",
  ADDRESS: "/profile/addresses", // Alias for backward compatibility
  ADDRESSES_SHORT: "/addresses", // Short alias
  PAYMENT_METHODS: "/profile/payment-methods",
  PAYMENT: "/profile/payment-methods", // Alias for backward compatibility
  PAYMENT_SHORT: "/payment-method", // Short alias
  WISHLIST: "/wishlist",
  REVIEWS: "/reviews",
  REVIEW: "/reviews", // Alias for backward compatibility
  NOTIFICATIONS: "/notifications",
  NOTIFICATION: "/notifications", // Alias for backward compatibility
  SUPPORT: "/support",
  SUPPORT_TICKETS: "/support/tickets",
  SUPPORT_TICKET_DETAIL: "/support/tickets/:id",
  CREDIT: "/profile/credit",
  CREDIT_SHORT: "/credit-balance", // Short alias
  WALLET: "/wallet",
  WALLET_ADD_MONEY: "/wallet/add-money",
  WALLET_TOPUP_SUCCESS: "/wallet/topup-success",
  FOLLOWED: "/profile/followed",
  FOLLOWED_SHORT: "/followed", // Short alias
  COUPON: "/profile/coupons",
  COUPON_SHORT: "/coupons", // Short alias
  BROWSER: "/profile/browser-history",
  BROWSER_SHORT: "/browsing-history", // Short alias
  PERMISSION: "/profile/permissions",
  PERMISSION_SHORT: "/permissions", // Short alias

  // Content Pages
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
  HELP: "/help",
  BLOG: "/blog",
  BLOG_POST: "/blog/:slug",
  PARTNER: "/partner",
  PARTNERS: "/partners", // Alias for backward compatibility
  SITEMAP: "/sitemap", // Alias for backward compatibility
  PRESS: "/press", // Alias for backward compatibility

  // Legal
  PRIVACY: "/privacy",
  TERMS: "/terms",
  REFUND_POLICY: "/refund-policy",
  VAT_TAX_POLICY: "/vat-tax-policy",
  SHIPPING_POLICY: "/shipping-policy",
  PRODUCT_CARE: "/product-care",
  CAREERS: "/careers",

  // Special
  OFFERS: "/offers",
  DEALS: "/deals",
  NEW_ARRIVALS: "/new-arrivals",
  BEST_SELLERS: "/best-sellers",

  // Error Pages
  NOT_FOUND: "/404",
  ERROR: "/error",
};

// ---------- ROUTE CONFIG (SEO META) ----------
export const ROUTE_CONFIG = {
  [PATHS.HOME]: {
    title: "Saiisai - Ghana's Leading Online Marketplace",
    description:
      "Discover thousands of products from verified sellers. Fast delivery, secure payments, and excellent customer service.",
    keywords: "online shopping, ecommerce, Ghana, marketplace, buy online, shop Ghana, Saiisai",
  },

  [PATHS.LOGIN]: {
    title: "Login - Saiisai",
    description: "Sign in to your Saiisai account to start shopping",
    keywords: "login, sign in, account, Saiisai",
  },

  [PATHS.SIGNUP]: {
    title: "Sign Up - Saiisai",
    description: "Create a new Saiisai account to start shopping",
    keywords: "sign up, register, create account, Saiisai",
  },

  [PATHS.PRODUCTS]: {
    title: "All Products - Saiisai",
    description: "Browse our complete catalog of products from trusted sellers",
    keywords: "products, shop, buy online, Saiisai",
  },

  [PATHS.PRODUCT_DETAIL]: {
    title: "Product Details - Saiisai",
    description: "View detailed product information, reviews, and purchase options",
    keywords: "product details, buy, Saiisai",
  },
  [PATHS.PROMO_PRODUCT]: {
    title: "Special Offer - Saiisai",
    description: "Products curated for this promotion.",
    keywords: "special offer, promotion, deal, Saiisai",
  },

  [PATHS.CATEGORIES]: {
    title: "Categories - Saiisai",
    description: "Browse products by category on Saiisai",
    keywords: "categories, shop by category, Saiisai",
  },

  [PATHS.CATEGORY_DETAIL]: {
    title: "Category - Saiisai",
    description: "Browse products in this category",
    keywords: "category, products, Saiisai",
  },

  [PATHS.SEARCH]: {
    title: "Search Results - Saiisai",
    description: "Find products matching your search on Saiisai",
    keywords: "search, find products, Saiisai",
  },

  [PATHS.SELLERS]: {
    title: "Sellers - Saiisai",
    description: "Browse verified sellers and their shops on Saiisai",
    keywords: "sellers, shops, vendors, Saiisai",
  },

  [PATHS.SELLER_SHOP]: {
    title: "Seller Shop - Saiisai",
    description: "Browse products from this verified seller",
    keywords: "seller, shop, products, Saiisai",
  },

  [PATHS.CART]: {
    title: "Shopping Cart - Saiisai",
    description: "Review your cart items before checkout",
    keywords: "cart, shopping cart, checkout, Saiisai",
  },

  [PATHS.CHECKOUT]: {
    title: "Checkout - Saiisai",
    description: "Complete your purchase securely on Saiisai",
    keywords: "checkout, payment, order, Saiisai",
  },

  [PATHS.ORDER_CONFIRMATION]: {
    title: "Order Confirmed - Saiisai",
    description: "Your order has been successfully placed",
    keywords: "order confirmation, order success, Saiisai",
  },

  [PATHS.ORDERS]: {
    title: "My Orders - Saiisai",
    description: "View and track your order history",
    keywords: "orders, order history, track order, Saiisai",
  },

  [PATHS.ORDER_DETAIL]: {
    title: "Order Details - Saiisai",
    description: "View detailed information about your order",
    keywords: "order details, order info, Saiisai",
  },

  [PATHS.PROFILE]: {
    title: "My Profile - Saiisai",
    description: "Manage your Saiisai account profile",
    keywords: "profile, account, settings, Saiisai",
  },

  [PATHS.WISHLIST]: {
    title: "My Wishlist - Saiisai",
    description: "View and manage your saved products",
    keywords: "wishlist, saved products, favorites, Saiisai",
  },

  [PATHS.REVIEWS]: {
    title: "My Reviews - Saiisai",
    description: "View and manage your product reviews",
    keywords: "reviews, ratings, feedback, Saiisai",
  },

  [PATHS.ABOUT]: {
    title: "About Us - Saiisai",
    description: "Learn about Saiisai - Ghana's leading online marketplace",
    keywords: "about, company, Saiisai, marketplace",
  },

  [PATHS.CONTACT]: {
    title: "Contact Us - Saiisai",
    description: "Get in touch with Saiisai customer support",
    keywords: "contact, support, help, Saiisai",
  },

  [PATHS.FAQ]: {
    title: "FAQ - Saiisai",
    description: "Frequently asked questions about Saiisai",
    keywords: "faq, questions, help, Saiisai",
  },

  [PATHS.HELP]: {
    title: "Help Center - Saiisai",
    description: "Get help with your orders, account, and more",
    keywords: "help, support, FAQ, customer service, Saiisai",
  },

  [PATHS.BLOG]: {
    title: "Blog - Saiisai",
    description: "Read the latest news, tips, and updates from Saiisai",
    keywords: "blog, news, tips, Saiisai",
  },

  [PATHS.PRIVACY]: {
    title: "Privacy Policy - Saiisai",
    description: "Learn how Saiisai protects your data and privacy",
    keywords: "privacy, policy, security, Saiisai",
  },

  [PATHS.TERMS]: {
    title: "Terms of Service - Saiisai",
    description: "Review the terms and conditions for using Saiisai",
    keywords: "terms, conditions, policy, Saiisai",
  },

  [PATHS.REFUND_POLICY]: {
    title: "Refund Policy - Saiisai",
    description: "Learn about Saiisai's refund and return policy",
    keywords: "refund policy, returns, Saiisai",
  },

  [PATHS.VAT_TAX_POLICY]: {
    title: "VAT & Tax Policy - Saiisai",
    description: "How Saiisai handles VAT and tax for the Ghana marketplace. GRA compliance for buyers and sellers.",
    keywords: "VAT policy, tax policy, Ghana GRA, Saiisai tax, Value Added Tax",
  },

  [PATHS.SHIPPING_POLICY]: {
    title: "Shipping Policy - Saiisai",
    description: "Learn about Saiisai's shipping and delivery policy",
    keywords: "shipping policy, delivery, Saiisai",
  },

  [PATHS.PRODUCT_CARE]: {
    title: "Product Care Guide - Saiisai",
    description: "Learn how to properly care for your clothes, electronics, home items, beauty products and more",
    keywords: "product care, care guide, maintenance tips, cleaning instructions, Saiisai",
  },

  [PATHS.CAREERS]: {
    title: "Careers - Saiisai",
    description: "Join the Saiisai team and build a career in e-commerce",
    keywords: "careers, jobs, hiring, Saiisai",
  },

  [PATHS.OFFERS]: {
    title: "Special Offers - Saiisai",
    description: "Exclusive deals and promotions on Saiisai",
    keywords: "offers, deals, discounts, promotions, Saiisai",
  },

  [PATHS.DEALS]: {
    title: "Deals - Saiisai",
    description: "Best deals and discounts on Saiisai",
    keywords: "deals, discounts, savings, Saiisai",
  },

  [PATHS.NEW_ARRIVALS]: {
    title: "New Arrivals - Saiisai",
    description: "Discover the latest products on Saiisai",
    keywords: "new products, latest, arrivals, Saiisai",
  },

  [PATHS.BEST_SELLERS]: {
    title: "Best Sellers – Saiisai",
    description: "Discover the most popular and top-selling products on Saiisai.",
    keywords: "best sellers, top products, popular items, Saiisai",
  },

  [PATHS.NOT_FOUND]: {
    title: "Page Not Found - Saiisai",
    description: "The page you are looking for does not exist",
    keywords: "404, not found, error, Saiisai",
  },

  [PATHS.ERROR]: {
    title: "Error - Saiisai",
    description: "An error occurred. Please try again later.",
    keywords: "error, Saiisai",
  },
};

// ---------- NAVIGATION MENU ----------
export const NAVIGATION_MENU = {
  main: [
    { path: PATHS.HOME, label: "Home" },
    { path: PATHS.CATEGORIES, label: "Categories" },
    { path: PATHS.OFFERS, label: "Offers" },
    { path: PATHS.BEST_SELLERS, label: "Best Sellers" },
    { path: PATHS.ABOUT, label: "About" },
    { path: PATHS.CONTACT, label: "Contact" },
  ],

  user: [
    { path: PATHS.PROFILE, label: "My Profile" },
    { path: PATHS.ORDERS, label: "My Orders" },
    { path: PATHS.WISHLIST, label: "Wishlist" },
    { path: PATHS.REVIEWS, label: "My Reviews" },
    { path: PATHS.SETTINGS, label: "Settings" },
  ],

  footer: [
    {
      title: "Company",
      links: [
        { path: PATHS.ABOUT, label: "About Us" },
        { path: PATHS.CONTACT, label: "Contact" },
        { path: PATHS.BLOG, label: "Blog" },
        { path: PATHS.CAREERS, label: "Careers" },
      ],
    },
    {
      title: "Shop",
      links: [
        { path: PATHS.CATEGORIES, label: "Categories" },
        { path: PATHS.OFFERS, label: "Offers" },
        { path: PATHS.BEST_SELLERS, label: "Best Sellers" },
        { path: PATHS.NEW_ARRIVALS, label: "New Arrivals" },
      ],
    },
    {
      title: "Support",
      links: [
        { path: PATHS.HELP, label: "Help Center" },
        { path: PATHS.FAQ, label: "FAQ" },
        { path: PATHS.SUPPORT, label: "Support" },
        { path: PATHS.SHIPPING_POLICY, label: "Shipping" },
      ],
    },
    {
      title: "Legal",
      links: [
        { path: PATHS.TERMS, label: "Terms of Service" },
        { path: PATHS.PRIVACY, label: "Privacy Policy" },
        { path: PATHS.REFUND_POLICY, label: "Refund Policy" },
        { path: PATHS.VAT_TAX_POLICY, label: "VAT & Tax Policy" },
      ],
    },
  ],
};

export default PATHS;
