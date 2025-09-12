import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./routePaths";
import ContactUs from "../pages/ContactUs";

const SearchResult = lazy(() => import("../pages/SearchResult"));
const Partners = lazy(() => import("../pages/Partners"));
const Aboutus = lazy(() => import("../pages/Aboutus"));
const NotificationPage = lazy(() => import("../pages/NotificationPage"));
const PermissionPage = lazy(() => import("../pages/PermissionPage"));
const FollowPage = lazy(() => import("../pages/FollowPage"));
const Creditbalance = lazy(() => import("../pages/Creditbalance"));
const AddressPage = lazy(() => import("../pages/AddressPage"));
const SignupPage = lazy(() => import("../auth/SignupPage"));
const LoginPage = lazy(() => import("../auth/loginPage"));
const ProtectedRoute = lazy(() => import("../routes/ProtectedRoute"));
const MainLayout = lazy(() => import("../layout/MainLayout"));
const LoadingSpinner = lazy(() => import("../components/LoadingSpinner"));
const HomePage = lazy(() => import("../pages/HomePage"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() =>
  import("../pages/OrderConfirmationPage")
);
// const ForgetPasswordPage = lazy(() => import("../auth/ForgotPasswordPage"));

const ProfilePage = lazy(() => import("../pages/profilePage"));
const SupportPage = lazy(() => import("../pages/SupportPage"));
const OrderList = lazy(() => import("../pages/OrderList"));
const OrderDetail = lazy(() => import("../pages/OrderDetail"));
const ReviewPage = lazy(() => import("../pages/ReviewPage"));
const Dashboard = lazy(() => import("../layout/Dashboard"));
const SellerPage = lazy(() => import("../pages/SellerPage"));
const CouponPage = lazy(() => import("../pages/CouponPage"));
const BrowserhistoryPage = lazy(() => import("../pages/BrowserhistoryPage"));
const PaymentMethodPage = lazy(() => import("../pages/PaymentMethodPage"));
const WishListPage = lazy(() => import("../pages/WishlistPage"));
const ForgotPasswordPage = lazy(() => import("../auth/ForgotPasswordPage"));
const MainRoutes = () => (
  <Routes>
    <Route
      path={PATHS.LOGIN}
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <LoginPage />
        </Suspense>
      }
    />
    <Route
      path={PATHS.REGISTER}
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <SignupPage />
        </Suspense>
      }
    />
    <Route element={<MainLayout />}>
      <Route
        path={PATHS.HOME}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SEARCH}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SearchResult />
          </Suspense>
        }
      />
      <Route
        path={PATHS.ABOUT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Aboutus />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CONTACT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactUs />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SITEMAP}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactUs />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PARTNERS}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Partners />
          </Suspense>
        }
      />
      <Route
        path={PATHS.PRESS}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactUs />
          </Suspense>
        }
      />
      ROUTES
      <Route
        path={PATHS.PRODUCT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path={PATHS.EDITPRODUCT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path={PATHS.WISHLIST}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <WishListPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CATEGORY}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.CART}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CartPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.FORGOT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SUPPORT}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SupportPage />
          </Suspense>
        }
      />
      <Route
        path={PATHS.SELLER}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SellerPage />
          </Suspense>
        }
      />
      //Protected routes
      <Route
        path={PATHS.CHECKOUT}
        element={
          <ProtectedRoute allowedStatuses={["active", "verified"]}>
            <Suspense fallback={<LoadingSpinner />}>
              <CheckoutPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.ORDER_CONFIRMATION}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <OrderConfirmationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route element={<Dashboard />}>
        <Route
          path={PATHS.PROFILE}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDER}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <OrderList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ADDRESS}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <AddressPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.ORDER_DETAILS}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <OrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.REVIEW}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <ReviewPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.CREDIT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <Creditbalance />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.FOLLOWED}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <FollowPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.COUPON}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <CouponPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.BROWSER}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <BrowserhistoryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PERMISSION}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <PermissionPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.NOTIFICATION}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <NotificationPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PAYMENT}
          element={
            <ProtectedRoute allowedStatuses={["active", "verified"]}>
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentMethodPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
    </Route>
  </Routes>
);

export default MainRoutes;
