import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import {
  FAQSection,
  FAQContainer,
  FAQTitle,
  FAQDescription,
  FAQList,
  FAQItem,
  FAQQuestion,
  FAQAnswer,
  FAQIcon,
} from './shipping.styles';

const faqData = [
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary by delivery option and location. Standard delivery takes 1-5 business days, Express delivery takes 1-2 business days, and Same-Day delivery is available in select cities. Exact delivery estimates are shown at checkout.',
  },
  {
    question: 'Can I change my delivery address after placing an order?',
    answer: 'You can update your delivery address if your order hasn\'t been shipped yet. Once the seller has shipped your order, address changes may not be possible. Contact our support team for assistance.',
  },
  {
    question: 'What if my order is delayed?',
    answer: 'If your order is delayed beyond the estimated delivery date, we\'ll notify you via email or SMS. You can track your order status in real-time. If there are significant delays, please contact our support team for assistance.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we primarily ship within Ghana and select African countries. International shipping availability depends on the seller and product. Check product pages for shipping information or contact support for details.',
  },
  {
    question: 'What happens if I\'m not available to receive my order?',
    answer: 'If you\'re not available, the delivery person will attempt to contact you. You can also provide delivery instructions when placing your order. Some locations may offer pickup points or rescheduling options.',
  },
  {
    question: 'Are shipping costs refundable?',
    answer: 'Shipping costs are generally non-refundable unless the order is canceled before shipment or there\'s an error on our part. If you return an item, return shipping costs may apply as per our Return & Refund Policy.',
  },
];

const ShippingFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FAQSection>
      <FAQContainer>
        <FAQTitle>Frequently Asked Questions</FAQTitle>
        <FAQDescription>
          Common questions about shipping and delivery
        </FAQDescription>
        <FAQList>
          {faqData.map((faq, index) => (
            <FAQItem key={index}>
              <FAQQuestion
                onClick={() => toggleFAQ(index)}
                $isOpen={openIndex === index}
              >
                <span>{faq.question}</span>
                <FAQIcon $isOpen={openIndex === index}>
                  <FaChevronDown />
                </FAQIcon>
              </FAQQuestion>
              <AnimatePresence>
                {openIndex === index && (
                  <FAQAnswer
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </FAQAnswer>
                )}
              </AnimatePresence>
            </FAQItem>
          ))}
        </FAQList>
      </FAQContainer>
    </FAQSection>
  );
};

export default ShippingFAQ;

