import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportService } from '../services/supportApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * React Query hooks for support ticket operations (Buyer)
 */

/**
 * Create a new support ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (ticketData) => supportService.createTicket(ticketData),
    onSuccess: (data) => {
      toast.success(
        data?.message || 'Support ticket created successfully! We\'ll get back to you soon.'
      );
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      // Redirect to ticket list or detail
      if (data?.data?.ticket?._id) {
        navigate(`/support/tickets/${data.data.ticket._id}`);
      } else {
        navigate('/support/tickets');
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create support ticket. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Get current user's tickets
 */
export const useMyTickets = (params = {}) => {
  return useQuery({
    queryKey: ['support-tickets', 'my', params],
    queryFn: () => supportService.getMyTickets(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single ticket by ID
 */
export const useTicketDetail = (ticketId) => {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => supportService.getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 10000, // 10 seconds
  });
};

/**
 * Reply to a ticket
 */
export const useReplyToTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, replyData }) => supportService.replyToTicket(ticketId, replyData),
    onSuccess: (data, variables) => {
      toast.success('Reply sent successfully');
      // Invalidate ticket detail and list
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send reply. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Legacy hook for backward compatibility
 */
export const useSupport = () => {
  const createTicket = useCreateTicket();
  return {
    submitTicket: createTicket,
    isSubmitting: createTicket.isPending,
  };
};

export default useSupport;
