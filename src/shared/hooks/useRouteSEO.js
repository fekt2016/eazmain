import { useLocation } from 'react-router-dom';
import usePageTitle from './usePageTitle';
import seoConfig from '../config/seoConfig';
import { ROUTE_CONFIG, PATHS } from '../../routes/routePaths';

/**
 * Automatic SEO hook that applies SEO based on current route
 * Works with both static and dynamic routes
 */
export const useRouteSEO = (customConfig = null) => {
  const location = useLocation();
  const { pathname, search } = location;

  // If custom config provided, use it
  if (customConfig) {
    usePageTitle(customConfig);
    return;
  }

  const withCanonical = (config) => ({
    ...config,
    canonical: `${window.location.origin}${pathname}${search || ''}`,
  });

  // Prefer seoConfig first because it contains noIndex/noFollow for private pages.
  const staticSeoMap = {
    [PATHS.HOME]: seoConfig.home,
    [PATHS.LOGIN]: seoConfig.login,
    [PATHS.SIGNUP]: seoConfig.signup,
    '/register': seoConfig.signup,
    [PATHS.FORGOT_PASSWORD]: seoConfig.forgotPassword,
    '/reset-password': {
      ...seoConfig.forgotPassword,
      title: 'Reset Password - Saiisai',
      canonical: `${window.location.origin}/reset-password`,
    },
    [PATHS.BLOG]: seoConfig.blog,
    [PATHS.ABOUT]: seoConfig.about,
    [PATHS.CONTACT]: seoConfig.contact,
    [PATHS.HELP]: seoConfig.helpCenter,
    [PATHS.PARTNER]: seoConfig.partners,
    [PATHS.PARTNERS]: seoConfig.partners,
    [PATHS.CART]: seoConfig.cart,
    [PATHS.CHECKOUT]: seoConfig.checkout,
    [PATHS.ORDER_CONFIRMATION]: seoConfig.orderSuccess,
    [PATHS.WISHLIST]: seoConfig.wishlist,
    [PATHS.SUPPORT]: seoConfig.support,
    [PATHS.ORDERS]: seoConfig.orders,
    [PATHS.PROFILE]: seoConfig.profile,
    [PATHS.ADDRESSES]: seoConfig.addresses,
    [PATHS.ADDRESSES_SHORT]: seoConfig.addresses,
    [PATHS.PAYMENT_METHODS]: seoConfig.paymentMethods,
    [PATHS.PAYMENT]: seoConfig.paymentMethods,
    [PATHS.PAYMENT_SHORT]: seoConfig.paymentMethods,
    [PATHS.NOTIFICATIONS]: seoConfig.notifications,
    [PATHS.BROWSER]: seoConfig.browserHistory,
    [PATHS.BROWSER_SHORT]: seoConfig.browserHistory,
    [PATHS.FOLLOWED]: seoConfig.followed,
    [PATHS.FOLLOWED_SHORT]: seoConfig.followed,
    [PATHS.COUPON]: seoConfig.coupons,
    [PATHS.COUPON_SHORT]: seoConfig.coupons,
    [PATHS.NOT_FOUND]: seoConfig.notFound,
    [PATHS.ERROR]: seoConfig.error,
  };

  let routeConfig = staticSeoMap[pathname];

  // Dynamic route handling
  if (!routeConfig) {
    if (/^\/search(\/)?$/.test(pathname)) {
      const query = new URLSearchParams(search).get('q') || '';
      routeConfig = seoConfig.search(query);
    } else if (/^\/products\/[^/]+\/reviews\/?$/.test(pathname)) {
      routeConfig = seoConfig.productReviews(null);
    } else if (/^\/products\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.product(null);
    } else if (/^\/product\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.product(null);
    } else if (/^\/categories\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.category(null);
    } else if (/^\/category\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.category(null);
    } else if (/^\/sellers\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.sellerShop(null);
    } else if (/^\/seller\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.sellerShop(null);
    } else if (/^\/orders\/[^/]+\/?$/.test(pathname)) {
      routeConfig = seoConfig.orderDetail(null);
    } else if (/^\/orders\/[^/]+\/refund\/?$/.test(pathname)) {
      routeConfig = {
        ...seoConfig.orderDetail(null),
        title: 'Refund Details - Saiisai',
      };
    } else {
      // Fall back to ROUTE_CONFIG entries where no seoConfig key exists yet.
      const routeFallback = ROUTE_CONFIG[pathname];
      routeConfig = routeFallback
        ? {
            ...routeFallback,
            type: 'website',
          }
        : seoConfig.home;
    }
  }

  usePageTitle(withCanonical(routeConfig));
};

export default useRouteSEO;

