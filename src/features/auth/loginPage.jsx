import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaEnvelope, FaLock, FaPhone, FaArrowLeft } from "react-icons/fa";
import useAuth from '../../shared/hooks/useAuth';
import { useMergeWishlists } from '../../shared/hooks/useWishlist';
import { useCartActions } from '../../shared/hooks/useCart';
import Button from '../../shared/components/Button';
import { ErrorState } from '../../components/loading';
import storage from '../../shared/utils/storage';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';
import { sanitizeEmail, sanitizePhone, sanitizeText } from '../../shared/utils/sanitize';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [step, setStep] = useState("credentials"); // 'credentials', '2fa'
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loginSessionId, setLoginSessionId] = useState(null);
  const { mutate: merge } = useMergeWishlists();

  const { syncCart } = useCartActions();
  const { login, verify2FALogin, sendOtp, verifyOtp } = useAuth();
  const { mutate: loginMutation, isPending: isLoggingIn, error: loginError } = login;
  const { mutate: verify2FALoginMutation, isPending: isVerifying2FA, error: verify2FAError } = verify2FALogin;
  const { mutate: sendOtpMutation, isPending: isSendingOtp, error: sendOtpError } = sendOtp;
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp, error: verifyOtpError } = verifyOtp;

  // Get redirectTo from URL params or storage
  const redirectTo = searchParams.get('redirectTo') || storage.getRedirect() || '/';

  // Normalize any auth-related error into a friendly, user-facing message
  const rawAuthError = loginError || verify2FAError || sendOtpError || verifyOtpError;
  const authErrorMessage = rawAuthError
    ? (() => {
        const backendMessage =
          rawAuthError.response?.data?.message || rawAuthError.message || "";
        const lower = backendMessage.toLowerCase();

        if (lower.includes("invalid email or password")) {
          return "Invalid email or password. Please check your details and try again.";
        }

        return backendMessage || "We couldn’t sign you in. Please try again.";
      })()
    : null;

  const submitHandler = (e) => {
    e.preventDefault();

    // Clear previous field errors before validating
    setFieldErrors({
      email: "",
      password: "",
      twoFactorCode: "",
    });

    if (step === "credentials") {
      // Validate email format before submitting
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = state.email.trim().toLowerCase();

      if (!trimmedEmail) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Please enter your email address.",
        }));
        return;
      }

      if (!emailRegex.test(trimmedEmail)) {
        setFieldErrors((prev) => ({
          ...prev,
          email:
            "That doesn’t look like a valid email. Please check and try again (e.g. name@example.com).",
        }));
        return;
      }

      if (!state.password) {
        setFieldErrors((prev) => ({
          ...prev,
          password: "Please enter your password.",
        }));
        return;
      }

      // New login flow: email + password
      loginMutation(
        { email: trimmedEmail, password: state.password },
        {
          onSuccess: (response) => {
            logger.debug("[Login] onSuccess called", { 
              hasResponse: !!response,
              hasData: !!response?.data,
              status: response?.data?.status,
              is2FA: response?.data?.requires2FA || response?.data?.status === '2fa_required'
            });
            
            // Extract data from axios response
            // response is the full axios response: { data: {...}, status: 200, ... }
            const responseData = response?.data || response;

            // Check if 2FA is required
            if (responseData?.requires2FA || responseData?.status === '2fa_required') {
              logger.debug("[Login] 2FA required");
              setLoginSessionId(responseData.loginSessionId);
              setStep("2fa");
            } else {
              // Login successful - extract user from response
              // Backend returns: { status: 'success', token, user: {...} }
              // The mutation's onSuccess in useAuth.js already processed this and updated cache
              // But we need to extract user from the response here
              const user = responseData?.user;

              if (!user || (!user.id && !user._id)) {
                console.error("❌ [Login] Login successful but no user data received:", response);
                console.error("❌ [Login] Response data structure:", responseData);
                setFieldErrors((prev) => ({
                  ...prev,
                  password:
                    "Login successful but user data is missing. Please refresh the page and try again.",
                }));
                return;
              }

              logger.debug("[Login] Login successful");
              console.log('👤 [Login] User logged in:', {
                id: user.id || user._id,
                email: user.email,
                name: user.name || user.firstName,
                role: user.role,
                fullUser: user,
              });
              
              merge();
              syncCart();

              const checkoutState = storage.restoreCheckoutState();
              if (checkoutState && redirectTo === '/checkout') {
                logger.debug('[Login] Restoring checkout state');
              }

              const finalRedirect = redirectTo || '/';
              console.log('🚀 [Login] Navigating to:', finalRedirect);
              navigate(finalRedirect);

              setState({ email: "", password: "" });
            }
          },
          onError: (err) => {
            logger.error("Login failed:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            });
            
            // Extract error message from response
            const errorResponse = err.response?.data || {};
            let errorMessage =
              errorResponse.message || err.message || "Login failed. Please try again.";

            // Handle unverified account (403)
            if (err.response?.status === 403) {
              if (errorMessage.includes('not verified') || errorMessage.includes('verify')) {
                navigate('/verify-account', {
                  state: {
                    email: state.email,
                    message: errorMessage || 'Please verify your account to continue',
                  },
                });
                return;
              }
            }

            // Handle authentication errors (401) - show user-friendly message
            if (err.response?.status === 401) {
              errorMessage =
                "Invalid email or password. Please check your credentials and try again.";
            }

            // Show error message under password field
            setFieldErrors((prev) => ({
              ...prev,
              password: errorMessage,
            }));
          },
        }
      );
    } else if (step === "2fa") {
      // Verify 2FA code
      if (!twoFactorCode || twoFactorCode.length !== 6) {
        setFieldErrors((prev) => ({
          ...prev,
          twoFactorCode: "Please enter a valid 6-digit 2FA code.",
        }));
        return;
      }

      if (!loginSessionId) {
        setFieldErrors((prev) => ({
          ...prev,
          twoFactorCode: "Your login session has expired. Please sign in again.",
        }));
        setStep("credentials");
        return;
      }

      verify2FALoginMutation(
        { loginSessionId, twoFactorCode },
        {
          onSuccess: (response) => {
            logger.debug("[Login] 2FA verified, login successful");
            // Extract data from axios response
            // response is the full axios response: { data: {...}, status: 200, ... }
            const responseData = response?.data || response;
            // Backend returns: { status: 'success', token, user: {...} }
            const user = responseData?.user;
            
            if (!user || (!user.id && !user._id)) {
              console.error("❌ [2FA Login] 2FA verified but no user data received:", response);
              console.error("❌ [2FA Login] Response data structure:", responseData);
              setFieldErrors((prev) => ({
                ...prev,
                twoFactorCode:
                  "2FA verified but user data is missing. Please refresh the page and try again.",
              }));
              return;
            }
            
            console.log('👤 [2FA Login] User logged in via 2FA:', {
              id: user.id || user._id,
              email: user.email,
              name: user.name || user.firstName,
              role: user.role,
              fullUser: user,
            });
            merge();
            syncCart();

            const checkoutState = storage.restoreCheckoutState();
            if (checkoutState && redirectTo === '/checkout') {
              logger.debug('[Login] Restoring checkout state');
            }

            navigate(redirectTo || '/');
            setState({ email: "", password: "" });
            setTwoFactorCode("");
            setLoginSessionId(null);
          },
          onError: (err) => {
            logger.error("2FA verification failed:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
            });

            setFieldErrors((prev) => ({
              ...prev,
              twoFactorCode:
                "That code didn’t work. Please check the 6-digit code from your authenticator app and try again.",
            }));
          },
        }
      );
    }
  };

  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">Saiisai</BrandLogo>
          <HeroText>
            <h1>Welcome Back</h1>
            <p>Discover a world of premium products and exclusive deals.</p>
          </HeroText>
        </ImageContent>
      </ImageSection>

      <FormSection>
        <FormContainer>
          <Header>
            <h2>{step === "2fa" ? "Two-Factor Authentication" : "Sign In"}</h2>
            <p>
              {step === "2fa"
                ? "Enter your 2FA code from your authenticator app"
                : "Enter your email and password to access your account"}
            </p>
          </Header>

          {authErrorMessage && (
            <ErrorState message={authErrorMessage} />
          )}

          <StyledForm onSubmit={submitHandler}>
            {step === "credentials" ? (
              <>
                <InputGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <InputWrapper>
                    <InputIcon><FaEnvelope /></InputIcon>
                    <Input
                      type="email"
                      id="email"
                      value={state.email}
                      onChange={(e) => {
                        // Only sanitize dangerous content, allow user to type freely
                        const sanitized = sanitizeEmail(e.target.value);
                        setState({ ...state, email: sanitized });
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                      placeholder="name@example.com"
                      required
                      maxLength={255}
                      autoComplete="email"
                    />
                  </InputWrapper>
                  {fieldErrors.email && (
                    <FieldError>{fieldErrors.email}</FieldError>
                  )}
                </InputGroup>

                <InputGroup>
                  <Label htmlFor="password">Password</Label>
                  <InputWrapper>
                    <InputIcon><FaLock /></InputIcon>
                    <Input
                      type="password"
                      id="password"
                      value={state.password}
                      onChange={(e) => {
                        // Limit length but allow typing
                        const sanitized = e.target.value.slice(0, 128);
                        setState({ ...state, password: sanitized });
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: "" }));
                        }
                      }}
                      placeholder="Enter your password"
                      required
                      maxLength={128}
                      autoComplete="current-password"
                    />
                  </InputWrapper>
                  <ForgotPasswordLink to="/forgot-password">
                    Forgot password?
                  </ForgotPasswordLink>
                  {fieldErrors.password && (
                    <FieldError>{fieldErrors.password}</FieldError>
                  )}
                </InputGroup>
              </>
            ) : (
              <OtpContainer>
                <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Two-Factor Authentication</h3>
                <p style={{ marginBottom: '24px', textAlign: 'center', color: '#666' }}>
                  Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <OtpInputs>
                  {[...Array(6)].map((_, index) => {
                    const codeArray = twoFactorCode.split('').slice(0, 6);
                    return (
                      <OtpInput
                        key={index}
                        type="text"
                        maxLength={1}
                        value={codeArray[index] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length > 1) return;
                          
                          const newCodeArray = [...codeArray];
                          newCodeArray[index] = value;
                          const newCode = newCodeArray.join('');
                          setTwoFactorCode(newCode);
                          
                          if (value && index < 5) {
                            const nextInput = document.getElementById(`2fa-${index + 1}`);
                            if (nextInput) nextInput.focus();
                          }

                          if (fieldErrors.twoFactorCode) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              twoFactorCode: "",
                            }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
                            const prevInput = document.getElementById(`2fa-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        id={`2fa-${index}`}
                        autoFocus={index === 0}
                      />
                    );
                  })}
                </OtpInputs>
                {fieldErrors.twoFactorCode && (
                  <FieldError style={{ textAlign: "center" }}>
                    {fieldErrors.twoFactorCode}
                  </FieldError>
                )}
              </OtpContainer>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoggingIn || isVerifying2FA}
              disabled={step === "credentials" ? false : twoFactorCode.length < 6}
            >
              {step === "2fa" ? "Verify 2FA & Login" : "Sign In"}
            </Button>

            {step === "2fa" && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setStep("credentials");
                  setTwoFactorCode("");
                  setLoginSessionId(null);
                }}
                leftIcon={<FaArrowLeft />}
              >
                Back to Login
              </Button>
            )}
          </StyledForm>

          <Footer>
            Don't have an account? <Link to="/signup">Create account</Link>
          </Footer>
        </FormContainer>
      </FormSection>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: white;
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  
  
  @media ${devicesMax.md} {
    display: none;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
`;

const ImageContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const BrandLogo = styled(Link)`
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-decoration: none;
  letter-spacing: 1px;
`;

const HeroText = styled.div`
  color: white;
  animation: ${fadeIn} 1s ease-out;
  
  h1 {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  
  p {
    font-size: 18px;
    opacity: 0.9;
    max-width: 400px;
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
  
  @media ${devicesMax.md} {
    padding: 20px;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media ${devicesMax.sm} {
    padding: 30px 20px;
    box-shadow: none;
    background: transparent;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  text-align: center;
  
  h2 {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const FieldError = styled.span`
  color: #ef4444;
  font-size: 12px;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: right;
  margin-top: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPasswordLink = styled(Link)`
  color: #666;
  font-size: 13px;
  text-decoration: none;
  text-align: right;
  margin-top: 4px;
  
  &:hover {
    color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const OtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const OtpInputs = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const OtpInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid #eee;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }
`;

const ResendWrapper = styled.div`
  text-align: center;
`;

const ResendText = styled.span`
  color: #666;
  font-size: 14px;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 auto;
  transition: color 0.3s;
  
  &:hover {
    color: #333;
  }
`;

const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  color: #666;
  font-size: 15px;
  
  a {
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;
