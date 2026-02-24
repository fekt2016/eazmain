import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaApple, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../shared/hooks/useAuth';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';
import Button from '../../shared/components/Button';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import CheckboxField from './components/CheckboxField';
import { DEFAULT_FORM_VALUES, VALIDATION_RULES, sanitizeFormData } from './constants/formValidation';
import {
  getGoogleOAuthConfig,
  getAppleOAuthConfig,
} from '../../shared/config/oauthConfig';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function SignupPage() {
  const navigate = useNavigate();
  const { register: registerMutation, resendVerification } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors,
  } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });

  const watchedPassword = watch("password");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";

  const { enabled: isGoogleEnabled, url: googleAuthUrl } =
    getGoogleOAuthConfig(origin);
  const { enabled: isAppleEnabled, url: appleAuthUrl } =
    getAppleOAuthConfig(origin);

  const handleGoogleSignup = () => {
    if (!isGoogleEnabled || !googleAuthUrl) return;
    window.location.href = googleAuthUrl;
  };

  const handleAppleSignup = () => {
    if (!isAppleEnabled || !appleAuthUrl) return;
    window.location.href = appleAuthUrl;
  };

  const handleResendVerification = () => {
    if (!watchedEmail) {
      setFormError("email", { message: "Email is required to resend verification" });
      return;
    }

    resendVerification.mutate(
      { email: watchedEmail },
      {
        onSuccess: () => {
          alert("Verification email sent successfully!");
        },
        onError: (error) => {
          logger.error("Error resending verification:", error);
          setFormError("root", {
            message: error.message || "An error occurred. Please try again."
          });
        },
      }
    );
  };

  const onSubmit = async (data) => {
    console.log("onsubmit",data);  
    clearErrors("root");

    try {
      const sanitizedData = sanitizeFormData(data);

      registerMutation.mutate(sanitizedData, {
        onSuccess: (response) => {
          logger.debug("Registration successful:", response?.data);
          
          if (response?.data?.requiresVerification || response?.data?.status === "success") {
            navigate("/verify-account", {
              state: {
                email: sanitizedData.email,
                phone: sanitizedData.phone,
                message: "Please verify your account to continue",
              },
            });
          } else {
            navigate("/");
          }
        },
        onError: (error) => {
          logger.error("Registration error:", error);
          
          const errorResponse = error.response?.data || {};
          const fieldErrors = errorResponse.details || errorResponse.fieldErrors;
          
          // Handle field-level validation errors only (e.g. invalid phone, short password)
          if (fieldErrors && typeof fieldErrors === "object" && Object.keys(fieldErrors).length > 0) {
            Object.keys(fieldErrors).forEach((field) => {
              setFormError(field, {
                type: "server",
                message: fieldErrors[field],
              });
            });
          }
          // Show friendly message for rate limiting (429) so user knows to wait and retry
          if (error.response?.status === 429) {
            setFormError("root", {
              message: "Too many attempts. Please wait a few minutes and try again.",
            });
          }
        },
      });
    } catch (err) {
      logger.error("Registration error:", err);
      setFormError("root", {
        message: err.message || "Registration failed. Please try again."
      });
    }
  };

  // Show verification sent state (handled by navigation to verify-account page)
  // Removed unused verificationSent state

  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">Saiisai</BrandLogo>
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

          {errors.root && (
            <ErrorMessage role="alert">
              {errors.root.message}
            </ErrorMessage>
          )}

          <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputField
              id="name"
              label="Full Name"
              type="text"
              error={errors.name?.message}
              required
              placeholder="John Doe"
              maxLength={100}
              {...register("name", VALIDATION_RULES.name)}
            />

            <InputField
              id="email"
              label="Email Address"
              type="email"
              error={errors.email?.message}
              required
              placeholder="name@example.com"
              maxLength={255}
              {...register("email", VALIDATION_RULES.email)}
            />

            <InputField
              id="phone"
              label="Phone Number (Optional)"
              type="tel"
              error={errors.phone?.message}
              placeholder="+233 XX XXX XXXX"
              maxLength={20}
              {...register("phone", VALIDATION_RULES.phone)}
            />

            <Row>
              <PasswordField
                id="password"
                label="Password"
                error={errors.password?.message}
                required
                placeholder="••••••••"
                minLength={8}
                maxLength={128}
                {...register("password", VALIDATION_RULES.password)}
              />

              <PasswordField
                id="passwordConfirm"
                label="Confirm Password"
                error={errors.passwordConfirm?.message}
                required
                placeholder="••••••••"
                maxLength={128}
                {...register("passwordConfirm", {
                  ...VALIDATION_RULES.passwordConfirm,
                  validate: {
                    ...VALIDATION_RULES.passwordConfirm.validate,
                    match: (value) => {
                      return value === watchedPassword || "Passwords do not match";
                    }
                  }
                })}
              />
            </Row>

            <CheckboxField
              id="check"
              label="I agree with the"
              linkTo="/terms"
              linkText="privacy policy & terms"
              checked={watch("check")}
              error={errors.check?.message}
              required
              {...(() => {
                const { onChange, ...rest } = register("check", VALIDATION_RULES.check);
                return {
                  ...rest,
                  onChange: async (e) => {
                    // Call React Hook Form's onChange to update form state
                    onChange(e);
                    // Trigger validation immediately to show error if unchecked
                    await trigger("check");
                  },
                };
              })()}
            />

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              disabled={isSubmitting || registerMutation.isPending}
              loading={isSubmitting || registerMutation.isPending}
              aria-label={isSubmitting || registerMutation.isPending ? "Creating account..." : "Create account"}
            >
              Create Account
            </Button>

          </StyledForm>

          <Divider>
            <DividerLine />
            <DividerText>or sign up with</DividerText>
            <DividerLine />
          </Divider>

          <SocialButtons>
            <SocialButton 
              type="button"
              $bg="#fff" 
              $hover="#f5f5f5" 
              $border="#e0e0e0" 
              disabled={!isGoogleEnabled}
              onClick={handleGoogleSignup}
              aria-label="Sign up with Google"
            >
              <FcGoogle size={20} />
              <span>Google</span>
            </SocialButton>
            <SocialButton 
              type="button"
              $bg="#000" 
              $hover="#333" 
              disabled={!isAppleEnabled}
              onClick={handleAppleSignup}
              aria-label="Sign up with Apple"
            >
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

// Styled Components
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
  flex-direction: column;
  gap: 20px;
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
  border: ${props => props.$border ? `1px solid ${props.$border}` : "none"};
  background: ${props => props.$bg || "#fff"};
  color: ${props => props.$bg === "#000" || props.$bg === "#1877f2" ? "white" : "#333"};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.$hover || "#f5f5f5"};
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
