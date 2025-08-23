import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import useAuth from "../hooks/useAuth";
import { useMergeWishlists } from "../hooks/useWishlist";
import { useCartActions } from "../hooks/useCart";
import { ButtonSpinner, LoadingButton } from "../components/ButtonSpinner";

export default function LoginPage() {
  const navigate = useNavigate();

  const [state, setState] = useState({
    loginId: "",
    password: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const { mutate: merge } = useMergeWishlists();
  // const { sync, isSyncing } = useSyncWishlist();
  // const { clear } = useClearWishlist();
  const { syncCart } = useCartActions();
  const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp, otpError } =
    useAuth();

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (step === "credentials") {
      try {
        await sendOtp.mutateAsync(state.loginId);
        setStep("otp");
        setOtpCountdown(120);
      } catch (err) {
        console.error("OTP send failed:", err.message);
      }
    } else {
      try {
        await verifyOtp.mutateAsync(
          {
            loginId: state.loginId,
            otp,
            password: state.password,
          },
          {
            onSuccess: () => {
              console.log("OTP verified successfully");
              merge();
              navigate("/");
            },
          }
        );

        setState({ loginId: "", password: "" });
        setOtp("");
        syncCart();
        // navigate("/");
      } catch (err) {
        console.error("OTP verification failed:", err.message);
      }
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setState({ ...state, loginId: "" });
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp.mutateAsync(state.loginId);
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
          <h1>{step === "otp" ? "Verify Identity" : "Welcome Back"}</h1>
          <Subtitle>
            {step === "otp"
              ? `Enter verification code sent to your ${loginMethod}`
              : "Enter your credentials to access your account"}
          </Subtitle>
        </LoginHeader>

        {otpError && <ErrorMessage>{otpError.message}</ErrorMessage>}

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

              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={state.password}
                  onChange={(e) =>
                    setState({ ...state, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </FormGroup>
            </>
          ) : (
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
          )}

          <ForgotPassword to="/forgot-password">
            Forgot password?
          </ForgotPassword>

          <LoadingButton
            type="submit"
            disabled={
              step === "credentials"
                ? isSendingOtp
                : isVerifyingOtp || otp.length < 6
            }
          >
            {isSendingOtp || isVerifyingOtp ? (
              <ButtonSpinner />
            ) : step === "otp" ? (
              "Verify"
            ) : (
              "Log In"
            )}
          </LoadingButton>

          {step === "otp" && (
            <BackButton type="button" onClick={() => setStep("credentials")}>
              ← Change Credentials
            </BackButton>
          )}
        </LoginForm>

        <SignupSection>
          <SignupText>Don&apos;t have an account?</SignupText>
          <SignupLink to="/register">Create account</SignupLink>
        </SignupSection>

        {/* <AdminLoginLink to="/admin/login">
          Login as Administrator
        </AdminLoginLink> */}
      </LoginCard>
    </LoginContainer>
  );
}

// Add new styled components
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

// const ResendButton = styled.button`
//   background: none;
//   border: none;
//   color: #4e73df;
//   font-size: 14px;
//   cursor: pointer;
//   text-decoration: underline;
//   padding: 0;

//   &:hover {
//     color: #2e59d9;
//   }

//   &:disabled {
//     color: #a0aec0;
//     cursor: not-allowed;
//   }
// `;

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

// Existing styled components remain the same...
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

const ForgotPassword = styled(Link)`
  text-align: right;
  font-size: 14px;
  color: #4e73df;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #2e59d9;
    text-decoration: underline;
  }
`;

// const SubmitButton = styled.button`
//   background: #4e73df;
//   color: white;
//   border: none;
//   border-radius: 8px;
//   padding: 16px;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.3s;
//   display: flex;
//   justify-content: center;
//   align-items: center;

//   &:hover {
//     background: #2e59d9;
//   }

//   &:disabled {
//     background: #a0aec0;
//     cursor: not-allowed;
//   }
// `;

// const Spinner = styled.div`
//   border: 2px solid rgba(255, 255, 255, 0.3);
//   border-radius: 50%;
//   border-top: 2px solid white;
//   width: 20px;
//   height: 20px;
//   animation: spin 1s linear infinite;

//   @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(360deg);
//     }
//   }
// `;

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

const AdminLoginLink = styled(Link)`
  display: block;
  margin-top: 24px;
  color: #6c757d;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    color: #4e73df;
    text-decoration: underline;
  }
`;
