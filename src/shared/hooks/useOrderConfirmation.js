import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserOrderById } from "./useOrder";
import paymentApi from "../services/paymentApi";

/**
 * Custom hook for order confirmation page
 * Handles payment verification and order fetching with robust loop prevention
 * 
 * @param {Object|null} orderFromState - Order object passed via React Router state
 * @param {string|null} orderIdFromUrl - Order ID from URL query params
 * @param {string|null} paymentReference - Payment reference from URL query params (reference or trxref)
 * @returns {Object} Order data, loading states, and verification status
 */
export const useOrderConfirmation = (orderFromState, orderIdFromUrl, paymentReference) => {
  const queryClient = useQueryClient();
  
  // State
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerificationError, setPaymentVerificationError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'idle' | 'verifying' | 'success' | 'failed'

  // Refs to prevent infinite loops and double API calls
  const hasVerifiedRef = useRef(false);
  const verificationAttemptedRef = useRef(false);
  const queriesInvalidatedRef = useRef(false);
  
  // Store the last verified orderId + reference to prevent re-verification
  const lastVerifiedRef = useRef(null);
  
  // Store the last values to compare - prevents re-running when values are the same
  const lastOrderIdRef = useRef(null);
  const lastPaymentRefRef = useRef(null);
  const lastOrderFromStateRef = useRef(null);

  // Fetch order from API if not in state (e.g., Paystack redirect)
  const {
    data: orderFromApi,
    isLoading: isOrderLoading,
    error: orderError,
  } = useGetUserOrderById(!orderFromState && orderIdFromUrl ? orderIdFromUrl : null);

  /**
   * Payment verification effect - runs ONCE per orderId + reference combination
   * Uses localStorage to persist verification state across page refreshes
   */
  useEffect(() => {
    // STRICT: Check if values have actually changed - if not, skip immediately
    const orderIdChanged = lastOrderIdRef.current !== orderIdFromUrl;
    const paymentRefChanged = lastPaymentRefRef.current !== paymentReference;
    const orderFromStateChanged = lastOrderFromStateRef.current !== orderFromState;
    
    // If nothing changed AND we've already attempted verification, skip completely
    if (!orderIdChanged && !paymentRefChanged && !orderFromStateChanged && verificationAttemptedRef.current) {
      return;
    }
    
    // Update refs to current values BEFORE any other logic
    lastOrderIdRef.current = orderIdFromUrl;
    lastPaymentRefRef.current = paymentReference;
    lastOrderFromStateRef.current = orderFromState;
    
    // If nothing changed (but not verified yet), still skip to prevent duplicate runs
    if (!orderIdChanged && !paymentRefChanged && !orderFromStateChanged) {
      return;
    }
    
    // Early returns - no payment reference or order id
    // NOTE: If order is in state (direct navigation), we don't need to verify payment
    if (orderFromState) {
      // Reset verification flags when order comes from state
      verificationAttemptedRef.current = false;
      lastVerifiedRef.current = null;
      setVerificationStatus('idle');
      return;
    }

    if (!paymentReference || !orderIdFromUrl) {
      setVerificationStatus('idle');
      return;
    }

    // Check if we've already verified this exact combination
    const currentVerification = `${orderIdFromUrl}_${paymentReference}`;
    if (lastVerifiedRef.current === currentVerification) {
      setVerificationStatus('success');
      return;
    }

    // Persistent guard - check localStorage (survives page refresh)
    const verificationKey = `payment_verified_${orderIdFromUrl}_${paymentReference}`;
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(verificationKey);
      if (stored === "success") {
        // Payment already verified - mark as verified to prevent re-runs
        lastVerifiedRef.current = currentVerification;
        verificationAttemptedRef.current = true;
        hasVerifiedRef.current = true;
        setVerificationStatus('success');
        return;
      }
    }

    // In-memory guard - prevent multiple attempts in same session
    if (verificationAttemptedRef.current && lastVerifiedRef.current === currentVerification) {
      return;
    }

    // Execute verification
    const verifyPayment = async () => {
      // Set guards immediately - BEFORE any async operations
      verificationAttemptedRef.current = true;
      lastVerifiedRef.current = currentVerification;
      
      setIsVerifyingPayment(true);
      setPaymentVerificationError(null);
      setVerificationStatus('verifying');

      try {
        const response = await paymentApi.verifyPaystackPayment(
          paymentReference,
          orderIdFromUrl
        );

        // Mark as verified in localStorage (survives page refresh)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(verificationKey, "success");
        }
        
        hasVerifiedRef.current = true;
        setVerificationStatus('success');

        // Invalidate queries ONCE to refresh data
        if (!queriesInvalidatedRef.current) {
          queriesInvalidatedRef.current = true;
          
          // Use invalidateQueries with a delay to ensure payment is processed
          setTimeout(() => {
            // Refetch the order to get updated status
            queryClient.invalidateQueries({ 
              queryKey: ["order", orderIdFromUrl],
              exact: true,
              refetchType: 'active',
            });
            // Also invalidate orders list to update status in admin/seller pages
            queryClient.invalidateQueries({ 
              queryKey: ["orders"],
            });
            // Invalidate admin orders
            queryClient.invalidateQueries({ 
              queryKey: ["admin", "orders"],
            });
            // Invalidate seller orders
            queryClient.invalidateQueries({ 
              queryKey: ["seller", "orders"],
            });
            // Invalidate cart to ensure it's cleared
            queryClient.invalidateQueries({ 
              queryKey: ["cart"],
            });
          }, 1500); // Increased delay to ensure backend has saved
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to verify payment";
        setPaymentVerificationError(message);
        setVerificationStatus('failed');
        
        // Mark as failed in localStorage to prevent retry loops
        if (typeof window !== "undefined") {
          window.localStorage.setItem(verificationKey, "failed");
        }

        // Even on error, invalidate once to get latest order state
        if (!queriesInvalidatedRef.current) {
          queriesInvalidatedRef.current = true;
          setTimeout(() => {
            queryClient.invalidateQueries({ 
              queryKey: ["order", orderIdFromUrl],
              exact: true,
              refetchType: 'active',
            });
          }, 1000);
        }
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    verifyPayment();
    
    // Dependencies: Only include primitive values, not objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paymentReference || '', // Convert null/undefined to empty string for stable comparison
    orderIdFromUrl || '', 
    orderFromState ? 'hasState' : 'noState' // Convert object to string flag
  ]);

  return {
    // Order data
    orderFromApi,
    isOrderLoading,
    orderError,
    
    // Payment verification state
    isVerifyingPayment,
    paymentVerificationError,
    verificationStatus,
    hasVerified: hasVerifiedRef.current,
  };
};
