import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from '../services/authApi';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logger from '../utils/logger';

const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading: isUserLoading,
    error: authError,
    refetch: refetchAuth,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        // Cookie is automatically sent by browser via withCredentials: true
        // No need to read from localStorage
        const response = await authApi.getCurrentUser();
        logger.log("[useAuth] getCurrentUser response:", { 
          hasResponse: !!response,
          hasData: !!response?.data,
          status: response?.data?.status 
        });
        // getCurrentUser returns axios response: { data: { status: 'success', data: {...user} } }
        // Extract user from response.data.data (backend structure) or response.data (if already extracted)
        const responseData = response?.data || response;
        const user = responseData?.data || responseData?.user || responseData;
        logger.log("[useAuth] getCurrentUser extracted user:", { 
          hasUser: !!user,
          hasPhoto: !!user?.photo,
          userId: user?.id || user?._id
        });
        return user;
      } catch (error) {
        // Only clear auth data after server confirms 401 (not on network errors)
        // FIX: Do NOT clear auth on notification endpoint failures
        // Notification endpoints might fail due to cookie issues, but user might still be authenticated
        if (error.response?.status === 401) {
          // Check if this is a notification endpoint error (flagged in api.js)
          if (error.isNotificationError) {
            // 401 on notification endpoint = might be cookie issue, not auth failure
            if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
              logger.debug("[useAuth] 401 on notification endpoint - NOT clearing auth data");
              logger.debug("[useAuth] User session may still be valid. Cookie might not be sent properly.");
            }
            // CRITICAL FIX: Return cached user data instead of null
            // This prevents ProtectedRoute from redirecting when notification endpoints fail
            const cachedUser = queryClient.getQueryData(["auth"]);
            if (cachedUser) {
              if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
                logger.debug("[useAuth] Returning cached user data despite notification endpoint failure");
              }
              return cachedUser;
            }
            // If no cached data, return null but don't clear cache
            return null;
          }

          // Only clear auth for actual auth endpoint failures
          const url = error.config?.url || '';
          const isAuthEndpoint = url.includes('/auth/me') || url.includes('/auth/current-user');
          
          if (isAuthEndpoint) {
            // 401 on auth endpoint = user is not authenticated (normal state, not an error)
            if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
              logger.debug("[useAuth] User unauthenticated (401) on auth endpoint - clearing auth data");
            }
            // Clear any stale auth data
            queryClient.setQueryData(["auth"], null);
          } else {
            // 401 on non-auth endpoint = might be temporary or session issue
            if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
              logger.debug("[useAuth] 401 on non-auth endpoint - NOT clearing auth data");
              logger.debug("[useAuth] Endpoint:", url);
            }
            // CRITICAL FIX: Return cached user data for non-auth endpoint failures
            // This prevents ProtectedRoute from redirecting when other endpoints fail
            const cachedUser = queryClient.getQueryData(["auth"]);
            if (cachedUser) {
              if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
                logger.debug("[useAuth] Returning cached user data despite non-auth endpoint failure");
              }
              return cachedUser;
            }
          }
        } else {
          // For network errors, don't clear auth - might be temporary
          if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
            logger.debug("[useAuth] Network error (not 401) - keeping auth state");
          }
          // CRITICAL FIX: Return cached user data on network errors
          // This prevents ProtectedRoute from redirecting during network issues
          const cachedUser = queryClient.getQueryData(["auth"]);
          if (cachedUser) {
            logger.warn("[useAuth] Returning cached user data during network error");
            return cachedUser;
          }
        }

        return null;
      }
    },

    // Increase cache time to reduce frequent refetches
    staleTime: 1000 * 60 * 5, // 5 minutes (was 1 minute)
    
    retry: (failureCount, error) => {
      // Retry network errors, but not 401s (server confirmed auth failure)
      if (error?.response?.status === 401) {
        return false; // Don't retry 401s
      }
      return failureCount < 2; // Retry network errors up to 2 times
    },

    // Reduce refetch frequency to prevent unnecessary auth checks
    refetchOnWindowFocus: false, // Was true - caused frequent refetches
    // Refetch on mount to ensure fresh data after login
    refetchOnMount: true,
  });

  // Profile data management
  // Extract user ID from userData (handle nested structures)
  const userId = userData?.id || userData?.data?.id || userData?.data?.data?.id || userData?._id || userData?.data?._id || userData?.data?.data?._id;
  
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await authApi.getProfile();
        return response?.data?.data;
      } catch (error) {
        logger.error("Error fetching profile:", error);
        throw error; // Propagate error to React Query
      }
    },
    enabled: !!userId && !isUserLoading,
    staleTime: 1000 * 60 * 5,
  });

  // Common auth success handler
  // Note: Token is now stored in HTTP-only cookie, not localStorage
  const handleAuthSuccess = (response) => {
    // Extract user from response (token is in cookie, not in response)
    // authApi.login returns axios response, so response.data contains backend response
    // Backend returns: { status: 'success', token, user: {...} }
    const responseData = response?.data || response;
    const user = responseData?.user || responseData?.data?.user || null;

    if (user) {
      // Update React Query cache with user data
      // Match the structure that getCurrentUser returns: { status: 'success', data: {...user} }
      // But we'll store just the user object to match what Header expects
      queryClient.setQueryData(["auth"], user);
      // Invalidate and refetch auth query to ensure fresh data (including avatar)
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      // Also refetch to ensure cookie is read and state is synced
      queryClient.refetchQueries({ queryKey: ["auth"] });
      logger.log("[useAuth] User authenticated - cookie set by backend", { 
        userId: user.id || user._id,
        hasPhoto: !!user.photo,
        photo: user.photo 
      });
      // Console log user data for debugging
      console.log('👤 [Login] User logged in:', {
        id: user.id || user._id,
        email: user.email,
        name: user.name || user.firstName,
        role: user.role,
        photo: user.photo,
        fullUser: user,
      });
    } else {
      logger.warn("[useAuth] handleAuthSuccess: No user data found in response", response);
      console.warn("⚠️ [Login] No user data in response:", response);
      console.warn("⚠️ [Login] Full response structure:", JSON.stringify(response, null, 2));
    }

    return user;
  };

  // Auth operations
  const login = useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (response) => {
      logger.log("[useAuth] Login mutation onSuccess called", { 
        hasData: !!response?.data,
        status: response?.data?.status,
        hasUser: !!response?.data?.user 
      });
      
      // Check if 2FA is required
      if (response?.data?.requires2FA || response?.data?.status === '2fa_required') {
        logger.log("[useAuth] 2FA required for login");
        return { requires2FA: true, ...response.data };
      }
      
      // Login successful - handle normally
      const user = handleAuthSuccess(response);
      
      if (!user) {
        logger.error("[useAuth] Login successful but no user data extracted", response);
        console.error("❌ [Login] Login successful but no user data found in response:", response);
      } else {
        // Refetch notifications after successful login
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        logger.log("[useAuth] Notifications invalidated after login");
      }
      
      return user;
    },
    onError: (error) => {
      logger.error("[useAuth] Login mutation error", error);
      console.error("❌ [Login] Login mutation error:", error);
    },
  });

  const verify2FALogin = useMutation({
    mutationFn: ({ loginSessionId, twoFactorCode }) => 
      authApi.verify2FALogin(loginSessionId, twoFactorCode),
    onSuccess: (response) => {
      const user = handleAuthSuccess(response);
      // Additional logging for 2FA login
      if (user) {
        console.log('👤 [2FA Login] User logged in via 2FA:', {
          id: user.id || user._id,
          email: user.email,
          name: user.name || user.firstName,
          role: user.role,
          fullUser: user,
        });
        // Refetch notifications after successful 2FA login
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        logger.log("[useAuth] Notifications invalidated after 2FA login");
      }
      return user;
    },
  });

  const sendOtp = useMutation({
    mutationFn: (loginId) => authApi.sendOtp(loginId),
    onSuccess: handleAuthSuccess,
  });

  const verifyOtp = useMutation({
    mutationFn: ({ loginId, otp, password, redirectTo = '/' }) =>
      authApi.verifyOtp(loginId, otp, password, redirectTo),
    onSuccess: (response) => {
      // Extract user and redirectTo from response
      const responseData = response?.data || response;
      const user = responseData?.data?.user || responseData?.data?.data || responseData?.user || null;
      const redirectTo = responseData?.redirectTo || '/';

      if (user) {
        // Set query data immediately for instant UI update
        queryClient.setQueryData(["auth"], user);
        
        // Invalidate and refetch queries to ensure fresh data (including avatar)
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        
        // Refetch immediately to get latest user data including avatar
        queryClient.refetchQueries({ queryKey: ["auth"] });
        queryClient.refetchQueries({ queryKey: ["profile"] });
        
        logger.log("[useAuth] OTP verified - cookie set by backend, queries invalidated");
      }

      // Return redirectTo for navigation
      return { user, redirectTo };
    },
  });

  const register = useMutation({
    mutationFn: async (registerData) => {
      logger.log("registerData:", registerData);
      const response = await authApi.register(registerData);
      return response;
    },
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      logger.log(error);
    },
  });
  const emailVerification = useMutation({
    mutationFn: async (email) => {
      logger.log(email);
      const response = await authApi.emailVerification(email);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Email verification sent:", data);
      // Optionally, you can handle UI updates or state changes here
    },
  });

  // ✅ New: Verify account with OTP (for signup verification)
  const verifyAccount = useMutation({
    mutationFn: ({ email, phone, otp }) => authApi.verifyAccount(email, phone, otp),
    onSuccess: () => {
      // Invalidate auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // ✅ New: Resend OTP
  const resendOtp = useMutation({
    mutationFn: ({ email, phone }) => authApi.resendOtp(email, phone),
    onError: (error) => {
      logger.log("Error sending email verification:", error);
      // Optionally, you can handle UI updates or state changes here
    },
  });
  const resendVerification = useMutation({
    mutationFn: async ({ email }) =>
      await authApi.resendVerification({ email }),
    onSuccess: (data) => {
      logger.log("Email verification sent:", data);
      // Optionally, you can handle UI updates or state changes here
    },
    onError: (error) => {
      logger.error("Error sending email verification:", error);
      // Optionally, you can handle UI updates or state changes here
    },
  });
  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Backend clears the cookie, we just clear local state
      queryClient.removeQueries(["auth"]);
      queryClient.removeQueries(["profile"]);
      // SECURITY: Clear notification cache and cancel active queries on logout
      queryClient.removeQueries(["notifications"]);
      queryClient.removeQueries(["notification-settings"]);
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.cancelQueries({ queryKey: ["notification-settings"] });
      // No need to remove token from localStorage - we're using cookies now

      // Reset cart state
      queryClient.setQueryData(["cart", true], { products: [] });
      queryClient.setQueryData(["cart", false], { products: [] });
      localStorage.removeItem("guestCart");

      logger.log("[useAuth] Logged out - cookie cleared by backend, notification cache cleared");
      navigate("/");
    },
  });

  // Profile operations
  const updateProfile = useMutation({
    mutationFn: (profileData) => authApi.updateProfile(profileData),
    onSuccess: (data) => {
      logger.log("Profile updated:", data);
    },
  });

  const changePassword = useMutation({
    mutationFn: async (passwords) => {
      try {
        const response = await authApi.changePassword(passwords);
        return response;
      } catch (error) {
        logger.error("Error changing password:", error);
        throw error; // Propagate error to React Query
      }
    },
    onSuccess: () => {
      logger.log("Password changed successfully");
    },
  });

  const deactivateAccount = useMutation({
    mutationFn: async () => {
      try {
        const response = await authApi.deactivateAccount();
        return response;
      } catch (error) {
        logger.error("Error deactivating account:", error);
        throw error; // Propagate error to React Query
      }
    },
    onSuccess: () => {
      queryClient.removeQueries(["auth"]);
      queryClient.removeQueries(["profile"]);
      // No need to remove token from localStorage - we're using cookies now
      logger.log("[useAuth] Account deactivated - cookie cleared by backend");
      navigate("/");
    },
  });

  // Two-Factor Authentication
  const enableTwoFactor = useMutation({
    mutationFn: () => authApi.enableTwoFactor(),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        securitySettings: {
          ...old.securitySettings,
          twoFactorEnabled: true,
          ...data.data?.securitySettings,
        },
      }));
    },
  });

  const verifyTwoFactor = useMutation({
    mutationFn: (token) => authApi.verifyTwoFactor(token),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        securitySettings: {
          ...old.securitySettings,
          ...data.data?.securitySettings,
        },
      }));
    },
  });

  const disableTwoFactor = useMutation({
    mutationFn: () => authApi.disableTwoFactor(),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        securitySettings: {
          ...old.securitySettings,
          twoFactorEnabled: false,
          ...data.data?.securitySettings,
        },
      }));
    },
  });

  // Session management
  const useSessionManagement = () => {
    const {
      data: sessions,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["sessions"],
      queryFn: () => authApi.getActiveSessions(),
      enabled: !!userData,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const revokeSession = useMutation({
      mutationFn: (sessionId) => authApi.revokeSession(sessionId),
      onSuccess: () => {
        queryClient.invalidateQueries(["sessions"]);
      },
    });

    return {
      sessions,
      isLoading,
      error,
      revokeSession,
    };
  };

  // Seller operations
  const becomeSeller = useMutation({
    mutationFn: (sellerData) => authApi.becomeSeller(sellerData),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth"], (old) => ({
        ...old,
        role: "seller",
        ...data.data?.data,
      }));
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        userInfo: {
          ...old.userInfo,
          role: "seller",
          ...data.data?.data,
        },
      }));
    },
  });

  // Social account connections
  const connectSocialAccount = useMutation({
    mutationFn: (provider) => authApi.connectSocial(provider),
    onSuccess: (data, provider) => {
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        connectedAccounts: {
          ...old.connectedAccounts,
          [provider]: true,
        },
      }));
    },
  });

  const disconnectSocialAccount = useMutation({
    mutationFn: (provider) => authApi.disconnectSocial(provider),
    onSuccess: (data, provider) => {
      queryClient.setQueryData(["profile", userData.id], (old) => ({
        ...old,
        connectedAccounts: {
          ...old.connectedAccounts,
          [provider]: false,
        },
      }));
    },
  });
  const uploadAvatar = useMutation({
    mutationFn: async (avatar) => {
      const response = await authApi.uploadAvatar(avatar);
      return response;
    },
    onSuccess: (data) => {
      logger.log("photo successfully uploaded", data);
      
      // Extract updated user from response (backend returns: { status: 'success', data: { user: {...} } })
      const updatedUser = data?.data?.data?.user || data?.data?.user || data?.user;
      const photo = updatedUser?.photo;
      
      if (photo) {
        // Update auth cache immediately - handle different response structures
        queryClient.setQueryData(["auth"], (oldData) => {
          if (!oldData) {
            // If no old data, return the updated user in the expected format
            return updatedUser;
          }
          
          // Handle nested structures from getCurrentUser response
          // getCurrentUser returns: { status: 'success', data: {...user} }
          if (oldData?.data?.data) {
            // Structure: { data: { data: user } }
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: {
                  ...oldData.data.data,
                  photo: photo,
                },
              },
            };
          }
          if (oldData?.data) {
            // Structure: { data: user }
            return {
              ...oldData,
              data: {
                ...oldData.data,
                photo: photo,
              },
            };
          }
          // Structure: user object directly
          return {
            ...oldData,
            photo: photo,
          };
        });
        
        // Update profile cache immediately
        queryClient.setQueryData(["profile"], (oldData) => {
          if (!oldData) return null;
          
          return {
            ...oldData,
            userInfo: {
              ...oldData.userInfo,
              photo: photo,
            },
          };
        });
        
        // Invalidate queries to trigger refetch in background (for consistency)
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
  // ==================================================
  // UNIFIED EMAIL-ONLY PASSWORD RESET FLOW
  // ==================================================
  
  /**
   * Request Password Reset (Email Only)
   * Sends reset link to user's email
   */
  const requestPasswordReset = useMutation({
    mutationFn: async (email) => {
      const response = await authApi.requestPasswordReset(email);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset request sent:", data);
    },
    onError: (error) => {
      logger.error("Error requesting password reset:", error);
    },
  });

  /**
   * Reset Password with Token
   * Resets password using token from email link
   */
  const resetPasswordWithToken = useMutation({
    mutationFn: async ({ token, newPassword, confirmPassword }) => {
      const response = await authApi.resetPasswordWithToken(
        token,
        newPassword,
        confirmPassword
      );
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset successful:", data);
      // Navigate to login page with success message
      navigate("/login", {
        state: {
          message:
            "Password reset successfully. Please login with your new password.",
        },
      });
    },
    onError: (error) => {
      logger.error("Error resetting password:", error);
    },
  });

  // Legacy OTP-based methods (deprecated - kept for backward compatibility)
  const sendPasswordResetOtp = useMutation({
    mutationFn: async (loginId) => {
      const response = await authApi.sendPasswordResetOtp(loginId);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset OTP sent:", data);
    },
    onError: (error) => {
      logger.error("Error sending password reset OTP:", error);
    },
  });
  const verifyPasswordResetOtp = useMutation({
    mutationFn: async ({ loginId, otp }) => {
      const response = await authApi.verifyPasswordResetOtp(loginId, otp);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset OTP verified:", data);
    },
    onError: (error) => {
      logger.error("Error verifying password reset OTP:", error);
    },
  });
  const resetPassword = useMutation({
    mutationFn: async ({ loginId, newPassword, resetToken }) => {
      const response = await authApi.resetPassword(
        loginId,
        newPassword,
        resetToken
      );
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset successful:", data);
      navigate("/login", {
        state: {
          message:
            "Password reset successfully. Please login with your new password.",
        },
      });
    },
    onError: (error) => {
      logger.error("Error resetting password:", error);
    },
  });

  return {
    // Auth state
    userData,
    profileData,

    authError,
    profileError,
    uploadAvatar,
    isAuthenticated: !!userData,
    isAdmin: userData?.role === "admin",
    isSeller: userData?.role === "seller",
    isBuyer: !userData?.role || userData?.role === "buyer",

    // Auth operations
    login,
    verify2FALogin,
    sendOtp,
    verifyOtp,
    register,
    emailVerification,
    resendVerification,
    verifyAccount, // ✅ New: Verify account with OTP
    resendOtp, // ✅ New: Resend OTP
    logout,
    refetchAuth,
    // refetchProfile,

    //password reset
    // Unified email-only password reset
    requestPasswordReset,
    resetPasswordWithToken,
    // Legacy OTP-based (deprecated)
    sendPasswordResetOtp,
    resetPassword,
    verifyPasswordResetOtp,

    // Profile operations
    updateProfile,
    changePassword,
    deactivateAccount,

    // Two-Factor Authentication
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,

    // Seller operations
    becomeSeller,

    // Social accounts
    connectSocialAccount,
    disconnectSocialAccount,

    // Session management
    useSessionManagement,

    // Loading states
    isLoading: isUserLoading || isProfileLoading,
    isAuthLoading: isUserLoading,
    isProfileLoading,

    // Granular loading states
    isLoggingIn: login.isPending,
    isVerifying2FALogin: verify2FALogin.isPending,
    isUpdatingProfile: updateProfile.isPending,
    isChangingPassword: changePassword.isPending,
    isDeactivatingAccount: deactivateAccount.isPending,
    isEnabling2FA: enableTwoFactor.isPending,
    isVerifying2FA: verifyTwoFactor.isPending,
    isDisabling2FA: disableTwoFactor.isPending,
    isBecomingSeller: becomeSeller.isPending,

    // Error states
    updateProfileError: updateProfile.error,
    passwordError: changePassword.error,
    deactivationError: deactivateAccount.error,
    twoFactorError:
      enableTwoFactor.error || verifyTwoFactor.error || disableTwoFactor.error,
    sellerError: becomeSeller.error,
    socialError: connectSocialAccount.error || disconnectSocialAccount.error,
  };
};

export default useAuth;
