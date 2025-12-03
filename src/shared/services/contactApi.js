import api from './api';

/**
 * Contact API Service
 * Handles contact form submissions and inquiries
 */

const contactService = {
  /**
   * Submit contact form
   * @param {Object} formData - Contact form data
   * @param {string} formData.name - Full name
   * @param {string} formData.email - Email address
   * @param {string} formData.subject - Subject
   * @param {string} formData.message - Message
   * @param {File} formData.attachment - Optional file attachment
   * @returns {Promise} API response
   */
  submitContactForm: async (formData) => {
    const formDataToSend = new FormData();
    
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);
    
    if (formData.attachment) {
      formDataToSend.append('attachment', formData.attachment);
    }

    const response = await api.post('/contact', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default contactService;

