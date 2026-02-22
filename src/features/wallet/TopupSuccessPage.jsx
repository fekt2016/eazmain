import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaSpinner, FaArrowLeft, FaHome } from 'react-icons/fa';
import { useVerifyTopup, useWalletBalance } from '../../shared/hooks/useWallet';
import { LoadingState, ErrorState } from '../../components/loading';
import { toast } from 'react-toastify';
import { devicesMax } from '../../shared/styles/breakpoint';
import useAuth from '../../shared/hooks/useAuth';
import { PATHS } from '../../routes/routePaths';
import logger from '../../shared/utils/logger';

const TopupSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Try multiple query param names (Paystack might send different ones)
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const { mutate: verifyTopup, isPending, isSuccess, isError, error } = useVerifyTopup();
  const { refetch: refetchBalance } = useWalletBalance();
  const [verified, setVerified] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { userData, isLoading: authLoading, refetchAuth } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  // Use refs to prevent infinite loops - refs don't trigger re-renders
  const hasAttemptedAuthRefetchRef = useRef(false);
  const authCheckTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  // Refetch auth immediately when component mounts (after Paystack redirect)
  // This ensures the auth state is restored from cookies
  // FIX: Use ref instead of state to prevent re-render loops
  useEffect(() => {
    if (!hasAttemptedAuthRefetchRef.current) {
      hasAttemptedAuthRefetchRef.current = true;
      refetchAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // refetchAuth is stable from React Query, but we use ref guard instead
  }, []); // Empty deps - only run once on mount

  // Handle auth redirect - must be called unconditionally
  // Add a longer delay to allow auth state to restore after Paystack redirect
  // FIX: Remove navigate from deps (it's stable), use refs for timers
  useEffect(() => {
    // Clear any existing timers
    if (authCheckTimerRef.current) {
      clearTimeout(authCheckTimerRef.current);
    }
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }

    // Give auth state more time to restore after external redirect
    authCheckTimerRef.current = setTimeout(() => {
      setAuthCheckComplete(true);
      // Only redirect to login if we're absolutely certain there's no auth
      // Check multiple times with increasing delays
      if (!authLoading && !userData) {
        // Double-check after another delay
        redirectTimerRef.current = setTimeout(() => {
          if (!userData) {
            navigate('/login', { replace: true });
          }
        }, 1000);
      }
    }, 2000); // 2 second delay to allow auth restoration

    return () => {
      if (authCheckTimerRef.current) {
        clearTimeout(authCheckTimerRef.current);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [authLoading, userData]); // Removed navigate - it's stable from useNavigate

  // Payment verification - must be called unconditionally
  // Allow verification to proceed even if auth is still loading (backend verifies via cookies)
  // FIX: Use refs to prevent duplicate verification attempts, remove unstable function refs from deps
  const verificationAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Don't block verification if auth is still loading - backend will verify via cookies
    // Only block if we're certain there's no user after auth check completes
    if (authCheckComplete && !authLoading && !userData) {
      return; // Will redirect to login via useEffect above
    }

    // Prevent duplicate verification attempts
    if (verificationAttemptedRef.current) {
      return;
    }

    if (reference && !verified && !redirecting) {
      verificationAttemptedRef.current = true;
      // Verify the payment
      verifyTopup(reference, {
        onSuccess: (data) => {
          setVerified(true);
          refetchBalance();
          toast.success('Wallet top-up successful!');
          // Auto-redirect to credit balance page after 2 seconds
          setRedirecting(true);
          setTimeout(() => {
            navigate(PATHS.CREDIT, { replace: true });
          }, 2000);
        },
        onError: (error) => {
          logger.error('[TopupSuccess] Verification error:', error);
          toast.error(error?.response?.data?.message || 'Failed to verify payment');
          // Reset verification attempt flag on error to allow retry
          verificationAttemptedRef.current = false;
          // Redirect to credit balance page even on error after 3 seconds
          setRedirecting(true);
          setTimeout(() => {
            navigate(PATHS.CREDIT, { replace: true });
          }, 3000);
        },
      });
    } else if (!reference && !redirecting) {
      logger.warn('[TopupSuccess] No reference found in URL params');
      toast.error('Invalid payment reference');
      // Redirect immediately if no reference
      setRedirecting(true);
      setTimeout(() => {
        navigate(PATHS.CREDIT, { replace: true });
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Removed verifyTopup, refetchBalance, navigate from deps - they're stable or handled via refs
  }, [reference, verified, redirecting, authLoading, userData, authCheckComplete]);

  // Show loading while checking auth (but allow payment verification to proceed)
  // Only show loading if we're still waiting for initial auth check
  // FIX: Use ref instead of state
  if (!hasAttemptedAuthRefetchRef.current || (authLoading && !authCheckComplete)) {
    return (
      <PageContainer>
        <ContentCard>
          <LoadingState message="Loading..." />
        </ContentCard>
      </PageContainer>
    );
  }

  // Only redirect to login if we're absolutely certain user is not authenticated
  // (after auth check completes and we've confirmed no user)
  if (authCheckComplete && !authLoading && !userData) {
    return (
      <PageContainer>
        <ContentCard>
          <LoadingState message="Redirecting to login..." />
        </ContentCard>
      </PageContainer>
    );
  }

  if (isPending) {
    return (
      <PageContainer>
        <ContentCard>
          <LoadingState message="Verifying your payment..." />
        </ContentCard>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <ContentCard>
          <ErrorIcon $error>
            <FaSpinner />
          </ErrorIcon>
          <Title $error>Verification Failed</Title>
          <Message>
            {error?.response?.data?.message || 'Failed to verify your payment. Please contact support if the amount was deducted from your account.'}
          </Message>
          <ButtonGroup>
            <Button onClick={() => navigate(PATHS.CREDIT)} $secondary>
              <FaArrowLeft />
              Back to Wallet
            </Button>
            <Button onClick={() => verifyTopup(reference)} $primary>
              Try Again
            </Button>
          </ButtonGroup>
        </ContentCard>
      </PageContainer>
    );
  }

  if (isSuccess && verified) {
    return (
      <PageContainer>
        <ContentCard>
          <SuccessIcon>
            <FaCheckCircle />
          </SuccessIcon>
          <Title>Payment Successful!</Title>
          <Message>
            Your wallet has been credited successfully. The funds are now available in your account.
            <br />
            <RedirectMessage>Redirecting to wallet page...</RedirectMessage>
          </Message>
          <ButtonGroup>
            <Button onClick={() => navigate(PATHS.CREDIT)} $primary>
              <FaHome />
              Go to Wallet Now
            </Button>
            <Button onClick={() => navigate('/')} $secondary>
              Continue Shopping
            </Button>
          </ButtonGroup>
        </ContentCard>
      </PageContainer>
    );
  }

  return null;
};

export default TopupSuccessPage;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 4rem 3rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 500px;
  width: 100%;

  @media ${devicesMax.sm} {
    padding: 3rem 2rem;
  }
`;

const SuccessIcon = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--color-green-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;

  svg {
    color: var(--color-green-700);
    font-size: 4rem;
  }
`;

const ErrorIcon = styled.div`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: var(--color-red-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;

  svg {
    color: var(--color-red-700);
    font-size: 4rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: ${(props) => (props.$error ? 'var(--color-red-700)' : 'var(--color-grey-900)')};
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  line-height: 1.6;
  margin-bottom: 3rem;
`;

const RedirectMessage = styled.span`
  display: block;
  margin-top: 1rem;
  font-size: 1.4rem;
  color: var(--primary-700);
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 1.2rem 2.4rem;
  border-radius: var(--border-radius-md);
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s;
  border: none;

  ${(props) =>
    props.$primary
      ? `
    background: var(--color-primary-600);
    color: white;
    
    &:hover {
      background: var(--color-primary-700);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  `
      : `
    background: white;
    color: var(--color-grey-700);
    border: 2px solid var(--color-grey-300);
    
    &:hover {
      background: var(--color-grey-50);
      border-color: var(--color-grey-400);
    }
  `}

  svg {
    font-size: 1.4rem;
  }
`;

