import { useState } from "react";
import styled from "styled-components";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import InputField from "./InputField";

const PasswordField = ({ id, label, error, required = false, ...inputProps }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <PasswordFieldWrapper>
      <InputField
        id={id}
        label={label}
        type={showPassword ? "text" : "password"}
        icon={FaLock}
        error={error}
        required={required}
        endAdornment={
          <ToggleButton
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            tabIndex={0}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </ToggleButton>
        }
        {...inputProps}
      />
    </PasswordFieldWrapper>
  );
};

const PasswordFieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: #667eea;
  }
  
  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

export default PasswordField;
