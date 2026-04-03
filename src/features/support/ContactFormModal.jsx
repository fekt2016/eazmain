import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperclip, FaSpinner } from 'react-icons/fa';
import styled from 'styled-components';
import { useCreateTicket } from '../../shared/hooks/useSupport';
import useAuth from '../../shared/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../shared/services/orderApi';
import logger from '../../shared/utils/logger';

/**
 * Contact Form Modal Component
 * Reusable modal for submitting support tickets (Customer version)
 */
const ContactFormModal = ({
  isOpen,
  onClose,
  preselectedDepartment = null,
  role = 'buyer',
  departments = [],
  primaryColor = 'var(--color-primary-500)',
}) => {
  const { mutateAsync: submitTicket, isPending: isSubmitting } = useCreateTicket();
  const { userData } = useAuth();

  // Extract user from userData
  const user = userData?.data?.data || userData?.data?.user || userData?.user || null;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: preselectedDepartment || '',
    subject: '',
    message: '',
    screenshot: null,
    relatedOrderId: '',
    relatedProductId: '',
  });

  // Fetch user orders for order selection
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const response = await orderService.getUserOrders();
      return response?.data?.orders || [];
    },
    enabled: isOpen && (formData.department === 'Orders & Delivery' || formData.department === 'Shipping & Returns' || formData.department === 'Payments & Billing'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const orders = ordersData || [];

  const [errors, setErrors] = useState({});
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Auto-fill from user profile
  useEffect(() => {
    if (user && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        department: preselectedDepartment || '',
        subject: '',
        message: '',
        screenshot: null,
        relatedOrderId: '',
        relatedProductId: '',
      });
      setErrors({});
      setScreenshotPreview(null);
    }
  }, [isOpen, preselectedDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset related fields when department changes
      if (name === 'department') {
        newData.relatedOrderId = '';
        newData.relatedProductId = '';
      }
      // Reset product when order changes
      if (name === 'relatedOrderId') {
        newData.relatedProductId = '';
      }
      return newData;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          screenshot: 'Please upload an image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          screenshot: 'File size must be less than 5MB',
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, screenshot: file }));
      setErrors((prev) => ({ ...prev, screenshot: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setFormData((prev) => ({ ...prev, screenshot: null }));
    setScreenshotPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const ticketData = {
        department: formData.department,
        subject: formData.subject,
        title: formData.subject,
        message: formData.message,
        screenshot: formData.screenshot,
        priority: 'medium',
      };

      // Add related order or product if selected
      if (formData.relatedOrderId) {
        ticketData.relatedOrderId = formData.relatedOrderId;
      }
      if (formData.relatedProductId) {
        ticketData.relatedProductId = formData.relatedProductId;
      }

      await submitTicket(ticketData);

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      // Error is handled by the hook's onError callback
      logger.error('Failed to submit ticket:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay onClick={onClose}>
        <ModalContainer
          onClick={(e) => e.stopPropagation()}
          $primaryColor={primaryColor}
        >
          <ModalHeader>
            <ModalTitle>Contact Support</ModalTitle>
            <CloseButton onClick={onClose} aria-label="Close modal">
              <FaTimes />
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormBody>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="name">
                    Full Name <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    $hasError={!!errors.name}
                  />
                  {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">
                    Email <Required>*</Required>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    $hasError={!!errors.email}
                  />
                  {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="department">
                  Department <Required>*</Required>
                </Label>
                <Select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  $hasError={!!errors.department}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
                {errors.department && (
                  <ErrorMessage>{errors.department}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subject">
                  Subject <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                  disabled={isSubmitting}
                  $hasError={!!errors.subject}
                />
                {errors.subject && (
                  <ErrorMessage>{errors.subject}</ErrorMessage>
                )}
              </FormGroup>

              {/* Order Selection - Show for order/delivery/shipping/payment related departments */}
              {(formData.department === 'Orders & Delivery' ||
                formData.department === 'Shipping & Returns' ||
                formData.department === 'Payments & Billing') && (
                <FormGroup>
                  <Label htmlFor="relatedOrderId">
                    Related Order (Optional)
                  </Label>
                  <Select
                    id="relatedOrderId"
                    name="relatedOrderId"
                    value={formData.relatedOrderId}
                    onChange={handleChange}
                    disabled={isSubmitting || isLoadingOrders}
                    $hasError={!!errors.relatedOrderId}
                  >
                    <option value="">Select an order (optional)</option>
                    {isLoadingOrders ? (
                      <option disabled>Loading orders...</option>
                    ) : (
                      orders.map((order) => (
                        <option key={order._id} value={order._id}>
                          Order #{order.orderNumber || order._id.slice(-8)} - {new Date(order.createdAt).toLocaleDateString()} - ${order.totalPrice?.toFixed(2) || '0.00'}
                        </option>
                      ))
                    )}
                  </Select>
                  {errors.relatedOrderId && (
                    <ErrorMessage>{errors.relatedOrderId}</ErrorMessage>
                  )}
                  {orders.length === 0 && !isLoadingOrders && (
                    <HelperText>
                      No orders found. You can still submit a ticket without selecting an order.
                    </HelperText>
                  )}
                </FormGroup>
              )}

              {/* Product Selection - Show when an order is selected */}
              {formData.relatedOrderId && (
                <FormGroup>
                  <Label htmlFor="relatedProductId">
                    Related Product (Optional)
                  </Label>
                  <Select
                    id="relatedProductId"
                    name="relatedProductId"
                    value={formData.relatedProductId}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    $hasError={!!errors.relatedProductId}
                  >
                    <option value="">Select a product (optional)</option>
                    {(() => {
                      const selectedOrder = orders.find(o => o._id === formData.relatedOrderId);
                      if (selectedOrder?.orderItems && selectedOrder.orderItems.length > 0) {
                        return selectedOrder.orderItems.map((item, index) => {
                          // Handle both populated and non-populated order items
                          const productId = item.product?._id || item.product || item.productId;
                          const productName = item.product?.name || 'Product';
                          const quantity = item.quantity || 1;

                          return (
                            <option key={productId || index} value={productId}>
                              {productName} - Qty: {quantity}
                            </option>
                          );
                        });
                      }
                      return null;
                    })()}
                  </Select>
                  {errors.relatedProductId && (
                    <ErrorMessage>{errors.relatedProductId}</ErrorMessage>
                  )}
                  <HelperText>
                    Select a specific product from the order if your issue is product-specific.
                  </HelperText>
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="message">
                  Message <Required>*</Required>
                </Label>
                <TextArea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  disabled={isSubmitting}
                  $hasError={!!errors.message}
                />
                {errors.message && (
                  <ErrorMessage>{errors.message}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="screenshot">
                  Screenshot (Optional)
                </Label>
                <FileInputWrapper>
                  <FileInput
                    type="file"
                    id="screenshot"
                    name="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  <FileInputLabel htmlFor="screenshot">
                    <FaPaperclip />
                    <span>
                      {formData.screenshot
                        ? formData.screenshot.name
                        : 'Choose file or drag and drop'}
                    </span>
                  </FileInputLabel>
                </FileInputWrapper>
                {errors.screenshot && (
                  <ErrorMessage>{errors.screenshot}</ErrorMessage>
                )}
                {screenshotPreview && (
                  <ScreenshotPreview>
                    <PreviewImage src={screenshotPreview} alt="Preview" />
                    <RemoveButton type="button" onClick={removeScreenshot}>
                      <FaTimes />
                    </RemoveButton>
                  </ScreenshotPreview>
                )}
              </FormGroup>
            </FormBody>

            <ModalFooter>
              <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </CancelButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                $primaryColor={primaryColor}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Submitting...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </SubmitButton>
            </ModalFooter>
          </Form>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default ContactFormModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-grey-100);
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin: 0;
`;

const CloseButton = styled.button`
  background: var(--color-grey-100);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--color-grey-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: var(--color-grey-200);
    color: var(--color-grey-700);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const FormBody = styled.div`
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-grey-700);
`;

const Required = styled.span`
  color: var(--color-red-600);
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid ${(props) => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-grey-900);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(212,136,42,0.1);
  }

  &:disabled {
    background: var(--color-grey-50);
    opacity: 0.7;
    cursor: not-allowed;
  }

  &::placeholder { color: var(--color-grey-400); }
`;

const Select = styled.select`
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid ${(props) => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-grey-900);
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: var(--color-primary-500); }
  &:disabled { background: var(--color-grey-50); opacity: 0.7; cursor: not-allowed; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid ${(props) => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-grey-900);
  resize: vertical;
  min-height: 100px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(212,136,42,0.1);
  }

  &:disabled { background: var(--color-grey-50); opacity: 0.7; cursor: not-allowed; }
  &::placeholder { color: var(--color-grey-400); }
`;

const FileInputWrapper = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1.5px dashed var(--color-grey-300);
  border-radius: 8px;
  background: var(--color-grey-50);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--color-grey-600);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary-500);
    background: #fffbf5;
    color: var(--color-primary-700);
  }
`;

const ScreenshotPreview = styled.div`
  position: relative;
  margin-top: 8px;
  display: inline-block;
`;

const PreviewImage = styled.img`
  max-width: 180px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid var(--color-grey-200);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-red-600);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s;

  &:hover { background: var(--color-red-700); }
`;

const ErrorMessage = styled.span`
  font-size: 0.72rem;
  color: var(--color-red-600);
`;

const HelperText = styled.p`
  font-size: 0.72rem;
  color: var(--color-grey-500);
  font-style: italic;
  margin: 0;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid var(--color-grey-100);

  @media (max-width: 500px) {
    flex-direction: column-reverse;
    button { width: 100%; }
  }
`;

const CancelButton = styled.button`
  padding: 9px 20px;
  background: #fff;
  color: var(--color-grey-700);
  border: 1.5px solid var(--color-grey-300);
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SubmitButton = styled.button`
  padding: 9px 20px;
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  box-shadow: 0 4px 12px rgba(212,136,42,0.3);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(212,136,42,0.4);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
