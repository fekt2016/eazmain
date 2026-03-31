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
  BulletList,
  Paragraph,
  HelpSection,
  HelpTitle,
  HelpText,
  HelpButton,
  SectionDivider,
} from './policy.styles';

/**
 * Cookie Policy Page for Saiisai (Buyer App)
 * Explains how we use cookies and similar technologies
 */
const CookiePolicyPage = () => {
  const today = new Date();
  const effectiveDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useDynamicPageTitle({
    title: 'Cookie Policy • Saiisai',
    description: 'Learn how Saiisai uses cookies and similar technologies to improve your experience.',
    keywords: 'cookie policy, cookies, tracking, Saiisai privacy, data protection',
    defaultTitle: 'Cookie Policy • Saiisai',
    defaultDescription: 'Learn how Saiisai uses cookies and similar technologies to improve your experience.',
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
        <PolicyHeader variants={staggerItem}>
          <PolicyTitle>Cookie Policy</PolicyTitle>
          <LastUpdated>Effective Date: {effectiveDate}</LastUpdated>
          <IntroText>
            Saiisai uses cookies and similar technologies to provide, secure, and improve our marketplace. This Cookie Policy explains what cookies we use, why we use them, and how you can manage your preferences. By continuing to use Saiisai, you consent to our use of cookies as described below.
          </IntroText>
        </PolicyHeader>

        <PolicySection variants={staggerItem}>
          <SectionTitle>1. What Are Cookies?</SectionTitle>
          <SectionContent>
            <Paragraph>
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you logged in, analyze traffic, and deliver relevant content. We also use similar technologies such as localStorage, sessionStorage, and pixel tags.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>2. Types of Cookies We Use</SectionTitle>
          <SectionContent>
            <Paragraph>
              We use the following categories of cookies on Saiisai:
            </Paragraph>
            <BulletList>
              <li>
                <strong>Strictly Necessary:</strong> Required for the website to function. These include authentication, security, and load-balancing cookies. They cannot be disabled.
              </li>
              <li>
                <strong>Functional / Preferences:</strong> Remember your settings (e.g. language, region, recently viewed products, wishlist, cart).
              </li>
              <li>
                <strong>Analytics:</strong> Help us understand how visitors use our site (e.g. page views, popular products) via tools like Google Analytics.
              </li>
              <li>
                <strong>Marketing / Advertising:</strong> Used for remarketing and measuring ad performance (e.g. Meta Pixel, TikTok Pixel).
              </li>
              <li>
                <strong>Performance:</strong> Improve site speed and user experience.
              </li>
            </BulletList>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>3. How to Manage Your Preferences</SectionTitle>
          <SectionContent>
            <Paragraph>
              You can manage your cookie preferences at any time. On first visit, our cookie banner lets you:
            </Paragraph>
            <BulletList>
              <li><strong>Accept All:</strong> Enable all cookies including analytics and marketing.</li>
              <li><strong>Essential Only:</strong> Use only strictly necessary cookies.</li>
              <li><strong>Customize:</strong> Choose which categories to allow.</li>
            </BulletList>
            <Paragraph>
              You can also change your choices later via the Cookie Policy link in our footer. Note that limiting cookies may reduce features such as personalized recommendations and ads.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>4. Third-Party Cookies</SectionTitle>
          <SectionContent>
            <Paragraph>
              Third parties (e.g. Google, Meta, TikTok, Paystack) may set cookies when you use Saiisai. These are governed by their own privacy and cookie policies. We only load marketing and analytics tools when you consent to them via our cookie banner.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>5. Updates</SectionTitle>
          <SectionContent>
            <Paragraph>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review it periodically.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <SectionDivider />

        <PolicySection variants={staggerItem}>
          <SectionTitle>6. Contact Us</SectionTitle>
          <SectionContent>
            <Paragraph>
              If you have questions about our use of cookies, please contact us via the <Link to={PATHS.CONTACT}>Contact</Link> page or refer to our <Link to={PATHS.PRIVACY}>Privacy Policy</Link>.
            </Paragraph>
          </SectionContent>
        </PolicySection>

        <HelpSection variants={staggerItem}>
          <HelpTitle>
            <FaHeadset /> Need help?
          </HelpTitle>
          <HelpText>
            For questions about cookies or your privacy choices, visit our Help Center.
          </HelpText>
          <HelpButton as={Link} to={PATHS.HELP}>
            Contact Support
          </HelpButton>
        </HelpSection>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default CookiePolicyPage;
