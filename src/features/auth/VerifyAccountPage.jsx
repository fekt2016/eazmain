import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft,
  FaPaperPlane,
  FaClock,
  FaPhone
} from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import authApi from "../../shared/services/authApi";
import { ButtonSpinner, ErrorState } from "../../components/loading";
import { devicesMax } from "../../shared/styles/breakpoint";
import { toast } from "react-toastify";
import logger from "../../shared/utils/logger";
import Logo from "../../shared/components/Logo";
import Button from "../../shared/components/Button";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components (defined before component to ensure availability)
const LogoWrapper = styled.div`
  margin-bottom: var(--spacing-xl);
  
  /* Override logo colors for white text on dark background */
  svg {
    color: var(--color-white-0) !important;
  }
  
  span {
    color: var(--color-white-0) !important;
  }
`;

export default function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  // Get email/phone from location state or query params
  const email = location.state?.email || new URLSearchParams(location.search).get("email");
  const phone = location.state?.phone || new URLSearchParams(location.search).get("phone");

  // Verify account mutation
  const verifyAccount = useMutation({
    mutationFn: ({ email, phone, otp }) => {
      // Ensure otp is an array before calling join
      const otpArray = Array.isArray(otp) ? otp : (typeof otp === 'string' ? otp.split('') : []);
      const otpString = otpArray.join("");
      return authApi.verifyAccount(email, phone, otpString);
    },
    onSuccess: (data) => {
      toast.success("Account verified successfully! You can now log in.");
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Account verified! Please log in.",
            email: email || phone 
          } 
        });
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Resend OTP mutation
  const resendOtp = useMutation({
    mutationFn: () => authApi.resendOtp(email, phone),
    onSuccess: () => {
      setCountdown(60); // 60 second countdown
      setError("");
      toast.success("Verification code sent! Please check your email or phone.");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to resend code";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    // Ensure otp is an array
    const currentOtp = Array.isArray(otp) ? otp : (typeof otp === 'string' ? otp.split('') : ["", "", "", "", "", ""]);
    const newOtp = [...currentOtp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input when a digit is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace - always move to previous field when deleting
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      
      // Ensure otp is an array
      const currentOtp = Array.isArray(otp) ? otp : (typeof otp === 'string' ? otp.split('') : ["", "", "", "", "", ""]);
      
      // If current field has a value, clear it and move to previous field
      if (currentOtp[index] && index > 0) {
        const newOtp = [...currentOtp];
        newOtp[index] = "";
        setOtp(newOtp);
        setError("");
        // Move to previous field
        inputRefs.current[index - 1].focus();
      } 
      // If current field is empty and not the first field, move to previous field and clear it
      else if (!currentOtp[index] && index > 0) {
        const newOtp = [...currentOtp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setError("");
        // Move to previous field
        inputRefs.current[index - 1].focus();
      }
      // If on first field and it has a value, just clear it
      else if (currentOtp[index] && index === 0) {
        const newOtp = [...currentOtp];
        newOtp[index] = "";
        setOtp(newOtp);
        setError("");
      }
    }
    // Handle arrow keys for navigation
    else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
    else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      // Focus last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Ensure otp is an array before calling join
    const otpArray = Array.isArray(otp) ? otp : (typeof otp === 'string' ? otp.split('') : []);
    const otpString = otpArray.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    if (!email && !phone) {
      setError("Email or phone number is required");
      return;
    }

    verifyAccount.mutate({ email, phone, otp: otpString });
  };

  // Handle resend
  const handleResend = () => {
    if (countdown > 0) return;
    resendOtp.mutate();
  };

  // Redirect if no email/phone
  if (!email && !phone) {
    return (
      <PageContainer>
        <FormSection>
          <FormContainer>
            <ErrorState message="Email or phone number is required for verification" />
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate("/signup")}
              leftIcon={<FaArrowLeft />}
            >
              Back to Signup
            </Button>
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
          <LogoWrapper>
            <Logo to="/" variant="default" />
          </LogoWrapper>
          <HeroText>
            <h1>Verify Your Account</h1>
            <p>Enter the 6-digit verification code sent to your {email ? "email" : "phone"}</p>
          </HeroText>
        </ImageContent>
      </ImageSection>
      <FormSection>
        <FormContainer>
          <VerificationCard>
            <Header>
              <IconWrapper>
                {email ? <FaEnvelope size={32} /> : <FaPhone size={32} />}
              </IconWrapper>
              <h2>Verify Your Identity</h2>
              <p>
                We've sent a 6-digit verification code to{" "}
                <strong>{email || phone}</strong>
              </p>
            </Header>

            <OtpForm onSubmit={handleSubmit}>
              <OtpInputGroup>
                {(Array.isArray(otp) ? otp : (typeof otp === 'string' ? otp.split('').slice(0, 6) : ["", "", "", "", "", ""])).map((digit, index) => (
                  <OtpInput
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit || ""}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    autoFocus={index === 0}
                  />
                ))}
              </OtpInputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <ButtonGroup>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={verifyAccount.isPending}
                  disabled={(Array.isArray(otp) ? otp.join("") : String(otp || "")).length !== 6 || verifyAccount.isPending}
                  leftIcon={!verifyAccount.isPending && <FaCheckCircle />}
                >
                  {verifyAccount.isPending ? "Verifying..." : "Verify Account"}
                </Button>
              </ButtonGroup>

              <ResendSection>
                {countdown > 0 ? (
                  <ResendText>
                    <FaClock /> Resend code in {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </ResendText>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={resendOtp.isPending}
                    loading={resendOtp.isPending}
                    leftIcon={!resendOtp.isPending && <FaPaperPlane />}
                  >
                    {resendOtp.isPending ? "Sending..." : "Resend Code"}
                  </Button>
                )}
              </ResendSection>
            </OtpForm>

            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate("/signup")}
              leftIcon={<FaArrowLeft />}
            >
              Back to Signup
            </Button>
          </VerificationCard>
        </FormContainer>
      </FormSection>
    </PageContainer>
  );
}

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--color-white-0);
  animation: ${fadeIn} 0.3s ease-in;

  @media ${devicesMax.md} {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-xl);

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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
`;

const ImageContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeroText = styled.div`
  color: var(--color-white-0);
  animation: ${fadeIn} 1s ease-out;
  
  h1 {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--spacing-md);
    line-height: 1.2;
  }
  
  p {
    font-size: var(--font-size-lg);
    opacity: 0.9;
    max-width: 400px;
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-grey-50);
  overflow-y: auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-md);
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background: var(--color-white-0);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-lg) var(--spacing-md);
    box-shadow: none;
    background: transparent;
  }
`;

const VerificationCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  h2 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin-bottom: var(--spacing-xs);
  }
  
  p {
    color: var(--color-grey-600);
    font-size: var(--font-size-md);
    
    strong {
      color: var(--color-grey-900);
      font-weight: var(--font-semibold);
    }
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-cir);
  background: var(--gradient-primary);
  color: var(--color-white-0);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
`;

const OtpForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const OtpInputGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin: var(--spacing-md) 0;
`;

const OtpInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  transition: var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }

  @media ${devicesMax.sm} {
    width: 45px;
    height: 55px;
    font-size: var(--font-size-lg);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-red-700);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--color-red-100);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-red-500);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ResendSection = styled.div`
  text-align: center;
  margin-top: var(--spacing-sm);
`;

const ResendText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--color-grey-600);
  font-size: var(--font-size-sm);
`;

