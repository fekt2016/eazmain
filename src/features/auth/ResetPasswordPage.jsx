import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from '../../shared/hooks/useAuth';
import Button from '../../shared/components/Button';
import Logo from '../../shared/components/Logo';
import { ErrorState } from '../../components/loading';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPasswordWithToken } = useAuth();
  const { mutate: resetPassword, isPending, error } = resetPasswordWithToken;

  // Check if token exists in URL
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const validatePasswords = () => {
    if (state.newPassword.length < 8) {
      setPasswordError("Your password needs at least 8 characters—try making it a bit longer!");
      return false;
    }
    if (!/\d/.test(state.newPassword)) {
      setPasswordError("Almost there! Add at least one number (e.g. 1, 2, 3) to make your password stronger.");
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(state.newPassword)) {
      setPasswordError("Almost there! Add a special character (e.g. ! @ # $ %) to make your password more secure.");
      return false;
    }
    if (state.newPassword !== state.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate("/forgot-password");
      return;
    }

    if (!validatePasswords()) {
      return;
    }

    try {
      await resetPassword(
        {
          token,
          newPassword: state.newPassword,
          confirmPassword: state.confirmPassword,
        },
        {
          onSuccess: (data) => {
            logger.log("Password reset successful:", data);
            setIsSuccess(true);
            toast.success('Password reset successfully!');
            // Navigation is handled by the mutation's onSuccess
          },
          onError: (error) => {
            logger.error("Error resetting password:", error);
            // Error is handled by the mutation's error state
          },
        }
      );
    } catch (err) {
      logger.error("Password reset error:", err);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <PageContainer>
        <ImageSection>
          <Overlay />
          <ImageContent>
            <BrandLogo to="/">
              <Logo variant="default" />
            </BrandLogo>
            <HeroText>
              <h1>Password Reset</h1>
              <p>Your password has been successfully reset.</p>
            </HeroText>
          </ImageContent>
        </ImageSection>

        <FormSection>
          <FormContainer>
            <SuccessContainer>
              <SuccessIcon>
                <FaCheckCircle size={64} color="#10b981" />
              </SuccessIcon>
              <Header>
                <h2>Password Reset Successful</h2>
                <p>
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </Header>

              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </SuccessContainer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    );
  }

  // No token state
  if (!token) {
    return (
      <PageContainer>
        <ImageSection>
          <Overlay />
          <ImageContent>
            <BrandLogo to="/">
              <Logo variant="default" />
            </BrandLogo>
            <HeroText>
              <h1>Invalid Link</h1>
              <p>The reset link is invalid or has expired.</p>
            </HeroText>
          </ImageContent>
        </ImageSection>

        <FormSection>
          <FormContainer>
            <ErrorContainer>
              <ErrorIcon>
                <FaExclamationTriangle size={64} color="#ef4444" />
              </ErrorIcon>
              <Header>
                <h2>Invalid Reset Link</h2>
                <p>
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </Header>

              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/forgot-password")}
              >
                Request New Reset Link
              </Button>
            </ErrorContainer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    );
  }

  // Form state
  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">
            <Logo variant="default" />
          </BrandLogo>
          <HeroText>
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </HeroText>
        </ImageContent>
      </ImageSection>

      <FormSection>
        <FormContainer>
          <Header>
            <h2>Set New Password</h2>
            <p>Please enter your new password. It must be at least 8 characters long.</p>
          </Header>

          {error && (
            <ErrorState 
              message={
                error.message || 
                "Failed to reset password. The link may have expired. Please request a new one."
              } 
            />
          )}
          {passwordError && <ErrorState message={passwordError} />}

          <StyledForm onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="newPassword">New Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={state.newPassword}
                  onChange={(e) => {
                    setState({ ...state, newPassword: e.target.value });
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="••••••••"
                  required
                  minLength="8"
                  autoFocus
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={state.confirmPassword}
                  onChange={(e) => {
                    setState({ ...state, confirmPassword: e.target.value });
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="••••••••"
                  required
                />
              </InputWrapper>
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isPending}
              disabled={
                isPending ||
                !state.newPassword ||
                !state.confirmPassword
              }
            >
              Reset Password
            </Button>
          </StyledForm>

          <Footer>
            Remember your password? <Link to="/login">Back to Login</Link>
          </Footer>
        </FormContainer>
      </FormSection>
    </PageContainer>
  );
}

// Styled Components (reusing from ForgotPasswordPage)
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: white;
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2070&auto=format&fit=crop');
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
  text-decoration: none;
  display: inline-flex;
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
  z-index: 1;
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
    border-color: #ffc400;
    background: white;
    box-shadow: 0 0 0 4px rgba(255, 196, 0, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  color: #666;
  font-size: 15px;
  
  a {
    color: #ffc400;
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d1fae5;
  border-radius: 50%;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const ErrorIcon = styled.div`
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fee2e2;
  border-radius: 50%;
`;


