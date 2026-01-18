import { FaCheck } from "react-icons/fa";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

const CheckboxField = ({ 
  id, 
  label, 
  checked, // Visual state from watch() - not passed to input
  error, 
  required = false,
  linkTo,
  linkText,
  ...registerProps // React Hook Form register returns { onChange, onBlur, name, ref }
}) => {
  const navigate = useNavigate();
  
  // Visual state only - React Hook Form manages actual checkbox state
  const isChecked = checked ?? false;
  
  // Spread React Hook Form props directly to the input
  const checkboxProps = {
    ...registerProps,
    id,
    type: "checkbox",
    required,
    'aria-invalid': error ? "true" : "false",
    'aria-describedby': error ? `${id}-error` : undefined,
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (linkTo) {
      navigate(linkTo);
    }
  };

  return (
    <>
      <CheckboxGroup>
        <CheckboxLabel htmlFor={id}>
          <CheckboxContainer>
            <HiddenCheckbox {...checkboxProps} />
            <StyledCheckbox $checked={isChecked}>
              {isChecked && <FaCheck size={10} color="#667eea" />}
            </StyledCheckbox>
          </CheckboxContainer>
          <LabelText>
            {label}
            {linkTo && linkText && (
              <>
                {" "}
                <Link to={linkTo} onClick={handleLinkClick}>
                  {linkText}
                </Link>
              </>
            )}
          </LabelText>
        </CheckboxLabel>
      </CheckboxGroup>
      {error && (
        <ErrorText id={`${id}-error`} role="alert">
          {error}
        </ErrorText>
      )}
    </>
  );
};

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxContainer = styled.div`
  position: relative;
  top: 2px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  cursor: pointer;
  z-index: 2;
  pointer-events: auto;
  appearance: none;
  -webkit-appearance: none;
`;

const StyledCheckbox = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid ${props => props.$checked ? "#667eea" : "#ddd"};
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  position: relative;
  z-index: 1;
  
  label:hover > div > & {
    border-color: #667eea;
  }
  
  input:focus + & {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
`;

const LabelText = styled.span`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  flex: 1;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 12px;
  display: block;
  margin-top: 4px;
`;

export default CheckboxField;
