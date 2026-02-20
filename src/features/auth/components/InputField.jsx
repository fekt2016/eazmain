import styled from "styled-components";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

const InputField = ({ 
  id, 
  label, 
  type = "text", 
  icon: Icon, 
  error, 
  required = false,
  endAdornment,
  ...inputProps 
}) => {
  const iconMap = {
    text: FaUser,
    email: FaEnvelope,
    tel: FaPhone,
    phone: FaPhone,
    password: FaLock,
  };

  const InputIcon = Icon || iconMap[type] || null;

  return (
    <InputGroup>
      <Label htmlFor={id}>
        {label}
        {required && <RequiredAsterisk>*</RequiredAsterisk>}
      </Label>
      <InputWrapper>
        {InputIcon && (
          <InputIconWrapper>
            <InputIcon />
          </InputIconWrapper>
        )}
        {endAdornment && (
          <EndAdornmentWrapper>{endAdornment}</EndAdornmentWrapper>
        )}
        <Input
          type={type}
          id={id}
          $error={!!error}
          $hasIcon={!!InputIcon}
          $hasEndAdornment={!!endAdornment}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
      </InputWrapper>
      {error && (
        <ErrorText id={`${id}-error`} role="alert">
          {error}
        </ErrorText>
      )}
    </InputGroup>
  );
};

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const RequiredAsterisk = styled.span`
  color: #ef4444;
  margin-left: 2px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const EndAdornmentWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const InputIconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px ${props => props.$hasEndAdornment ? "48px" : "16px"} 14px ${props => props.$hasIcon ? "48px" : "16px"};
  border: 2px solid ${props => props.$error ? "#ef4444" : "#eee"};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? "#ef4444" : "#667eea"};
    background: white;
    box-shadow: 0 0 0 4px ${props => props.$error ? "rgba(239, 68, 68, 0.1)" : "rgba(102, 126, 234, 0.1)"};
  }
  
  &::placeholder {
    color: #aaa;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f0f0f0;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 12px;
`;

export default InputField;
