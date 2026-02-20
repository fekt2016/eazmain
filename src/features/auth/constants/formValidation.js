import { validateGhanaPhoneNumberOnly } from '../../../shared/utils/helpers';
import { sanitizeEmail, sanitizeName, sanitizePhone, sanitizeText } from '../../../shared/utils/sanitize';

export const DEFAULT_FORM_VALUES = {
  name: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  check: false,
};

export const VALIDATION_RULES = {
  name: {
    required: "Full name is required",
    maxLength: {
      value: 100,
      message: "Name must be less than 100 characters"
    },
    validate: {
      sanitize: (value) => {
        const sanitized = sanitizeName(value);
        return sanitized === value.trim() || "Invalid characters in name. Use letters, spaces, hyphens, and apostrophes only.";
      }
    }
  },
  email: {
    required: "Email is required for account verification",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address"
    },
    maxLength: {
      value: 255,
      message: "Email must be less than 255 characters"
    },
    validate: {
      sanitize: (value) => {
        const sanitized = sanitizeEmail(value);
        return sanitized === value || "Invalid characters in email";
      }
    }
  },
  phone: {
    validate: {
      ghanaPhone: (value) => {
        if (!value) return true;
        const error = validateGhanaPhoneNumberOnly(value);
        return error || true;
      },
      sanitize: (value) => {
        if (!value) return true;
        const sanitized = sanitizePhone(value);
        return sanitized === value || "Invalid characters in phone number";
      }
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters"
    },
    maxLength: {
      value: 128,
      message: "Password must be less than 128 characters"
    },
    validate: {
      hasNumber: (value) =>
        /\d/.test(value) ||
        "Almost there! Add at least one number (e.g. 1, 2, 3) to make your password stronger.",
      hasSpecialChar: (value) =>
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value) ||
        "Almost there! Add a special character (e.g. ! @ # $ %) to make your password more secure."
    }
  },
  passwordConfirm: {
    required: "Please confirm your password",
    validate: {
      match: (value, formValues) => {
        return value === formValues.password || "Passwords do not match";
      }
    }
  },
  check: {
    required: "You must agree to the privacy policy & terms",
    validate: {
      checked: (value) => value === true || "You must agree to the privacy policy & terms"
    }
  }
};

export const sanitizeFormData = (data) => ({
  name: sanitizeName(data.name || ""),
  email: sanitizeEmail(data.email || ""),
  phone: data.phone ? sanitizePhone(data.phone).replace(/\D/g, "") : "",
  password: (data.password || "").slice(0, 128),
  passwordConfirm: (data.passwordConfirm || "").slice(0, 128),
});
