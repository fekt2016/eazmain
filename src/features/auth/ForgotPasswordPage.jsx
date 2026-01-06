import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import useAuth from '../../shared/hooks/useAuth';
import Button from '../../shared/components/Button';
import Logo from '../../shared/components/Logo';
import { ErrorState } from '../../components/loading';
import { devicesMax } from '../../shared/styles/breakpoint';
import logger from '../../shared/utils/logger';
import { sanitizeEmail } from '../../shared/utils/sanitize';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();
  const { mutate: requestReset, isPending, error } = requestPasswordReset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const normalizedEmail = sanitizeEmail(email.trim().toLowerCase());
    if (!normalizedEmail) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await requestReset(normalizedEmail, {
        onSuccess: (data) => {
          logger.log("Password reset request sent:", data);
          setIsSubmitted(true);
          toast.success('If an account exists, a reset email has been sent.');
        },
        onError: (error) => {
          logger.error("Error requesting password reset:", error);
          // Error is handled by the mutation's error state
        },
      });
    } catch (err) {
      logger.error("Password reset request error:", err);
    }
  };

  // Success state - show confirmation message
  if (isSubmitted) {
    return (
      <PageContainer>
        <ImageSection>
          <Overlay />
          <ImageContent>
            <BrandLogo to="/">
              <Logo variant="default" />
            </BrandLogo>
            <HeroText>
              <h1>Check Your Email</h1>
              <p>We've sent password reset instructions to your inbox.</p>
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
                <h2>Email Sent</h2>
                <p>
                  If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
                </p>
              </Header>
              
              <InfoBox>
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>The link expires in 10 minutes</li>
                </ul>
              </InfoBox>

              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>

              <ResendLink onClick={() => setIsSubmitted(false)}>
                Didn't receive the email? Try again
              </ResendLink>
            </SuccessContainer>
          </FormContainer>
        </FormSection>
      </PageContainer>
    );
  }

  // Form state - show email input
  return (
    <PageContainer>
      <ImageSection>
        <Overlay />
        <ImageContent>
          <BrandLogo to="/">
            <Logo variant="default" />
          </BrandLogo>
          <HeroText>
            <h1>Reset Your Password</h1>
            <p>Enter your email to receive password reset instructions</p>
          </HeroText>
        </ImageContent>
      </ImageSection>

      <FormSection>
        <FormContainer>
          <Header>
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </Header>

          {error && <ErrorState message={error.message || "Failed to send reset email. Please try again."} />}

          <StyledForm onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputWrapper>
                <InputIcon>
                  <FaEnvelope />
                </InputIcon>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  autoFocus
                />
              </InputWrapper>
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isPending}
              disabled={isPending || !email.trim()}
            >
              Send Reset Link
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

// Styled Components
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

const InfoBox = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
  
  p {
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      color: #666;
      
      &:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: bold;
      }
    }
  }
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #ffc400;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 0;
  font-size: 14px;
  margin-top: 16px;
  width: 100%;
  transition: color 0.2s;
  
  &:hover {
    color: #e6b000;
    text-decoration: underline;
  }
`;
