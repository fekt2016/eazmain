import { useState } from "react";
import {
  FaHeadset,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaChevronDown,
  FaCreditCard,
  FaTruck,
  FaUndo,
  FaUserCircle,
  FaHandHoldingUsd,
  FaMobileAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import styled from "styled-components";
import { Card } from '../shared/components/ui/Cards';

export default function SupportPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [activeTopic, setActiveTopic] = useState(0);

  const faqs = [
    {
      question: "How can I track my order?",
      answer:
        "You can track your order by logging into your account and visiting the 'My Orders' section. You'll receive tracking updates via email as well.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some exclusions apply for electronics and personal care items.",
    },
    {
      question: "How do I change my account information?",
      answer:
        "You can update your account information by going to 'My Account' > 'Profile Settings'. From there you can change your personal details, password, and communication preferences.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept cash on delivery, mobile money payments, bank transfers, and all major credit cards (Visa, Mastercard, American Express).",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times vary depending on the destination. You can see shipping options at checkout.",
    },
  ];

  const topics = [
    {
      title: "Payment Methods",
      icon: <FaCreditCard />,
      description: "Secure payment options",
      details: (
        <TopicDetails>
          <DetailTitle>Accepted Payment Methods</DetailTitle>
          <PaymentMethods>
            <PaymentMethod>
              <PaymentIcon $color="#28a745">
                <FaHandHoldingUsd />
              </PaymentIcon>
              <PaymentInfo>
                <h4>Cash on Delivery</h4>
                <p>
                  Pay with cash when your order is delivered to your doorstep
                </p>
                <ul>
                  <li>Available for orders under $500</li>
                  <li>No additional fees</li>
                  <li>Exact change required</li>
                </ul>
              </PaymentInfo>
            </PaymentMethod>

            <PaymentMethod>
              <PaymentIcon $color="#007bff">
                <FaMobileAlt />
              </PaymentIcon>
              <PaymentInfo>
                <h4>Mobile Money</h4>
                <p>Quick payments via mobile wallet</p>
                <ul>
                  <li>Supported providers: MTN Mobile Money, Airtel Money</li>
                  <li>Instant payment confirmation</li>
                  <li>No transaction fees</li>
                </ul>
              </PaymentInfo>
            </PaymentMethod>

            <PaymentMethod>
              <PaymentIcon $color="#6610f2">
                <FaExchangeAlt />
              </PaymentIcon>
              <PaymentInfo>
                <h4>Bank Transfer</h4>
                <p>Direct transfer from your bank account</p>
                <ul>
                  <li>Use account number: 1234567890</li>
                  <li>Bank name: Global Commerce Bank</li>
                  <li>Include order ID in reference</li>
                </ul>
              </PaymentInfo>
            </PaymentMethod>
          </PaymentMethods>

          <SecurityNote>
            <strong>Security Note:</strong> We never ask for your banking PIN or
            password. All transactions are encrypted for your protection.
          </SecurityNote>
        </TopicDetails>
      ),
    },
    {
      title: "Shipping Information",
      icon: <FaTruck />,
      description: "Delivery times and costs",
      details: (
        <TopicDetails>
          <DetailTitle>Shipping Options & Delivery Times</DetailTitle>
          <ShippingOptions>
            <Option>
              <h4>Standard Shipping</h4>
              <p>Delivery in 3-5 business days</p>
              <p>
                <strong>Cost:</strong> $4.99 or free for orders over $50
              </p>
            </Option>
            <Option>
              <h4>Express Shipping</h4>
              <p>Delivery in 1-2 business days</p>
              <p>
                <strong>Cost:</strong> $9.99
              </p>
            </Option>
            <Option>
              <h4>Same-Day Delivery</h4>
              <p>Order before 3 PM Ghana time for same-day delivery</p>
              <p>
                <strong>Cost:</strong> $14.99 (Available in select areas)
              </p>
            </Option>
          </ShippingOptions>
          <p>
            International shipping available to 100+ countries with delivery
            times ranging from 5-15 business days.
          </p>
        </TopicDetails>
      ),
    },
    {
      title: "Returns & Refunds",
      icon: <FaUndo />,
      description: "Return policy and procedures",
      details: (
        <TopicDetails>
          <DetailTitle>Our Return Policy</DetailTitle>
          <ReturnSteps>
            <Step>
              <div>1</div>
              <p>Initiate return within 30 days of delivery</p>
            </Step>
            <Step>
              <div>2</div>
              <p>Package item in original condition with tags</p>
            </Step>
            <Step>
              <div>3</div>
              <p>Print return label from your account</p>
            </Step>
            <Step>
              <div>4</div>
              <p>Drop off at any authorized shipping center</p>
            </Step>
          </ReturnSteps>
          <RefundInfo>
            <h4>Refund Processing</h4>
            <ul>
              <li>
                Refunds processed within 3-5 business days after we receive your
                return
              </li>
              <li>Original payment method will be credited</li>
              <li>Refunds may take 7-10 days to appear in your account</li>
            </ul>
          </RefundInfo>
        </TopicDetails>
      ),
    },
    {
      title: "Account Management",
      icon: <FaUserCircle />,
      description: "Manage your account settings",
      details: (
        <TopicDetails>
          <DetailTitle>Managing Your Account</DetailTitle>
          <AccountOptions>
            <AccountOption>
              <h4>Update Personal Information</h4>
              <p>Change your name, email, phone number, and password</p>
            </AccountOption>
            <AccountOption>
              <h4>Communication Preferences</h4>
              <p>
                Manage your subscription to marketing emails and notifications
              </p>
            </AccountOption>
            <AccountOption>
              <h4>Address Book</h4>
              <p>Save multiple shipping addresses for faster checkout</p>
            </AccountOption>
            <AccountOption>
              <h4>Payment Methods</h4>
              <p>Securely store payment options for future purchases</p>
            </AccountOption>
          </AccountOptions>
          <SecurityTip>
            <strong>Security Tip:</strong> Enable two-factor authentication for
            enhanced account security.
          </SecurityTip>
        </TopicDetails>
      ),
    },
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const selectTopic = (index) => {
    setActiveTopic(index);
  };

  return (
    <SupportContainer>
      <SupportHeader>
        <SupportHero>
          <SupportTitle>Customer Support</SupportTitle>
          <SupportSubtitle>
            We&apos;re here to help you with any questions or issues
          </SupportSubtitle>
        </SupportHero>
      </SupportHeader>

      <SupportContent>
        <SupportCards>
          <SupportCard>
            <CardIcon>
              <FaPhone />
            </CardIcon>
            <CardTitle>Call Us</CardTitle>
            <CardContent>
              <p>+1 (800) 123-4567</p>
              <p>Monday - Friday: 8AM - 8PM EST</p>
              <p>Saturday: 9AM - 5PM EST</p>
            </CardContent>
          </SupportCard>

          <SupportCard>
            <CardIcon>
              <FaEnvelope />
            </CardIcon>
            <CardTitle>Email Us</CardTitle>
            <CardContent>
              <p>support@eazshop.com</p>
              <p>We typically respond within 24 hours</p>
              <p>For urgent issues, please call us</p>
            </CardContent>
          </SupportCard>

          <SupportCard>
            <CardIcon>
              <FaMapMarkerAlt />
            </CardIcon>
            <CardTitle>Visit Us</CardTitle>
            <CardContent>
              <p>123 Commerce Street</p>
              <p>New York, NY 10001</p>
              <p>By appointment only</p>
            </CardContent>
          </SupportCard>
        </SupportCards>

        <RecommendedTopics>
          <SectionTitle>Recommended E-commerce Topics</SectionTitle>

          <TopicsTabs>
            {topics.map((topic, index) => (
              <TopicTab
                key={index}
                $active={activeTopic === index}
                onClick={() => selectTopic(index)}
              >
                <TabIcon>{topic.icon}</TabIcon>
                <div>
                  <TabTitle>{topic.title}</TabTitle>
                  <TabDescription>{topic.description}</TabDescription>
                </div>
              </TopicTab>
            ))}
          </TopicsTabs>

          <TopicContent>{topics[activeTopic].details}</TopicContent>
        </RecommendedTopics>

        <FAQSection>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <FAQList>
            {faqs.map((faq, index) => (
              <FAQItem key={index} $isActive={activeFAQ === index}>
                <FAQQuestion onClick={() => toggleFAQ(index)}>
                  <span>{faq.question}</span>
                  <FaqIcon $isActive={activeFAQ === index}>
                    <FaChevronDown />
                  </FaqIcon>
                </FAQQuestion>
                <FAQAnswer $isActive={activeFAQ === index}>
                  {faq.answer}
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQList>
        </FAQSection>

        <SupportActions>
          <ActionButton $type="chat">
            <FaHeadset />
            <ButtonContent>
              <strong>Chat with Us</strong>
              <span>Mon-Sat: 8:00 AM - 7:00 PM</span>
            </ButtonContent>
          </ActionButton>
          <ActionButton $type="call">
            <FaPhone />
            <ButtonContent>
              <strong>Call Support</strong>
              <span>Mon-Sat: 8:00 AM - 7:00 PM</span>
            </ButtonContent>
          </ActionButton>
        </SupportActions>

        <HoursSection>
          <SectionTitle>Support Hours</SectionTitle>
          <HoursGrid>
            <HoursCard>
              <HoursIcon>
                <FaClock />
              </HoursIcon>
              <HoursTitle>Customer Service</HoursTitle>
              <HoursList>
                <li>Monday-Friday: 8AM - 8PM EST</li>
                <li>Saturday: 9AM - 5PM EST</li>
                <li>Sunday: Closed</li>
              </HoursList>
            </HoursCard>

            <HoursCard>
              <HoursIcon>
                <FaHeadset />
              </HoursIcon>
              <HoursTitle>Live Chat</HoursTitle>
              <HoursList>
                <li>Monday-Friday: 9AM - 6PM EST</li>
                <li>Saturday: 10AM - 4PM EST</li>
                <li>Sunday: Closed</li>
              </HoursList>
            </HoursCard>
          </HoursGrid>
        </HoursSection>
      </SupportContent>
    </SupportContainer>
  );
}

// Styled Components
const SupportContainer = styled.div`
  background-color: #f8f9fc;
  min-height: 100vh;
`;

const SupportHeader = styled.div`
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  padding: 80px 5% 60px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -150px;
    left: -100px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SupportHero = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const SupportTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SupportSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SupportContent = styled.div`
  padding: 50px 5%;
  max-width: 1200px;
  margin: 0 auto;
`;

const SupportCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
`;

const SupportCard = styled(Card).attrs({ $hover: true })`
  padding: var(--spacing-xl);
  text-align: center;
`;

const CardIcon = styled.div`
  width: 70px;
  height: 70px;
  background: #f0f5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 30px;
  color: #4e73df;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2e3a59;
`;

const CardContent = styled.div`
  color: #5a5c69;
  line-height: 1.6;

  p {
    margin: 10px 0;
  }
`;

const RecommendedTopics = styled.div`
  margin-bottom: 50px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #2e3a59;
  text-align: center;
  position: relative;
  padding-top: 40px;

  &::after {
    content: "";
    display: block;
    width: 80px;
    height: 4px;
    background: #4e73df;
    margin: 15px auto 0;
    border-radius: 2px;
  }
`;

const TopicsTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e6f5;
  padding: 0 20px;
  overflow-x: auto;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const TopicTab = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  min-width: 250px;

  border-color: ${({ $active }) => ($active ? "#4e73df" : "transparent")};
  background: ${({ $active }) => ($active ? "#f8f9fc" : "transparent")};

  &:hover {
    background: #f8f9fc;
  }

  @media (max-width: 768px) {
    min-width: 200px;
    padding: 15px;
  }
`;

const TabIcon = styled.div`
  font-size: 1.8rem;
  color: #4e73df;
  margin-right: 15px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const TabTitle = styled.h3`
  font-size: 1.1rem;
  color: #2e3a59;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TabDescription = styled.p`
  color: #5a5c69;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const TopicContent = styled.div`
  padding: 40px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const TopicDetails = styled.div`
  color: #5a5c69;
  line-height: 1.7;
`;

const DetailTitle = styled.h3`
  font-size: 1.5rem;
  color: #2e3a59;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e6f5;
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
`;

const PaymentMethod = styled.div`
  background: #f8f9fc;
  border-radius: 10px;
  padding: 25px;
  border-left: 4px solid #4e73df;
`;

const PaymentIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ $color }) => ($color ? `${$color}20` : "#4e73df20")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: ${({ $color }) => $color || "#4e73df"};
  margin-bottom: 20px;
`;

const PaymentInfo = styled.div`
  h4 {
    font-size: 1.3rem;
    color: #2e3a59;
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 15px;
  }

  ul {
    padding-left: 20px;
    margin-top: 10px;

    li {
      margin-bottom: 8px;
      position: relative;

      &::before {
        content: "•";
        color: #4e73df;
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-left: -1em;
      }
    }
  }
`;

const SecurityNote = styled.div`
  background: #fff8e6;
  border-left: 4px solid #ffc107;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
`;

const ShippingOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const Option = styled.div`
  background: #f8f9fc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e6f5;

  h4 {
    font-size: 1.2rem;
    color: #2e3a59;
    margin-bottom: 10px;
  }

  p {
    margin: 8px 0;
  }
`;

const ReturnSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Step = styled.div`
  text-align: center;

  div {
    width: 50px;
    height: 50px;
    background: #4e73df;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: bold;
    margin: 0 auto 15px;
  }

  p {
    font-weight: 500;
    color: #2e3a59;
  }
`;

const RefundInfo = styled.div`
  background: #e6f4ea;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #28a745;

  h4 {
    font-size: 1.2rem;
    color: #2e3a59;
    margin-bottom: 10px;
  }
`;

const AccountOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const AccountOption = styled.div`
  background: #f0f5ff;
  border-radius: 8px;
  padding: 20px;

  h4 {
    font-size: 1.2rem;
    color: #2e3a59;
    margin-bottom: 10px;
  }
`;

const SecurityTip = styled.div`
  background: #e6f0ff;
  border-left: 4px solid #4e73df;
  padding: 15px;
  border-radius: 4px;
`;

const FAQSection = styled.div`
  margin-bottom: 50px;
`;

const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  border-left: 4px solid
    ${({ $isActive }) => ($isActive ? "#4e73df" : "#e0e6f5")};
`;

const FAQQuestion = styled.div`
  padding: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ $isActive }) => ($isActive ? "#f0f5ff" : "white")};
  transition: background 0.3s;

  &:hover {
    background: #f8f9fc;
  }
`;

const FaqIcon = styled.span`
  transition: transform 0.3s;
  transform: rotate(${({ $isActive }) => ($isActive ? "180deg" : "0")});
  color: #4e73df;
`;

const FAQAnswer = styled.div`
  padding: 0 20px;
  max-height: ${({ $isActive }) => ($isActive ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s, padding 0.3s;
  background: #f8f9fc;
  color: #5a5c69;
  line-height: 1.6;

  ${({ $isActive }) => $isActive && "padding: 0 20px 20px;"}
`;

const SupportActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 40px 0 50px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 30px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 280px;
  text-align: left;

  background: ${({ $type }) => ($type === "chat" ? "#4e73df" : "#28a745")};
  color: white;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 15px rgba(0, 0, 0, 0.1);
    background: ${({ $type }) => ($type === "chat" ? "#2e59d9" : "#218838")};
  }

  svg {
    font-size: 1.8rem;
    flex-shrink: 0;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 1.2rem;
    font-weight: 600;
  }

  span {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 5px;
  }
`;

const HoursSection = styled.div`
  margin-bottom: 50px;
`;

const HoursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const HoursCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 30px;
  text-align: center;
`;

const HoursIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #f0f5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
  color: #4e73df;
`;

const HoursTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2e3a59;
`;

const HoursList = styled.ul`
  list-style: none;
  padding: 0;
  color: #5a5c69;
  line-height: 1.8;

  li {
    padding: 5px 0;
  }
`;
