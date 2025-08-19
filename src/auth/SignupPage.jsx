import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaFacebook, FaApple, FaCheck } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import useAuth from "../hooks/useAuth";
import { validateGhanaPhoneNumberOnly } from "../utils/helpers";

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
  const { register } = useAuth();
  // Ghana phone validation function

  // Validate phone when it changes
  useEffect(() => {
    if (state.phone) {
      const validationError = validateGhanaPhoneNumberOnly(state.phone);
      setPhoneError(validationError);
    } else {
      setPhoneError("");
    }
  }, [state.phone]);
  // Inside SignupPage component
  const handleFacebookSignup = () => {
    // Replace with your Facebook app ID and callback URL
    const facebookAuthUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=1046655936440828&redirect_uri=${window.location.origin}/facebook-callback&scope=email,public_profile`;
    window.location.href = facebookAuthUrl;
  };

  const handleGoogleSignup = () => {
    // Replace with your Google client ID and callback URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${window.location.origin}/google-callback&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  const handleAppleSignup = () => {
    // Replace with your Apple service ID and callback URL
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=YOUR_APPLE_SERVICE_ID&redirect_uri=${window.location.origin}/apple-callback&response_type=code%20id_token&scope=email%20name&response_mode=web_message`;
    window.location.href = appleAuthUrl;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate phone if provided
    if (state.phone) {
      const phoneValidation = validateGhanaPhoneNumberOnly(state.phone);
      if (phoneValidation) {
        setError(phoneValidation);

        return;
      }
    }

    // Validation
    if (!state.email && !state.phone) {
      setError("Please provide either email or phone number");
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
      // Prepare data for backend
      const registrationData = {
        name: state.name,
        email: state.email,
        phone: state.phone ? state.phone.replace(/\D/g, "") : "", // Store digits only
        password: state.password,
        passwordConfirm: state.passwordConfirm,
      };

      // Simulate API call
      register.mutate(registrationData, {
        onSuccess: () => {
          setState({
            name: "",
            email: "",
            phone: "",
            password: "",
            passwordConfirm: "",
            check: false,
          });
          navigate("/");
        },
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <Logo>YourBrand</Logo>
          <h1>Create Your Account</h1>
          <Subtitle>Join us today for an amazing shopping experience</Subtitle>
        </RegisterHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <RegisterForm onSubmit={submitHandler}>
          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={state.phone}
                onChange={(e) => setState({ ...state, phone: e.target.value })}
                placeholder="e.g. 0241234567 or +233241234567"
                $error={phoneError ? true : false}
              />
              <PhoneNote>
                {phoneError ? (
                  <span style={{ color: "#ef4444" }}>{phoneError}</span>
                ) : (
                  "Valid formats: 0XXXXXXXXX or +233XXXXXXXXX"
                )}
              </PhoneNote>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
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
                minLength="8"
              />
              <PasswordNote>Minimum 8 characters</PasswordNote>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <Input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={state.passwordConfirm}
                onChange={(e) =>
                  setState({ ...state, passwordConfirm: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </FormGroup>
          </FormRow>

          <TermsGroup>
            <CheckboxContainer>
              <HiddenCheckbox
                id="check"
                name="check"
                checked={state.check}
                onChange={(e) =>
                  setState({ ...state, check: e.target.checked })
                }
                required
              />
              <StyledCheckbox $checked={state.check} htmlFor="check">
                <FaCheck size={10} color="white" />
              </StyledCheckbox>
            </CheckboxContainer>
            <TermsLabel htmlFor="check">
              I agree with the{" "}
              <TermsLink to="/terms">privacy policy & terms</TermsLink>
            </TermsLabel>
          </TermsGroup>

          <SubmitButton type="submit" disabled={register.isLoading}>
            {register.isLoading ? <Spinner /> : "Create Account"}
          </SubmitButton>
        </RegisterForm>

        <Divider>
          <DividerLine />
          <DividerText>or sign up with</DividerText>
          <DividerLine />
        </Divider>

        <SocialButtons>
          <SocialButton
            $bg="#3b5998"
            $hover="#344e86"
            onClick={handleFacebookSignup}
          >
            <FaFacebook color="white" size={20} />
            Facebook
          </SocialButton>
          <SocialButton
            $bg="#fff"
            $hover="#f5f5f5"
            $border="#e0e0e0"
            onClick={handleGoogleSignup}
          >
            <FcGoogle size={20} />
            Google
          </SocialButton>
          <SocialButton $bg="#000" $hover="#333" onClick={handleAppleSignup}>
            <FaApple color="white" size={20} />
            Apple
          </SocialButton>
        </SocialButtons>

        <LoginSection>
          <LoginText>Already have an account?</LoginText>
          <LoginLink to="/login">Sign in</LoginLink>
        </LoginSection>
      </RegisterCard>
    </RegisterContainer>
  );
}

// Styled Components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 40px;
`;

const RegisterHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;

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

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  text-align: left;
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
  border: 1px solid ${(props) => (props.$error ? "#ef4444" : "#e0e0e0")};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$error ? "#ef4444" : "#4e73df")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$error ? "rgba(239, 68, 68, 0.2)" : "rgba(78, 115, 223, 0.2)"};
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const PhoneNote = styled.p`
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
`;

const PasswordNote = styled(PhoneNote)`
  margin-top: 5px;
`;

const TermsGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 10px 0 5px;
`;

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
  margin-top: 2px;
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

const StyledCheckbox = styled.div`
  width: 18px;
  height: 18px;
  background: ${(props) => (props.$checked ? "#4e73df" : "white")};
  border: 1px solid ${(props) => (props.$checked ? "#4e73df" : "#e0e0e0")};
  border-radius: 4px;
  transition: all 150ms;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  svg {
    visibility: ${(props) => (props.$checked ? "visible" : "hidden")};
  }
`;

const TermsLabel = styled.label`
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  flex: 1;
`;

const TermsLink = styled(Link)`
  color: #4e73df;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;

  &:hover {
    background: #2e59d9;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
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
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 25px 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: #eaeaea;
`;

const DividerText = styled.span`
  padding: 0 15px;
  color: #6c757d;
  font-size: 14px;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;

  @media (max-width: 480px) {
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
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: ${(props) => (props.$border ? `1px solid ${props.$border}` : "none")};
  background: ${(props) => props.$bg || "#fff"};
  color: ${(props) =>
    props.$bg === "#000" || props.$bg === "#3b5998" ? "white" : "#333"};

  &:hover {
    background: ${(props) => props.$hover || "#f5f5f5"};
  }
`;

const LoginSection = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
`;

const LoginText = styled.span`
  color: #6c757d;
  font-size: 14px;
  margin-right: 8px;
`;

const LoginLink = styled(Link)`
  color: #4e73df;
  font-weight: 500;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;
