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
  WarningBox,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Terms and Conditions Page
 * Professional legal policy page styled like Temu, Amazon, and Shopify
 */
const TermsPage = () => {
  // Get today's date for "Last Updated"
  const today = new Date();
  const lastUpdatedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SEO
  useDynamicPageTitle({
    title: 'Terms & Service • EazShop',
    description: 'Review the terms and conditions for using EazShop. Understand your rights and responsibilities as a user.',
    keywords: 'terms, conditions, terms of service, EazShop terms, user agreement, service agreement',
    defaultTitle: 'Terms & Service • EazShop',
    defaultDescription: 'Review the terms and conditions for using EazShop.',
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
          <PolicyTitle>Terms & Service</PolicyTitle>
          <LastUpdated>Last Updated: {lastUpdatedDate}</LastUpdated>
          <IntroText>
            Please read these Terms and Conditions carefully before using EazShop. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, you may not access the service.
          </IntroText>
        </PolicyHeader>

        {/* Section 1: Acceptance of Terms */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>1. Acceptance of Terms</SectionTitle>
          <SectionContent>
            <Paragraph>
              By accessing and using EazShop, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Paragraph>
            <Paragraph>
              These Terms apply to all visitors, users, and others who access or use the Service.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 2: Use License */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Use License</SectionTitle>
          <SectionContent>
            <Paragraph>
              Permission is granted to temporarily access the materials on EazShop's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Paragraph>
            <BulletList>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on EazShop's website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </BulletList>
            <Paragraph>
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by EazShop at any time.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 3: User Accounts */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>3. User Accounts</SectionTitle>
          <SectionContent>
            <Paragraph>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </Paragraph>
            <Paragraph>
              You agree not to:
            </Paragraph>
            <BulletList>
              <li>Use a false name or impersonate any person or entity</li>
              <li>Provide false, misleading, or inaccurate information</li>
              <li>Create multiple accounts for fraudulent purposes</li>
              <li>Share your account credentials with others</li>
              <li>Use another user's account without permission</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 4: Products and Services */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Products and Services</SectionTitle>
          <SectionContent>
            <Paragraph>
              EazShop provides a platform for buyers and sellers to transact. We do not manufacture, store, or ship products directly. All products are sold by independent sellers.
            </Paragraph>
            <Paragraph>
              <strong>Product Information:</strong> We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
            </Paragraph>
            <Paragraph>
              <strong>Pricing:</strong> All prices are set by sellers and are subject to change without notice. We reserve the right to refuse or cancel any order at our sole discretion.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 5: Payment Terms */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Payment Terms</SectionTitle>
          <SectionContent>
            <LetteredList>
              <li>
                <Paragraph>
                  <strong>Payment Methods</strong>
                </Paragraph>
                <Paragraph>
                  We accept various payment methods including credit/debit cards, mobile money, and EazShop credit balance. All payments are processed securely through our payment partners.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Payment Processing</strong>
                </Paragraph>
                <Paragraph>
                  By making a purchase, you authorize us to charge your selected payment method for the total amount of your order, including applicable taxes and shipping fees.
                </Paragraph>
              </li>
              <li>
                <Paragraph>
                  <strong>Refunds</strong>
                </Paragraph>
                <Paragraph>
                  Refunds are processed according to our Return & Refund Policy. Processing times may vary depending on your payment method and financial institution.
                </Paragraph>
              </li>
            </LetteredList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 6: Prohibited Uses */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Prohibited Uses</SectionTitle>
          <SectionContent>
            <Paragraph>
              You may not use our service:
            </Paragraph>
            <BulletList>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 7: Intellectual Property */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>7. Intellectual Property</SectionTitle>
          <SectionContent>
            <Paragraph>
              The Service and its original content, features, and functionality are and will remain the exclusive property of EazShop and its licensors. The Service is protected by copyright, trademark, and other laws.
            </Paragraph>
            <Paragraph>
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 8: Limitation of Liability */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>8. Limitation of Liability</SectionTitle>
          <SectionContent>
            <Paragraph>
              In no event shall EazShop, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </Paragraph>
            <ImportantNotice>
              <Paragraph>
                <strong>Important:</strong> EazShop acts as a platform connecting buyers and sellers. We are not responsible for the quality, safety, or legality of products sold by third-party sellers.
              </Paragraph>
            </ImportantNotice>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 9: Indemnification */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>9. Indemnification</SectionTitle>
          <SectionContent>
            <Paragraph>
              You agree to defend, indemnify, and hold harmless EazShop and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 10: Termination */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>10. Termination</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </Paragraph>
            <Paragraph>
              If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 11: Governing Law */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>11. Governing Law</SectionTitle>
          <SectionContent>
            <Paragraph>
              These Terms shall be interpreted and governed by the laws of Ghana, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 12: Changes to Terms */}
        <PolicySection variants={staggerItem}>
          <SectionTitle>12. Changes to Terms</SectionTitle>
          <SectionContent>
            <Paragraph>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </Paragraph>
            <Paragraph>
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        {/* Section 13: Contact Information */}
        <HelpSection variants={staggerItem}>
          <HelpTitle>13. Contact Information</HelpTitle>
          <HelpText>
            If you have any questions about these Terms & Service, please contact us.
          </HelpText>
          <HelpButton
            as={Link}
            to={PATHS.SUPPORT}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaHeadset />
            Contact Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default TermsPage;

