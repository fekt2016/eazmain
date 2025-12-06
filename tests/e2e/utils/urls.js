/**
 * Centralized route definitions for E2E tests
 * Matches the routes defined in src/routes/routePaths.js
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_ACCOUNT: '/verify-account',
  
  // Products
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  SEARCH: '/search',
  DEALS: '/deals',
  NEW_ARRIVALS: '/new-arrivals',
  BEST_SELLERS: '/best-sellers',
  
  // Protected routes (require authentication)
  PROFILE: '/profile',
  ORDERS: '/orders',
  CHECKOUT: '/checkout',
  CART: '/cart',
  WISHLIST: '/wishlist',
  ADDRESSES: '/profile/addresses',
  PAYMENT_METHODS: '/profile/payment-methods',
  SUPPORT: '/support',
  SUPPORT_TICKETS: '/support/tickets',
  WALLET: '/wallet',
  ORDER_CONFIRMATION: '/order-confirmation',
  
  // Content pages
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  REFUND_POLICY: '/refund-policy',
  SHIPPING_POLICY: '/shipping-policy',
  
  // Error pages
  NOT_FOUND: '/404',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    CURRENT_USER: '/api/v1/auth/me',
  },
  ORDERS: {
    LIST: '/api/v1/order',
    CREATE: '/api/v1/order',
    DETAIL: (id) => `/api/v1/order/${id}`,
  },
  PAYMENT: {
    INITIALIZE: '/api/v1/payment/paystack/initialize',
    VERIFY: '/api/v1/payment/paystack/verify',
  },
};

export default ROUTES;

