import { useMutation } from '@tanstack/react-query';
import contactService from '../services/contactApi';
import { toast } from 'react-toastify';

/**
 * React Query hook for contact form submission
 */
export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: (formData) => contactService.submitContactForm(formData),
    onSuccess: (data) => {
      toast.success(
        data?.message || 'Thank you for contacting us! We\'ll get back to you soon.'
      );
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send message. Please try again.';
      toast.error(errorMessage);
    },
  });
};

