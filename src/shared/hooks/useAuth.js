import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from '../services/authApi';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

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
        return response;
      } catch (error) {
        // Only clear auth data after server confirms 401 (not on network errors)
        if (error.response?.status === 401) {
          logger.warn("[useAuth] Server confirmed 401 - clearing auth data");
          // Clear any stale auth data
          queryClient.setQueryData(["auth"], null);
        } else {
          // For network errors, don't clear auth - might be temporary
          logger.warn("[useAuth] Network error (not 401) - keeping auth state");
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
    const responseData = response?.data || response;
    const user = responseData?.data?.user || responseData?.data?.data || responseData?.user || null;

    if (user) {
      // Update React Query cache with user data
      queryClient.setQueryData(["auth"], user);
      logger.log("[useAuth] User authenticated - cookie set by backend");
    }

    return user;
  };

  // Auth operations
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
      // No need to remove token from localStorage - we're using cookies now

      // Reset cart state
      queryClient.setQueryData(["cart", true], { products: [] });
      queryClient.setQueryData(["cart", false], { products: [] });
      localStorage.removeItem("guestCart");

      logger.log("[useAuth] Logged out - cookie cleared by backend");
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
  const sendPasswordResetOtp = useMutation({
    mutationFn: async (loginId) => {
      const response = await authApi.sendPasswordResetOtp(loginId);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset OTP sent:", data);
      // You can handle UI updates or state changes here
    },
    onError: (error) => {
      logger.error("Error sending password reset OTP:", error);
      // Handle error UI updates
    },
  });
  const verifyPasswordResetOtp = useMutation({
    mutationFn: async ({ loginId, otp }) => {
      const response = await authApi.verifyPasswordResetOtp(loginId, otp);
      return response;
    },
    onSuccess: (data) => {
      logger.log("Password reset OTP verified:", data);
      // Store reset token if provided by the API
      if (data.data?.resetToken) {
        localStorage.setItem("resetToken", data.data.resetToken);
      }
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
      // Clear reset token from storage
      localStorage.removeItem("resetToken");
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
