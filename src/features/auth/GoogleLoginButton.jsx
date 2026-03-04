import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import api from "../../shared/services/api";
import { PATHS } from "../../routes/routePaths";
import logger from "../../shared/utils/logger";
import styled from "styled-components";
import { useModal } from "../../shared/hooks/useModal";

/**
 * Google OAuth login/signup button. Renders a visible "Google" button.
 * Uses SDK when clientId is set; otherwise shows a disabled placeholder.
 */
export default function GoogleLoginButton({ appType = "buyer", onComplete, className }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { showInfo } = useModal();

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;

      if (!credential) {
        logger.error("[GoogleLogin] Missing credential from Google response", {
          appType,
          credentialResponse,
        });
        return;
      }

      const response = await api.post("/auth/google", {
        token: credential,
        appType,
      });

      logger.log("[GoogleLogin] Google auth success", {
        appType,
        status: response?.data?.status || "ok",
      });

      if (onComplete) {
        onComplete(response.data);
      } else {
        // Full page load so cookie is sent; redirect to home so buyer is signed in there
        window.location.href = PATHS.HOME;
      }
    } catch (error) {
      logger.error("[GoogleLogin] Google login failed", {
        appType,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  if (!clientId) {
    return (
      <GoogleButtonPlaceholder
        className={className}
        type="button"
        onClick={() => showInfo({
          title: "Configuration Required",
          message: "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file."
        })}
        title="Google sign-in not configured"
      >
        <FcGoogle size={18} />
        <span>Google</span>
      </GoogleButtonPlaceholder>
    );
  }

  return (
    <GoogleButtonWrap className={className}>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() =>
          logger.error("[GoogleLogin] Google login failed (onError callback)", { appType })
        }
        useOneTap={false}
        size="large"
      />
    </GoogleButtonWrap>
  );
}

const GoogleButtonWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;

  & > div {
    width: 100% !important;
  }
  iframe {
    width: 100% !important;
    border-radius: 8px;
  }
`;

const GoogleButtonPlaceholder = styled.button`
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #cbd5e1;
  }
`;
