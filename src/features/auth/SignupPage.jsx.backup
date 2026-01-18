import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaFacebook, FaApple, FaCheck, FaEnvelope, FaUser, FaPhone, FaLock, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../shared/hooks/useAuth';
import { validateGhanaPhoneNumberOnly } from '../../shared/utils/helpers';
import { sanitizeEmail, sanitizePhone, sanitizeText } from '../../shared/utils/sanitize';
import { ButtonSpinner, ErrorState } from '../../components/loading';
import { spin } from '../../shared/styles/animations';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';
import Button from '../../shared/components/Button';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function SignupPage() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    check: false,
  });

  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const { register, resendVerification } = useAuth();
  const { mutate: resendVerificationEmail, isPending: isResending } = resendVerification;

  // Validate phone when it changes
  useEffect(() => {
    if (state.phone) {
      const validationError = validateGhanaPhoneNumberOnly(state.phone);
      setPhoneError(validationError);
    } else {
      setPhoneError("");
    }
  }, [state.phone]);

  const handleFacebookSignup = () => {
    const facebookAuthUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=1046655936440828&redirect_uri=${window.location.origin}/facebook-callback&scope=email,public_profile`;
    window.location.href = facebookAuthUrl;
  };

  const handleGoogleSignup = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${window.location.origin}/google-callback&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  const handleAppleSignup = () => {
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=YOUR_APPLE_SERVICE_ID&redirect_uri=${window.location.origin}/apple-callback&response_type=code%20id_token&scope=email%20name&response_mode=web_message`;
    window.location.href = appleAuthUrl;
  };

  const handleResendVerification = () => {
    resendVerification.mutate(
      { email: state.email },
      {
        onSuccess: () => {
          alert("Verification email sent successfully!");
        },
        onError: (error) => {
          logger.error("Error resending verification:", error);
          setError(error.message || "An error occurred. Please try again.");
        },
      }
    );
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setError(null);

    if (state.phone) {
      const phoneValidation = validateGhanaPhoneNumberOnly(state.phone);
      if (phoneValidation) {
        setError(phoneValidation);
        return;
      }
    }

    if (!state.email) {
      setError("Email is required for account verification");
      return;
    }

    if (state.password !== state.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (!state.check) {
      setError("You must agree to the privacy policy & terms");
      return;
    }

    try {
      const registrationData = {
        name: state.name,
        email: state.email,
        phone: state.phone ? state.phone.replace(/\D/g, "") : "",
        password: state.password,
        passwordConfirm: state.passwordConfirm,
      };

      register.mutate(registrationData, {
        onSuccess: (data) => {
          logger.debug("Registration successful:", data);
          if (data?.data?.requiresVerification || data.status === "success") {
            // ✅ Redirect to verification page with email/phone
            navigate("/verify-account", {
              state: {
                email: state.email,
                phone: state.phone,
                message: "Please verify your account to continue",
              },
            });
          } else {
            navigate("/");
          }
        },
        onError: (error) => {
          logger.error("Registration error:", error);
          setError(error.message || "Registration failed. Please try again.");
        },
      });
    } catch (err) {
      logger.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  if (verificationSent) {
    return (
      <PageContainer>
        <ImageSection>
          <Overlay />
          <ImageContent>
            <BrandLogo to="/">EazShop</BrandLogo>
            <HeroText>
              <h1>Check Your Email</h1>
              <p>We've sent a verification link to your inbox.</p>
            </HeroText>
          </ImageContent>
        </ImageSection>
        <FormSection>
          <FormContainer>
            <VerificationSent>
              <EnvelopeIcon>
                <FaEnvelope size={48} color="#667eea" />
              </EnvelopeIcon>
              <Header>
                <h2>Verify Email</h2>
                <p>
                  We've sent a verification email to <strong>{state.email}</strong>.
                  Please check your inbox and click the verification link to
                  activate your account.
                </p>
              </Header>

              <VerificationNote>
                Didn't receive the email? Check your spam folder or{" "}
                <ResendLink
                  onClick={handleResendVerification}
                  disabled={resendVerification.isPending}
                >
                  {resendVerification.isPending ? (
                    <ButtonSpinner size="sm" />
                  ) : (
                    "resend verification email"
                  )}
                </ResendLink>
              </VerificationNote>

              {resendVerification.error && (
                <ErrorState message={resendVerification.error?.message || "Failed to resend verification"} />
              )}

              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                leftIcon={<FaArrowLeft />}
              >
                Back to Login
              </Button>
            </VerificationSent>
          </FormContainer>
        </FormSection>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">EazShop</BrandLogo>
          <HeroText>
            <h1>Join Our Community</h1>
            <p>Create an account to unlock exclusive features and personalized recommendations.</p>
          </HeroText>
        </ImageContent>
      </ImageSection>

      <FormSection>
        <FormContainer>
          <Header>
            <h2>Create Account</h2>
            <p>Enter your details to get started</p>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <StyledForm onSubmit={submitHandler}>
            <InputGroup>
              <Label htmlFor="name">Full Name</Label>
              <InputWrapper>
                <InputIcon><FaUser /></InputIcon>
                <Input
                  type="text"
                  id="name"
                  value={state.name}
                  onChange={(e) => {
                    // SECURITY: Sanitize input - remove script tags and limit length
                    const sanitized = e.target.value.replace(/<[^>]*>/g, '').slice(0, 100);
                    setState({ ...state, name: sanitized });
                  }}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputWrapper>
                <InputIcon><FaEnvelope /></InputIcon>
                <Input
                  type="email"
                  id="email"
                  value={state.email}
                  onChange={(e) => {
                    // SECURITY: Sanitize email input
                    const sanitized = sanitizeEmail(e.target.value);
                    setState({ ...state, email: sanitized });
                  }}
                  placeholder="name@example.com"
                  required
                  maxLength={255}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <InputWrapper>
                <InputIcon><FaPhone /></InputIcon>
                <Input
                  type="tel"
                  id="phone"
                  value={state.phone}
                  onChange={(e) => {
                    // SECURITY: Sanitize phone input
                    const sanitized = sanitizePhone(e.target.value);
                    setState({ ...state, phone: sanitized });
                  }}
                  placeholder="+233 XX XXX XXXX"
                  $error={phoneError ? true : false}
                  maxLength={20}
                />
              </InputWrapper>
              {phoneError && <ErrorText>{phoneError}</ErrorText>}
            </InputGroup>

            <Row>
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
                    placeholder="••••••••"
                    required
                    minLength="8"
                    maxLength={128}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                <InputWrapper>
                  <InputIcon><FaLock /></InputIcon>
                  <Input
                    type="password"
                    id="passwordConfirm"
                    value={state.passwordConfirm}
                    onChange={(e) => {
                      // SECURITY: Limit password length to prevent DoS
                      const sanitized = e.target.value.slice(0, 128);
                      setState({ ...state, passwordConfirm: sanitized });
                    }}
                    placeholder="••••••••"
                    required
                    maxLength={128}
                  />
                </InputWrapper>
              </InputGroup>
            </Row>

            <TermsGroup>
              <CheckboxContainer>
                <HiddenCheckbox
                  id="check"
                  checked={state.check}
                  onChange={(e) => setState({ ...state, check: e.target.checked })}
                  required
                />
                <StyledCheckbox $checked={state.check} htmlFor="check">
                  <FaCheck size={10} color="white" />
                </StyledCheckbox>
              </CheckboxContainer>
              <TermsLabel htmlFor="check">
                I agree with the <Link to="/terms">privacy policy & terms</Link>
              </TermsLabel>
            </TermsGroup>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              loading={register.isPending}
            >
              Create Account
            </Button>

            {register.error && (
              <ErrorState message={register.error?.message || "Failed to create account"} />
            )}
          </StyledForm>

          <Divider>
            <DividerLine />
            <DividerText>or sign up with</DividerText>
            <DividerLine />
          </Divider>

          <SocialButtons>
            <SocialButton $bg="#1877f2" $hover="#166fe5" onClick={handleFacebookSignup}>
              <FaFacebook color="white" size={20} />
              <span>Facebook</span>
            </SocialButton>
            <SocialButton $bg="#fff" $hover="#f5f5f5" $border="#e0e0e0" onClick={handleGoogleSignup}>
              <FcGoogle size={20} />
              <span>Google</span>
            </SocialButton>
            <SocialButton $bg="#000" $hover="#333" onClick={handleAppleSignup}>
              <FaApple color="white" size={20} />
              <span>Apple</span>
            </SocialButton>
          </SocialButtons>

          <Footer>
            Already have an account? <Link to="/login">Sign in</Link>
          </Footer>
        </FormContainer>
      </FormSection>
    </PageContainer>
  );
}

// Styled Components (Reusing mostly from Login, with some additions)
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: white;
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop');
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
  overflow-y: auto;
  
  @media ${devicesMax.md} {
    padding: 20px;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 480px;
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
    line-height: 1.5;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 20px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
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
  border: 2px solid ${(props) => (props.$error ? "#ef4444" : "#eee")};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: ${(props) => (props.$error ? "#ef4444" : "#667eea")};
    background: white;
    box-shadow: 0 0 0 4px ${(props) => (props.$error ? "rgba(239, 68, 68, 0.1)" : "rgba(102, 126, 234, 0.1)")};
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 12px;
`;

const TermsGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxContainer = styled.div`
  position: relative;
  top: 2px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.label`
  width: 20px;
  height: 20px;
  background: ${(props) => (props.$checked ? "#667eea" : "white")};
  border: 2px solid ${(props) => (props.$checked ? "#667eea" : "#ddd")};
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    border-color: #667eea;
  }
`;

const TermsLabel = styled.label`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  cursor: pointer;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #eee;
`;

const DividerText = styled.span`
  padding: 0 16px;
  color: #999;
  font-size: 14px;
  font-weight: 500;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

const SocialButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: ${(props) => (props.$border ? `1px solid ${props.$border}` : "none")};
  background: ${(props) => props.$bg || "#fff"};
  color: ${(props) =>
    props.$bg === "#000" || props.$bg === "#1877f2" ? "white" : "#333"};

  &:hover {
    transform: translateY(-2px);
    background: ${(props) => props.$hover || "#f5f5f5"};
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
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

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const VerificationSent = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const EnvelopeIcon = styled.div`
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f4ff;
  border-radius: 50%;
`;

const VerificationNote = styled.p`
  color: #666;
  font-size: 14px;
  margin: 24px 0;
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  padding: 0;
  font-size: inherit;

  &:hover {
    text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
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
