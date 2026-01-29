import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeadset } from 'react-icons/fa';
import useDynamicPageTitle from '../../shared/hooks/useDynamicPageTitle';
import { PATHS } from '../../routes/routePaths';
import {
  PolicyContainer,
  PolicyContent,
  PolicyHeader,
  PolicyTitle,
  LastUpdated,
  IntroText,
  PolicySection,
  SectionTitle,
  SectionContent,
  NumberedList,
  LetteredList,
  BulletList,
  Paragraph,
  ImportantNotice,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Privacy Policy Page for Saiisai (Buyer App)
 * Comprehensive privacy policy explaining how we collect, use, and protect buyer information
 */
const PrivacyPolicyPage = () => {
  // Get today's date for "Effective Date"
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SEO
  useDynamicPageTitle({
    title: 'Privacy Policy • Saiisai',
    description: 'Learn how Saiisai collects, uses, shares and protects your personal information as a buyer.',
    keywords: 'privacy policy, data protection, Saiisai privacy, buyer privacy, personal information',
    defaultTitle: 'Privacy Policy • Saiisai',
    defaultDescription: 'Learn how Saiisai collects, uses, shares and protects your personal information as a buyer.',
  });

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PolicyContainer>
      <PolicyContent
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Privacy Policy</PolicyTitle>
          <LastUpdated>Effective Date: {effectiveDate}</LastUpdated>
          <IntroText>
            At Saiisai, operated by EazWorld, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our marketplace platform, including our website and mobile applications. By using Saiisai, you agree to the practices described in this policy.
          </IntroText>
        </PolicyHeader>

        {/* Section 1: Introduction */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>1. Introduction</SectionTitle>
          <SectionContent>
            <Paragraph>
              Saiisai is an online marketplace operated by EazWorld, connecting buyers with sellers across Ghana and beyond. This Privacy Policy applies to all information collected through our website (saiisai.com), mobile applications, and any other services that link to this policy.
            </Paragraph>
            <Paragraph>
              We understand the importance of privacy and are dedicated to maintaining the confidentiality and security of your personal information. This policy outlines our practices regarding the collection, use, disclosure, and protection of your data when you interact with our platform as a buyer.
            </Paragraph>
            <Paragraph>
              Please read this Privacy Policy carefully. If you do not agree with our practices, please do not use our services. We may update this policy from time to time, and we encourage you to review it periodically.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 2: What Information We Collect */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>2. What Information We Collect</SectionTitle>
          <SectionContent>
            <Paragraph>
              We collect various types of information to provide you with a seamless shopping experience, process your orders, and improve our services. The information we collect falls into three main categories:
            </Paragraph>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.1 Information You Provide
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Account and Profile Information:</strong> When you create an account, we collect your name, email address, phone number, password, and any preferences you set. You may also provide additional profile information such as your date of birth, gender, and communication preferences.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Order and Checkout Information:</strong> To process your purchases, we collect your shipping address, billing address, contact phone number, and payment information. Payment details are processed securely through our payment service providers and are not stored on our servers. We may also collect tax identification numbers or other information required by applicable laws for certain transactions.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Customer Support Communications:</strong> When you contact our support team, we collect the information you provide, including your messages, inquiries, support tickets, and any attachments you send. We may also record phone calls for quality assurance purposes, with your consent where required by law.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Reviews and User-Generated Content:</strong> When you write product reviews, submit ratings, upload photos or videos, or post comments, we collect and store this content along with your account information. This content may be publicly visible on our platform.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Promotions and Surveys:</strong> If you participate in promotions, contests, surveys, or special events, we collect the information you provide, including your responses, preferences, and any additional details required for participation.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Other Information:</strong> Any other information you choose to provide to us, such as feedback, suggestions, or communications through our platform.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.2 Information from Third-Party Sources
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Social Media Logins:</strong> If you choose to sign in using social media accounts (such as Google or Facebook), we receive information from those platforms, including your name, email address, profile picture, and other information you have authorized them to share.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Providers:</strong> Our payment processors share transaction information with us, including payment method details, transaction status, and fraud prevention data, to help us process and manage your orders.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Logistics Partners:</strong> Delivery and shipping partners provide us with delivery status updates, address verification, and delivery confirmation information to help us track your orders and ensure successful delivery.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Data Providers and Marketing Partners:</strong> We may receive information from third-party data providers and marketing partners to help us better understand our customers, improve our services, and deliver relevant advertising. This may include demographic information, interests, and purchase behavior data.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Public Sources:</strong> In limited circumstances, we may collect information from publicly available sources, such as public directories or social media profiles, to verify information or enhance our understanding of our user base.
                </Paragraph>
              </li>
            </BulletList>

            <SectionTitle style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-xl)' }}>
              2.3 Information Collected Automatically
            </SectionTitle>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Device Information:</strong> We automatically collect information about the device you use to access Saiisai, including your device model, operating system, browser type and version, language preferences, unique device identifiers, and mobile network information.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Usage Data:</strong> We collect information about how you interact with our platform, including the pages you visit, the time you spend on each page, the links you click, the products you view, your search queries, and the referring website or source that led you to EazShop. We also track email opens and interactions with our communications.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Location Information:</strong> We may collect approximate location information based on your IP address or device settings. This helps us provide location-based services, such as showing you products available in your area or calculating shipping costs.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, pixels, and similar tracking technologies to collect information about your browsing behavior, preferences, and interactions with our platform. This helps us remember your preferences, analyze site traffic, and personalize your experience. For detailed information about our use of cookies, please refer to our <Link to="/cookies" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Cookie Policy</Link>.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 3: How and Why We Use Your Information */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>3. How and Why We Use Your Information</SectionTitle>
          <SectionContent>
            <Paragraph>
              We use the information we collect for various purposes to provide, maintain, and improve our services, as well as to comply with legal obligations and protect our platform. Here are the main ways we use your information:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Account Management:</strong> We use your information to create and maintain your account, authenticate your identity, manage your profile, and provide you with access to our services.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Order Processing:</strong> We use your information to process your orders, facilitate payments, arrange shipping and delivery, handle returns and refunds, and communicate with you about your orders. This includes sharing necessary information with sellers, payment processors, and logistics partners.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Service Improvement:</strong> We analyze usage data and feedback to understand how our platform is used, identify areas for improvement, fix technical issues, optimize performance, and develop new features and services.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Personalization:</strong> We use your browsing history, purchase behavior, preferences, and other information to personalize your experience, recommend products you might like, customize content, and show you relevant offers and promotions.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Communication:</strong> We use your contact information to send you order confirmations, shipping updates, account notifications, customer support responses, and important service announcements. We may also send you marketing communications if you have opted in, and you can opt out at any time.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Promotions and Events:</strong> We use your information to administer promotions, contests, surveys, and special events, including processing entries, awarding prizes, and analyzing participation.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Marketing and Advertising:</strong> Subject to applicable laws and your preferences, we use your information to deliver targeted advertising, measure advertising effectiveness, and conduct marketing campaigns. We may also use your information for interest-based advertising, both on our platform and on third-party websites and apps.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Security and Fraud Prevention:</strong> We use your information to detect, prevent, and investigate fraudulent transactions, unauthorized access, security threats, and other illegal activities. This helps protect you, other users, and our platform.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Legal Compliance and Enforcement:</strong> We use your information to comply with applicable laws, regulations, and legal processes, respond to government requests, enforce our Terms of Service, protect our rights and property, and resolve disputes.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Consent-Based Uses:</strong> We may use your information for other purposes with your explicit consent, which you can withdraw at any time.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 4: How and Why We Share Your Information */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>4. How and Why We Share Your Information</SectionTitle>
          <SectionContent>
            <Paragraph>
              We do not sell your personal information. We share your information only in the circumstances described below and always in accordance with this Privacy Policy:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>EazWorld Affiliates:</strong> We may share your information with other EazWorld entities and affiliates to provide integrated services, process orders, fulfill deliveries, provide customer support, and manage our business operations. These affiliates are bound by the same privacy standards.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Service Providers:</strong> We share information with trusted third-party service providers who perform services on our behalf, including hosting, data storage, IT support, customer service, analytics, marketing, payment processing, and logistics. These providers are contractually obligated to protect your information and use it only for the purposes we specify.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Processors:</strong> We share payment and transaction information with payment processors and financial institutions to process payments, prevent fraud, and handle payment-related disputes. These processors are subject to strict security and privacy standards.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Advertising and Analytics Partners:</strong> We share information with advertising networks, analytics providers, and marketing partners to deliver personalized ads, measure campaign effectiveness, and analyze user behavior. For information about opting out of interest-based advertising, see the "Your Rights and Choices" section below and our <Link to="/cookies" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Cookie Policy</Link>.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Business Partners:</strong> We may share information with business partners for co-branded promotions, joint marketing campaigns, or other collaborative initiatives. We will notify you of such sharing when required by law.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Merchants and Sellers:</strong> When you place an order, we share necessary information with the seller to fulfill your order, including your name, shipping address, contact information, and order details. Sellers may also see your product reviews and ratings. We never share your full payment card information with sellers.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Professional Advisors and Authorities:</strong> We may share information with legal advisors, auditors, consultants, and government authorities when necessary for legal compliance, fraud prevention, law enforcement, or to protect our rights and the safety of our users.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your information may be transferred to the acquiring entity or successor. We will notify you of any such transfer and any changes to this Privacy Policy.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Third Parties You Authorize:</strong> We share information with third parties when you explicitly authorize us to do so, such as when you use social media features, connect third-party services, or participate in partner programs.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 5: Your Rights and Choices */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Your Rights and Choices</SectionTitle>
          <SectionContent>
            <Paragraph>
              You have several rights and choices regarding your personal information. We are committed to helping you exercise these rights:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Access and Correction:</strong> You can access and update your account information, including your profile, contact details, and preferences, through your account settings. If you need assistance or want to access information not available in your account, please contact our support team.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Deletion:</strong> You can request deletion of your account and personal information by contacting our support team. We will honor your request subject to legal obligations, such as retaining transaction records for accounting and tax purposes, or information needed for ongoing disputes or fraud prevention.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Marketing Preferences:</strong> You can opt out of marketing communications at any time by:
                </Paragraph>
                <LetteredList>
                  <li>Clicking the "unsubscribe" link in marketing emails</li>
                  <li>Adjusting your notification preferences in your account settings</li>
                  <li>Contacting our support team</li>
                </LetteredList>
                <Paragraph>
                  Note that even if you opt out of marketing communications, we may still send you important transactional and account-related messages.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Cookie Settings:</strong> You can manage cookies and similar technologies through your browser settings or our cookie preference center. For more information, please see our <Link to="/cookies" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Cookie Policy</Link>.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Third-Party Links and Social Logins:</strong> Our platform may contain links to third-party websites or services, and you may choose to sign in using social media accounts. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing information to them.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Do Not Track:</strong> Some browsers offer a "Do Not Track" feature. Currently, we do not respond to Do Not Track signals, but you can still use the privacy controls we provide, such as cookie settings and marketing opt-outs, to manage your privacy preferences.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Required Information:</strong> Some information is required to use certain features of our platform, such as creating an account, placing orders, or receiving customer support. If you choose not to provide required information, you may not be able to access or use those features.
                </Paragraph>
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 6: Children */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Children</SectionTitle>
          <SectionContent>
            <Paragraph>
              Saiisai is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18 without appropriate parental consent.
            </Paragraph>
            <Paragraph>
              If we discover that we have collected information from a child under 18 without proper authorization, we will delete that information promptly. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately using the contact information provided in the "Contact Us" section below.
            </Paragraph>
            <ImportantNotice>
              <Paragraph>
                <strong>Important:</strong> If you are under 18, please do not use EazShop or provide any personal information to us. If you are a parent or guardian, please supervise your children's use of the internet and our services.
              </Paragraph>
            </ImportantNotice>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 7: Data Security and Retention */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>7. Data Security and Retention</SectionTitle>
          <SectionContent>
            <Paragraph>
              We implement administrative, technical, and physical safeguards designed to protect your personal information from unauthorized access, disclosure, alteration, and destruction. These measures include:
            </Paragraph>
            <BulletList>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure payment processing through PCI-DSS compliant payment partners</li>
              <li>Regular security assessments and vulnerability testing</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection and privacy</li>
              <li>Incident response procedures</li>
            </BulletList>
            <Paragraph>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You should also take steps to protect your account, such as using a strong password and not sharing your login credentials.
            </Paragraph>
            <Paragraph>
              <strong>Data Retention:</strong> We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Our retention periods are based on:
            </Paragraph>
            <BulletList>
              <li>The nature of the information and the purpose for which it was collected</li>
              <li>Legal and regulatory requirements (e.g., tax and accounting laws may require us to retain transaction records for several years)</li>
              <li>The need to resolve disputes, enforce agreements, and prevent fraud</li>
              <li>Your account status and preferences</li>
            </BulletList>
            <Paragraph>
              When information is no longer needed, we securely delete or anonymize it. Some information may be retained in backup systems for a limited period before permanent deletion.
            </Paragraph>
            <Paragraph>
              Your information may be stored and processed in cloud infrastructure and may be transferred to or accessed from countries other than your country of residence. We ensure that appropriate legal safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 8: International Transfers */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>8. International Transfers</SectionTitle>
          <SectionContent>
            <Paragraph>
              EazWorld operates globally, and your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your jurisdiction.
            </Paragraph>
            <Paragraph>
              When we transfer your information internationally, we take steps to ensure that appropriate safeguards are in place to protect your data. These safeguards may include:
            </Paragraph>
            <BulletList>
              <li>Standard contractual clauses approved by data protection authorities</li>
              <li>Certification schemes and adequacy decisions</li>
              <li>Other legal mechanisms designed to ensure adequate protection of your information</li>
            </BulletList>
            <Paragraph>
              By using Saiisai, you consent to the transfer of your information to countries outside your country of residence, including countries that may not have the same level of data protection as your home country. We will continue to protect your information in accordance with this Privacy Policy regardless of where it is processed.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 9: Changes to this Privacy Policy */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>9. Changes to this Privacy Policy</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other reasons. When we make changes, we will update the "Effective Date" at the top of this policy.
            </Paragraph>
            <Paragraph>
              For material changes that significantly affect your rights or how we use your information, we will provide additional notice through:
            </Paragraph>
            <BulletList>
              <li>Email notifications to your registered email address</li>
              <li>Prominent notices on our website or mobile app</li>
              <li>Other methods as required by applicable law</li>
            </BulletList>
            <Paragraph>
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information. Your continued use of Saiisai after changes become effective constitutes your acceptance of the updated Privacy Policy.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 10: Contact Us */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>10. Contact Us</SectionTitle>
          <SectionContent>
            <Paragraph>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </Paragraph>
            <BulletList>
              <li>
                <Paragraph>
                  <strong>Email:</strong> privacy@eazworld.com
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Postal Address:</strong><br />
                  EazWorld Data Protection Officer<br />
                  [Address to be updated]<br />
                  Ghana
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Support Center:</strong> You can also reach out through our <Link to={PATHS.SUPPORT} style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>Support Center</Link> for general inquiries.
                </Paragraph>
              </li>
            </BulletList>
            <Paragraph>
              We will respond to your inquiries and requests in a timely manner and in accordance with applicable data protection laws.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        {/* Help Section */}
        <HelpSection variants={staggerItem}>
          <HelpTitle>Need More Help?</HelpTitle>
          <HelpText>
            If you have questions about your privacy or data protection, our support team is here to assist you.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHeadset />
            Contact Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default PrivacyPolicyPage;

