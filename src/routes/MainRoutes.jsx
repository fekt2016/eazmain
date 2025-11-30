import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./routePaths";
import ContactUs from '../features/profile/ContactUs';
import { PageSpinner, SpinnerContainer } from "../components/loading";
// Import OrderConfirmationPage directly (not lazy) to ensure it loads immediately
import OrderConfirmationPage from "../features/orders/OrderConfirmationPage";

const SearchResult = lazy(() => import("../features/search/SearchResult"));
const Partners = lazy(() => import("../features/Partners"));
const Aboutus = lazy(() => import("../features/profile/Aboutus"));
const NotificationPage = lazy(() => import("../features/profile/NotificationPage"));
const PermissionPage = lazy(() => import("../features/profile/PermissionPage"));
const FollowPage = lazy(() => import("../features/profile/FollowPage"));
const Creditbalance = lazy(() => import("../features/profile/Creditbalance"));
const AddressPage = lazy(() => import("../features/profile/AddressPage"));
const SignupPage = lazy(() => import("../features/auth/SignupPage"));
const LoginPage = lazy(() => import("../features/auth/loginPage"));
const ProtectedRoute = lazy(() => import("../routes/ProtectedRoute"));
const MainLayout = lazy(() => import("../shared/layout/MainLayout"));
const HomePage = lazy(() => import("../features/products/HomePage"));
const ProductDetail = lazy(() => import("../features/products/ProductDetail"));
const ProductsPage = lazy(() => import("../features/products/ProductsPage"));
const CategoryPage = lazy(() => import("../features/categories/CategoryPage"));
const CategoriesListPage = lazy(() => import("../features/categories/CategoriesListPage"));
const CartPage = lazy(() => import("../features/cart/CartPage"));
const CheckoutPage = lazy(() => import("../features/orders/CheckoutPage"));
// const ForgetPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));

const ProfilePage = lazy(() => import("../features/profile/profilePage"));
const SupportPage = lazy(() => import("../features/SupportPage"));
const OrderList = lazy(() => import("../features/orders/OrderList"));
const OrderDetail = lazy(() => import("../features/orders/OrderDetail"));
const TrackingPage = lazy(() => import("../features/orders/TrackingPage"));
const ReviewPage = lazy(() => import("../features/products/ReviewPage"));
const Dashboard = lazy(() => import("../shared/layout/Dashboard"));
const SellerPage = lazy(() => import("../features/products/SellerPage"));
const SellersListPage = lazy(() => import("../features/sellers/SellersListPage"));
const CouponPage = lazy(() => import("../features/products/CouponPage"));
const BrowserhistoryPage = lazy(() => import("../features/profile/BrowserhistoryPage"));
const PaymentMethodPage = lazy(() => import("../features/profile/PaymentMethodPage"));
const WishListPage = lazy(() => import("../features/wishlist/WishlistPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));
const MainRoutes = () => {
  // Debug: Log route matching on mount and when pathname changes
  

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
    <Route element={<MainLayout />}>
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
            <Aboutus />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CONTACT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ContactUs />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SITEMAP}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ContactUs />
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
            <ContactUs />
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
        path={PATHS.FORGOT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SUPPORT}
        element={
          <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
            <SupportPage />
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
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <AddressPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        {/* Short alias routes for backward compatibility */}
        <Route
          path={PATHS.ADDRESSES_SHORT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <AddressPage />
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
          path={PATHS.NOTIFICATION}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>
                <NotificationPage />
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
    {/* Catch-all route for debugging - should never match if order-confirmation route works */}
    <Route
      path="*"
      element={
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>404 - Route Not Found</h1>
          <p>Current pathname: {window.location.pathname}</p>
          <p>Current search: {window.location.search}</p>
          <p>Full URL: {window.location.href}</p>
          <p style={{ color: 'red', marginTop: '20px' }}>
            If you expected to see the order confirmation page, the route may not be matching correctly.
          </p>
          <p style={{ marginTop: '10px' }}>
            Expected route: <code>/order-confirmation</code>
          </p>
        </div>
      }
    />
  </Routes>
  );
};

export default MainRoutes;
