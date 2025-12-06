import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaEnvelope, FaLock, FaPhone, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
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
    loginId: "",
    password: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  // SECURITY: OTP rate limiting - prevent spam resend attempts
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const MAX_RESEND_ATTEMPTS = 5; // Max 5 resend attempts per hour
  const RESEND_COOLDOWN_SECONDS = 60; // 60 second cooldown between resends
  const { mutate: merge } = useMergeWishlists();

  const { syncCart } = useCartActions();
  const { sendOtp, verifyOtp } = useAuth();
  const { mutate: sendOtpMutation, isPending: isSendingOtp, error: sendOtpError } = sendOtp;
  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp, error: verifyOtpError } = verifyOtp;

  // Get redirectTo from URL params or storage
  const redirectTo = searchParams.get('redirectTo') || storage.getRedirect() || '/';

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // SECURITY: OTP resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (step === "credentials") {
      sendOtpMutation(state.loginId, {
        onSuccess: () => {
          setStep("otp");
          setOtpCountdown(120);
        },
        onError: (err) => {
          logger.error("OTP send failed:", err.message);
        },
      });
    } else {
      // Ensure OTP is a string and not empty
      const otpString = typeof otp === 'string' ? otp : (Array.isArray(otp) ? otp.join('') : String(otp || ''));
      
      if (!otpString || otpString.length !== 6) {
        logger.error("[Login] Invalid OTP format:", { otp, otpString, type: typeof otp });
        return;
      }
      
      verifyOtpMutation(
        {
          loginId: state.loginId,
          otp: otpString,
          password: state.password,
          redirectTo,
        },
        {
          onSuccess: (data) => {
            logger.debug("[Login] OTP verified successfully");

            merge();
            syncCart();

            const checkoutState = storage.restoreCheckoutState();
            if (checkoutState && redirectTo === '/checkout') {
              logger.debug('[Login] Restoring checkout state');
            }

            const finalRedirect = data?.redirectTo || redirectTo || '/';
            navigate(finalRedirect);

            setState({ loginId: "", password: "" });
            setOtp("");
          },
          onError: (err) => {
            logger.error("OTP verification failed:", {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
              code: err.code,
              config: err.config,
            });
            
            // Handle network errors
            if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
              logger.error("[Login] Network error - backend may be down or CORS issue");
              // You might want to show a toast/alert here
              return;
            }
            
            // ✅ Handle unverified account - redirect to verification page
            if (err.response?.status === 403) {
              const errorMessage = err.response?.data?.message || err.message;
              if (errorMessage.includes('not verified') || errorMessage.includes('verify')) {
                // Extract email or phone from loginId
                const isEmail = state.loginId.includes('@');
                navigate('/verify-account', {
                  state: {
                    email: isEmail ? state.loginId : null,
                    phone: !isEmail ? state.loginId : null,
                    message: errorMessage || 'Please verify your account to continue',
                  },
                });
                return;
              }
            }
          },
        }
      );
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setState({ ...state, loginId: "" });
  };

  const handleResendOtp = () => {
    // SECURITY: Rate limiting - prevent spam resend attempts
    if (resendCooldown > 0) {
      toast.warn(`Please wait ${resendCooldown} seconds before resending OTP`);
      return;
    }

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      toast.error('Too many resend attempts. Please try again later.');
      return;
    }

    sendOtpMutation(state.loginId, {
      onSuccess: () => {
        setOtpCountdown(120);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setResendAttempts((prev) => prev + 1);
        toast.success('OTP resent successfully');
      },
      onError: (err) => {
        logger.error("Resend OTP failed:", err.message);
        // SECURITY: Generic error message - don't reveal system details
        toast.error('Unable to resend OTP. Please try again later.');
      },
    });
  };

  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">EazShop</BrandLogo>
          <HeroText>
            <h1>Welcome Back</h1>
            <p>Discover a world of premium products and exclusive deals.</p>
          </HeroText>
        </ImageContent>
      </ImageSection>

      <FormSection>
        <FormContainer>
          <Header>
            <h2>{step === "otp" ? "Verify Identity" : "Sign In"}</h2>
            <p>
              {step === "otp"
                ? `Enter the code sent to your ${loginMethod}`
                : "Enter your details to access your account"}
            </p>
          </Header>

          {(sendOtpError || verifyOtpError) && (
            <ErrorState message={(sendOtpError || verifyOtpError)?.message || "Authentication failed"} />
          )}

          <StyledForm onSubmit={submitHandler}>
            {step === "credentials" ? (
              <>
                <InputGroup>
                  <Label htmlFor="loginId">
                    {loginMethod === "email" ? "Email Address" : "Phone Number"}
                  </Label>
                  <InputWrapper>
                    <InputIcon>
                      {loginMethod === "email" ? <FaEnvelope /> : <FaPhone />}
                    </InputIcon>
                    <Input
                      type={loginMethod === "email" ? "email" : "tel"}
                      id="loginId"
                      value={state.loginId}
                      onChange={(e) => {
                        // SECURITY: Sanitize input based on login method
                        const sanitized = loginMethod === "email" 
                          ? sanitizeEmail(e.target.value)
                          : sanitizePhone(e.target.value);
                        setState({ ...state, loginId: sanitized });
                      }}
                      placeholder={loginMethod === "email" ? "name@example.com" : "+233 XX XXX XXXX"}
                      required
                      maxLength={loginMethod === "email" ? 255 : 20}
                    />
                  </InputWrapper>
                  <ToggleLink type="button" onClick={toggleLoginMethod}>
                    Use {loginMethod === "email" ? "phone number" : "email"} instead
                  </ToggleLink>
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
                        // SECURITY: Limit password length to prevent DoS
                        const sanitized = e.target.value.slice(0, 128);
                        setState({ ...state, password: sanitized });
                      }}
                      placeholder="Enter your password"
                      required
                      maxLength={128}
                    />
                  </InputWrapper>
                  <ForgotPasswordLink to="/forgot-password">
                    Forgot password?
                  </ForgotPasswordLink>
                </InputGroup>
              </>
            ) : (
              <OtpContainer>
                <OtpInputs>
                  {[...Array(6)].map((_, index) => {
                    // Convert string OTP to array for display
                    const otpArray = otp.split('').slice(0, 6);
                    return (
                      <OtpInput
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otpArray[index] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only digits
                          if (value.length > 1) return; // Only allow single digit
                          
                          const newOtpArray = [...otpArray];
                          newOtpArray[index] = value;
                          const newOtp = newOtpArray.join('');
                          setOtp(newOtp);
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.getElementById(`otp-${index + 1}`);
                            if (nextInput) nextInput.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace
                          if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
                            const prevInput = document.getElementById(`otp-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        id={`otp-${index}`}
                        autoFocus={index === 0}
                      />
                    );
                  })}
                </OtpInputs>

                <ResendWrapper>
                  {otpCountdown > 0 ? (
                    <ResendText>
                      Resend code in {Math.floor(otpCountdown / 60)}:
                      {(otpCountdown % 60).toString().padStart(2, "0")}
                    </ResendText>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      loading={isSendingOtp}
                    >
                      Resend Code
                    </Button>
                  )}
                </ResendWrapper>
              </OtpContainer>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSendingOtp || isVerifyingOtp}
              disabled={step === "credentials" ? false : otp.length < 6}
            >
              {step === "otp" ? "Verify & Login" : "Sign In"}
            </Button>

            {step === "otp" && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep("credentials")}
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
