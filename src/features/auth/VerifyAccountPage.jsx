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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
            <BackButton onClick={() => navigate("/signup")}>
              <FaArrowLeft /> Back to Signup
            </BackButton>
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
            <h1>Verify Identity</h1>
            <p>Enter the 6-digit code sent to your {email ? "email" : "phone"}</p>
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
                <SubmitButton
                  type="submit"
                  disabled={(Array.isArray(otp) ? otp.join("") : String(otp || "")).length !== 6 || verifyAccount.isPending}
                >
                  {verifyAccount.isPending ? (
                    <>
                      <ButtonSpinner size="sm" /> Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle /> Verify Account
                    </>
                  )}
                </SubmitButton>
              </ButtonGroup>

              <ResendSection>
                {countdown > 0 ? (
                  <ResendText>
                    <FaClock /> Resend code in {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </ResendText>
                ) : (
                  <ResendButton
                    type="button"
                    onClick={handleResend}
                    disabled={resendOtp.isPending}
                  >
                    {resendOtp.isPending ? (
                      <>
                        <ButtonSpinner size="sm" /> Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Resend Code
                      </>
                    )}
                  </ResendButton>
                )}
              </ResendSection>
            </OtpForm>

            <BackButton onClick={() => navigate("/signup")}>
              <FaArrowLeft /> Back to Signup
            </BackButton>
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
  animation: ${fadeIn} 0.3s ease-in;

  @media ${devicesMax.tablet} {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media ${devicesMax.tablet} {
    min-height: 40vh;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
`;

const ImageContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
`;

const BrandLogo = styled.a`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: block;
  margin-bottom: 2rem;
`;

const HeroText = styled.div`
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  animation: ${fadeIn} 0.5s ease-in;
`;

const VerificationCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media ${devicesMax.mobile} {
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  margin-bottom: 1rem;
`;

const OtpForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OtpInputGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin: 1rem 0;
`;

const OtpInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media ${devicesMax.mobile} {
    width: 45px;
    height: 55px;
    font-size: 1.25rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.75rem;
  background: #fee;
  border-radius: 6px;
  border: 1px solid #fcc;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResendSection = styled.div`
  text-align: center;
  margin-top: 1rem;
`;

const ResendText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
`;

