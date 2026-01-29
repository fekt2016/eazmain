import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  FaEnvelopeOpenText,
  FaHeadset,
  FaEnvelope,
  FaPhone,
  FaPaperclip,
  FaSpinner,
} from 'react-icons/fa';
import { spin } from '../../shared/styles/animations';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { useSubmitContactForm } from '../../shared/hooks/useContact';
import logger from '../../shared/utils/logger';
import {
  ContactContainer,
  HeroSection,
  HeroContent,
  HeroIcon,
  HeroTitle,
  HeroSubtitle,
  SectionWrapper,
  SectionTitle,
  SectionDescription,
  ContactOptionsGrid,
  ContactCard,
  ContactCardIcon,
  ContactCardTitle,
  ContactCardDescription,
  ContactCardInfo,
  ContactCardButton,
  FormContainer,
  FormTitle,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FileInputWrapper,
  FileInputLabel,
  FileInputText,
  SubmitButton,
  LocationGrid,
  LocationContent,
  LocationMap,
} from './contact.styles';

// Spinner with animation
const SpinningIcon = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

/**
 * Modern Contact Us Page for Saiisai/EazWorld
 * Fully responsive with form validation and React Query integration
 */
const ContactPage = () => {
  // SEO
  useDynamicPageTitle({
    title: "Contact Us",
    description: "Get in touch with Saiisai customer support for help with orders, returns, and more.",
    defaultTitle: "Contact • Saiisai",
    defaultDescription: "Reach out to our team for assistance.",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: null,
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState('');

  // React Query mutation
  const submitMutation = useSubmitContactForm();

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        attachment: file,
      }));
      setFileName(file.name);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitMutation.mutateAsync(formData);
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        attachment: null,
      });
      setFileName('');
      setErrors({});
    } catch (error) {
      // Error is handled by the mutation's onError callback
      logger.error('Form submission error:', error);
    }
  };

  // Handle chat support
  const handleChatSupport = () => {
    if (window.chatWidget) {
      window.chatWidget.open();
    } else {
      toast.info('Chat support will be available soon. Please use the contact form or email us.');
    }
  };

  // Handle email
  const handleEmail = () => {
    window.location.href = 'mailto:support@saiisai.com?subject=Contact%20from%20Saiisai';
  };

  // Handle phone
  const handlePhone = () => {
    window.location.href = 'tel:+233123456789';
  };

  return (
    <ContactContainer>
      {/* SECTION 1 — HERO */}
      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <HeroContent>
          <HeroIcon variants={fadeUp}>
            <FaEnvelopeOpenText />
          </HeroIcon>
          <HeroTitle variants={fadeUp}>Get in Touch</HeroTitle>
          <HeroSubtitle variants={fadeUp}>
            We're here to help you with orders, payments, and general inquiries.
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {/* SECTION 2 — CONTACT OPTIONS */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <ContactOptionsGrid>
          <ContactCard
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <ContactCardIcon $bgColor="var(--color-blue-100)" $iconColor="var(--color-blue-700)">
              <FaHeadset />
            </ContactCardIcon>
            <ContactCardTitle>Customer Support</ContactCardTitle>
            <ContactCardDescription>
              Get help with your orders, account, or payment issues.
            </ContactCardDescription>
            <ContactCardButton
              onClick={handleChatSupport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Chat With Support
            </ContactCardButton>
          </ContactCard>

          <ContactCard
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <ContactCardIcon $bgColor="var(--color-primary-50)" $iconColor="var(--color-primary-500)">
              <FaEnvelope />
            </ContactCardIcon>
            <ContactCardTitle>Email Support</ContactCardTitle>
            <ContactCardDescription>
              Send us an email and we'll respond within 24 hours.
            </ContactCardDescription>
            <ContactCardInfo>support@eazshop.com</ContactCardInfo>
            <ContactCardButton
              onClick={handleEmail}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Email
            </ContactCardButton>
          </ContactCard>

          <ContactCard
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <ContactCardIcon $bgColor="var(--color-green-100)" $iconColor="var(--color-green-700)">
              <FaPhone />
            </ContactCardIcon>
            <ContactCardTitle>Phone Support</ContactCardTitle>
            <ContactCardDescription>
              Call us during business hours for immediate assistance.
            </ContactCardDescription>
            <ContactCardInfo>+233 (123) 456 789</ContactCardInfo>
            <ContactCardButton
              onClick={handlePhone}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Call Now
            </ContactCardButton>
          </ContactCard>
        </ContactOptionsGrid>
      </SectionWrapper>

      {/* SECTION 3 — CONTACT FORM */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <FormContainer>
          <FormTitle>Send Us a Message</FormTitle>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <FormLabel htmlFor="name" $required>
                  Full Name
                </FormLabel>
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={submitMutation.isPending}
                  $hasError={!!errors.name}
                />
                {errors.name && (
                  <span style={{ color: 'var(--color-red-600)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                    {errors.name}
                  </span>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="email" $required>
                  Email Address
                </FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={submitMutation.isPending}
                  $hasError={!!errors.email}
                />
                {errors.email && (
                  <span style={{ color: 'var(--color-red-600)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                    {errors.email}
                  </span>
                )}
              </FormGroup>

              <FormGroup $fullWidth>
                <FormLabel htmlFor="subject" $required>
                  Subject
                </FormLabel>
                <FormInput
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  disabled={submitMutation.isPending}
                  $hasError={!!errors.subject}
                />
                {errors.subject && (
                  <span style={{ color: 'var(--color-red-600)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                    {errors.subject}
                  </span>
                )}
              </FormGroup>

              <FormGroup $fullWidth>
                <FormLabel htmlFor="message" $required>
                  Message
                </FormLabel>
                <FormTextarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  disabled={submitMutation.isPending}
                  $hasError={!!errors.message}
                />
                {errors.message && (
                  <span style={{ color: 'var(--color-red-600)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                    {errors.message}
                  </span>
                )}
              </FormGroup>

              <FormGroup $fullWidth>
                <FormLabel htmlFor="attachment">
                  Screenshot or Image (Optional)
                </FormLabel>
                <FileInputWrapper>
                  <FileInputLabel htmlFor="attachment">
                    <FaPaperclip />
                    <FileInputText>
                      {fileName || 'Click to upload an image (max 5MB)'}
                    </FileInputText>
                  </FileInputLabel>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitMutation.isPending}
                    style={{ display: 'none' }}
                  />
                </FileInputWrapper>
                {fileName && (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-grey-600)', marginTop: 'var(--spacing-xs)' }}>
                    Selected: {fileName}
                  </p>
                )}
              </FormGroup>
            </FormGrid>

            <SubmitButton
              type="submit"
              disabled={submitMutation.isPending}
              whileHover={{ scale: submitMutation.isPending ? 1 : 1.02 }}
              whileTap={{ scale: submitMutation.isPending ? 1 : 0.98 }}
            >
              {submitMutation.isPending ? (
                <>
                  <SpinningIcon />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </SubmitButton>
          </form>
        </FormContainer>
      </SectionWrapper>

      {/* SECTION 4 — LOCATION */}
      <SectionWrapper
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        style={{ background: 'var(--color-grey-50)' }}
      >
        <SectionTitle>Our Office</SectionTitle>
        <SectionDescription>
          Visit or reach our headquarters for business inquiries.
        </SectionDescription>
        <LocationGrid>
          <LocationContent>
            <h3>EazWorld Headquarters</h3>
            <p>
              We're located in the heart of Accra, Ghana, where we work every day
              to build and improve our digital ecosystem.
            </p>
            <address>
              Accra, Ghana • EazWorld HQ
            </address>
          </LocationContent>
          <LocationMap
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Map placeholder - can be replaced with actual map component */}
          </LocationMap>
        </LocationGrid>
      </SectionWrapper>
    </ContactContainer>
  );
};

export default ContactPage;

