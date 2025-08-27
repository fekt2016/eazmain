import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import useAuth from "../hooks/useAuth";
import { ButtonSpinner, LoadingButton } from "../components/ButtonSpinner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [state, setState] = useState({
    loginId: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const {
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    isSendingOtp,
    isVerifyingOtp,
    isResettingPassword,
    authError,
  } = useAuth();

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const validatePasswords = () => {
    if (state.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (state.newPassword !== state.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (step === "credentials") {
      try {
        await sendPasswordResetOtp.mutateAsync(state.loginId);
        setStep("otp");
        setOtpCountdown(120);
      } catch (err) {
        console.error("OTP send failed:", err.message);
      }
    } else if (step === "otp") {
      try {
        const response = await verifyPasswordResetOtp.mutateAsync({
          loginId: state.loginId,
          otp,
        });
        console.log("OTP verified, response:", response);
        setResetToken(response.resetToken);
        setStep("reset");
      } catch (err) {
        console.error("OTP verification failed:", err);
      }
    } else if (step === "reset") {
      if (!validatePasswords()) return;

      try {
        await resetPassword.mutateAsync({
          loginId: state.loginId,
          newPassword: state.newPassword,
          resetToken,
        });
        navigate("/login", {
          state: {
            message:
              "Password reset successfully. Please login with your new password.",
          },
        });
      } catch (err) {
        console.error("Password reset failed:", err.message);
      }
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setState({ ...state, loginId: "" });
  };

  const handleResendOtp = async () => {
    try {
      await sendPasswordResetOtp.mutateAsync(state.loginId);
      setOtpCountdown(120);
    } catch (err) {
      console.error("Resend OTP failed:", err.message);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <Logo>YourBrand</Logo>
          <h1>
            {step === "otp"
              ? "Verify Identity"
              : step === "reset"
              ? "Reset Password"
              : "Reset Your Password"}
          </h1>
          <Subtitle>
            {step === "otp"
              ? `Enter verification code sent to your ${loginMethod}`
              : step === "reset"
              ? "Enter your new password"
              : "Enter your email or phone to reset your password"}
          </Subtitle>
        </LoginHeader>

        {authError && <ErrorMessage>{authError.message}</ErrorMessage>}
        {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}

        <LoginForm onSubmit={submitHandler}>
          {step === "credentials" ? (
            <>
              <FormGroup>
                <Label htmlFor="loginId">
                  {loginMethod === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  type={loginMethod === "email" ? "email" : "tel"}
                  id="loginId"
                  name="loginId"
                  value={state.loginId}
                  onChange={(e) =>
                    setState({ ...state, loginId: e.target.value })
                  }
                  placeholder={
                    loginMethod === "email"
                      ? "your.email@example.com"
                      : "+1234567890"
                  }
                  required
                />
                <MethodToggle onClick={toggleLoginMethod}>
                  Use {loginMethod === "email" ? "phone number" : "email"}{" "}
                  instead
                </MethodToggle>
              </FormGroup>
            </>
          ) : step === "otp" ? (
            <OtpContainer>
              <OtpInputs>
                {[...Array(6)].map((_, index) => (
                  <OtpInput
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(""));

                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        document.getElementById(`otp-${index + 1}`).focus();
                      }
                    }}
                    id={`otp-${index}`}
                  />
                ))}
              </OtpInputs>

              <ResendContainer>
                {otpCountdown > 0 ? (
                  <ResendText>
                    Resend code in {Math.floor(otpCountdown / 60)}:
                    {(otpCountdown % 60).toString().padStart(2, "0")}
                  </ResendText>
                ) : (
                  <LoadingButton
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? <ButtonSpinner /> : "Resend Code"}
                  </LoadingButton>
                )}
              </ResendContainer>
            </OtpContainer>
          ) : (
            <>
              <FormGroup>
                <Label htmlFor="newPassword">New Password</Label>
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
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
              </FormGroup>
            </>
          )}

          <LoadingButton
            type="submit"
            disabled={
              step === "credentials"
                ? isSendingOtp || !state.loginId
                : step === "otp"
                ? isVerifyingOtp || otp.length < 6
                : isResettingPassword ||
                  !state.newPassword ||
                  !state.confirmPassword
            }
          >
            {isSendingOtp || isVerifyingOtp || isResettingPassword ? (
              <ButtonSpinner />
            ) : step === "otp" ? (
              "Verify"
            ) : step === "reset" ? (
              "Reset Password"
            ) : (
              "Send Reset Code"
            )}
          </LoadingButton>

          {step !== "credentials" && (
            <BackButton
              type="button"
              onClick={() => setStep(step === "otp" ? "credentials" : "otp")}
            >
              ← {step === "otp" ? "Change Email/Phone" : "Back to Verification"}
            </BackButton>
          )}
        </LoginForm>

        <SignupSection>
          <SignupText>Remember your password?</SignupText>
          <SignupLink to="/login">Back to Login</SignupLink>
        </SignupSection>
      </LoginCard>
    </LoginContainer>
  );
}

// Styled components (same as in LoginPage)
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
  text-align: center;
`;

const LoginHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    color: #333;
    margin: 16px 0 8px;
  }
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #4e73df;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #6c757d;
  font-size: 15px;
  margin-top: 8px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  text-align: left;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.2);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const MethodToggle = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  background: none;
  border: none;
  color: #4e73df;
  font-size: 12px;
  cursor: pointer;
  padding: 5px;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #2e59d9;
  }
`;

const OtpContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const OtpInputs = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const OtpInput = styled.input`
  width: 45px;
  height: 45px;
  text-align: center;
  font-size: 18px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.2);
  }
`;

const ResendContainer = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const ResendText = styled.span`
  font-size: 14px;
  color: #6c757d;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4e73df;
  font-size: 14px;
  cursor: pointer;
  margin-top: 15px;
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px auto 0;

  &:hover {
    color: #2e59d9;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SignupSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const SignupText = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

const SignupLink = styled(Link)`
  color: #4e73df;
  font-weight: 500;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;
