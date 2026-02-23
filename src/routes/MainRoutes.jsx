import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./routePaths";
import PromotionalProductsPage from "../pages/offers/PromotionalProductsPage";
const ContactPage = lazy(() => import("../pages/contact/ContactPage"));
import { PageSpinner, SpinnerContainer } from "../components/loading";
// Import OrderConfirmationPage directly (not lazy) to ensure it loads immediately
import OrderConfirmationPage from "../features/orders/OrderConfirmationPage";

const SearchResult = lazy(() => import("../features/search/SearchResult"));
const Partners = lazy(() => import("../features/Partners"));
const Press = lazy(() => import("../features/Press"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const PermissionPage = lazy(() => import("../features/profile/PermissionPage"));
const FollowPage = lazy(() => import("../features/profile/FollowPage"));
const Creditbalance = lazy(() => import("../features/profile/Creditbalance"));
const AddMoneyPage = lazy(() => import("../features/wallet/AddMoneyPage"));
const TopupSuccessPage = lazy(() => import("../features/wallet/TopupSuccessPage"));
// Import AddressPage directly to avoid lazy loading issues
// If lazy loading is needed, use the commented version below
import AddressPage from "../features/profile/AddressPage";

// Alternative: Lazy load with error handling (uncomment if needed)
// const AddressPage = lazy(async () => {
//   try {
//     const module = await import("../features/profile/AddressPage");
//     return module;
//   } catch (error) {
//     console.error('[MainRoutes] Failed to dynamically import AddressPage:', error);
//     // Return a fallback component that shows an error message
//     return {
//       default: () => (
//         <div style={{ padding: '2rem', textAlign: 'center' }}>
//           <h2>Failed to load Address Page</h2>
//           <p>Please refresh the page or contact support if the issue persists.</p>
//           <button onClick={() => window.location.reload()}>Refresh Page</button>
//         </div>
//       )
//     };
//   }
// });
const SignupPage = lazy(() => import("../features/auth/SignupPage"));
const LoginPage = lazy(() => import("../features/auth/loginPage"));
// Import ProtectedRoute directly (not lazy) since it's a wrapper component used frequently
import ProtectedRoute from "../routes/ProtectedRoute";
const MainLayout = lazy(() => import("../shared/layout/MainLayout"));
const HomePage = lazy(() => import("../features/products/HomePage"));
const ProductDetail = lazy(() => import("../features/products/ProductDetail.jsx"));
const ProductsPage = lazy(() => import("../features/products/ProductsPage"));
const CategoryPage = lazy(() => import("../features/categories/CategoryPage"));
const CategoriesListPage = lazy(() => import("../features/categories/CategoriesListPage"));
const CartPage = lazy(() => import("../features/cart/CartPage"));
const CheckoutPage = lazy(() => import("../features/orders/CheckoutPage"));
// const ForgetPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));

const ProfilePage = lazy(() => import("../features/profile/profilePage"));
const CustomerSupportPage = lazy(() => import("../features/support/CustomerSupportPage"));
const TicketsListPage = lazy(() => import("../features/support/TicketsListPage"));
const TicketDetailPage = lazy(() => import("../features/support/TicketDetailPage"));
const SitemapPage = lazy(() => import("../pages/sitemap/SitemapPage"));
const ReturnRefundPolicyPage = lazy(() => import("../pages/policies/ReturnRefundPolicyPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/policies/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("../pages/policies/TermsPage"));
const DataDeletionPage = lazy(() => import("../pages/policies/DataDeletionPage"));
const VatTaxPolicyPage = lazy(() => import("../pages/policies/VatTaxPolicyPage"));
const ProductCarePage = lazy(() => import("../pages/product-care/ProductCarePage"));
const PartnerPage = lazy(() => import("../pages/partner/PartnerPage"));
const CareersPage = lazy(() => import("../pages/careers/CareersPage"));
const ShippingInfoPage = lazy(() => import("../pages/shipping/ShippingInfoPage"));
const NewArrivalsPage = lazy(() => import("../pages/new-arrivals/NewArrivalsPage"));
const HelpCenterTabsPage = lazy(() => import("../pages/help/HelpCenterTabsPage"));
const OrderList = lazy(() => import("../features/orders/OrderList"));
const OrderDetail = lazy(() => import("../features/orders/OrderDetail"));
const RefundDetailPage = lazy(() => import("../features/refunds/RefundDetailPage"));
const TrackingPage = lazy(() => import("../features/orders/TrackingPage"));
const ReviewPage = lazy(() => import("../features/products/ReviewPage"));
// Import Dashboard directly (not lazy) since it's a layout wrapper used frequently
import Dashboard from "../shared/layout/Dashboard";
const SellerPage = lazy(() => import("../features/products/SellerPage"));
const SellersListPage = lazy(() => import("../features/sellers/SellersListPage"));
const CouponPage = lazy(() => import("../features/products/CouponPage"));
const BrowserhistoryPage = lazy(() => import("../features/profile/BrowserhistoryPage"));
const PaymentMethodPage = lazy(() => import("../features/profile/PaymentMethodPage"));
const WishListPage = lazy(() => import("../features/wishlist/WishlistPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../features/auth/ResetPasswordPage"));
const VerifyAccountPage = lazy(() => import("../features/auth/VerifyAccountPage"));
const BestSellersPage = lazy(() => import("../pages/best-sellers/BestSellersPage"));
const DealsPage = lazy(() => import("../pages/deals/DealsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const MainRoutes = () => {
  return (
    <Routes>
      <Route
        path="/order-confirmation"
        element={<OrderConfirmationPage />}
      />
    <Route
      path={PATHS.LOGIN}
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <LoginPage />
        </Suspense>
      }
    />
    <Route
      path={PATHS.REGISTER}
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <SignupPage />
        </Suspense>
      }
    />
    {/* Alias route for /register to match the link in login page */}
    <Route
      path="/register"
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <SignupPage />
        </Suspense>
      }
    />
    <Route
      path={PATHS.VERIFY_ACCOUNT}
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <VerifyAccountPage />
        </Suspense>
      }
    />
    <Route
      path={PATHS.FORGOT}
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <ForgotPasswordPage />
        </Suspense>
      }
    />
    <Route element={<MainLayout />}>
      <Route
        path="/wallet/topup-success"
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <TopupSuccessPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.HOME}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <HomePage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCTS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ProductsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SEARCH}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SearchResult />
          </Suspense>
        }
      />
      <Route
        path={PATHS.ABOUT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <AboutPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CONTACT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ContactPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SITEMAP}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SitemapPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.REFUND_POLICY}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ReturnRefundPolicyPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRIVACY}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <PrivacyPolicyPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.TERMS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <TermsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.DATA_DELETION}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <DataDeletionPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.VAT_TAX_POLICY}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <VatTaxPolicyPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCT_CARE}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ProductCarePage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PARTNER}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <PartnerPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CAREERS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CareersPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SHIPPING_POLICY}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ShippingInfoPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.NEW_ARRIVALS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <NewArrivalsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.HELP}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <HelpCenterTabsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.DEALS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <DealsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PARTNERS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <Partners />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRESS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <Press />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCTREVIEWS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ReviewPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCTREVIEWS_SINGULAR}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ReviewPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRODUCT_PLURAL}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PROMO_PRODUCT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <PromotionalProductsPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.EDITPRODUCT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path={PATHS.WISHLIST}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <WishListPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CATEGORIES}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CategoriesListPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CATEGORY}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CategoryPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CATEGORY_SINGULAR}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CategoryPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CART}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CartPage />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ResetPasswordPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SUPPORT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <CustomerSupportPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SUPPORT_TICKETS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <TicketsListPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SUPPORT_TICKET_DETAIL}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <TicketDetailPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SELLERS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SellersListPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SELLER}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SellerPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SELLER_SINGULAR}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SellerPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.BEST_SELLERS}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <BestSellersPage />
          </Suspense>
        }
      />
      //Protected routes
      <Route
        path={PATHS.CHECKOUT}
        element={
          <ProtectedRoute allowedStatuses={["active", "verified"]}>
            <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
              <CheckoutPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route element={<Dashboard />}>
        <Route
          path={PATHS.ORDERS}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <OrderList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PROFILE}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ADDRESS}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <AddressPage />
            </ProtectedRoute>
          }
        />
        {/* Short alias routes for backward compatibility */}
        <Route
          path={PATHS.ADDRESSES_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <AddressPage />
            </ProtectedRoute>
          }
        />
        {/* Refund detail route MUST come before order detail route to prevent route matching conflicts */}
        <Route
          path={PATHS.REFUND_DETAIL}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <RefundDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDER_DETAILS}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <OrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.TRACKING}
          element={
            <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
              <TrackingPage />
            </Suspense>
          }
        />
        <Route
          path={PATHS.REVIEW}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <ReviewPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.CREDIT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <Creditbalance />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.CREDIT_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <Creditbalance />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.WALLET_ADD_MONEY}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <AddMoneyPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.FOLLOWED}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <FollowPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.FOLLOWED_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <FollowPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.COUPON}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <CouponPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.COUPON_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <CouponPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BROWSER}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <BrowserhistoryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BROWSER_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <BrowserhistoryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PERMISSION}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <PermissionPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PERMISSION_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <PermissionPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PAYMENT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <PaymentMethodPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PAYMENT_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <PaymentMethodPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
    </Route>
    {/* 404 Not Found Page */}
    <Route
      path="*"
      element={
        <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
          <NotFoundPage />
        </Suspense>
      }
    />
  </Routes>
  );
};

export default MainRoutes;
